'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'
import {
  EMPTY_CONTACT_VALUES,
  checkChoices,
  contactSchema,
  enquiryTypeLabel,
  readContactForm,
  splitName,
  type ContactFormState,
} from '@/lib/forms/contact'
import { loadContactChoices } from '@/lib/forms/contactChoices'
import { allowSubmission, enquiryLimiter } from '@/lib/forms/limits'
import { getClientKey } from '@/lib/forms/clientKey'

/**
 * Contact enquiry (p. 198 F02-F04, p. 228 form handling).
 *
 * Every non-success reply carries the submitted `values`: React 19 resets a
 * form after its action runs, and p. 198 says to "preserve input on
 * recoverable errors". The success wording is p. 198's own and is true of what
 * happens - the enquiry is saved in the CMS for staff. No email is sent (there
 * is no email adapter), so nothing here claims one was.
 */
export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const attempt = prevState.attempt + 1

  // A filled honeypot is a bot: show the normal success state so it learns
  // nothing, and store nothing.
  if (formData.get('website')) {
    return { status: 'success', attempt, values: EMPTY_CONTACT_VALUES }
  }

  const values = readContactForm(formData)
  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return { status: 'invalid', attempt, values, errors: z.flattenError(parsed.error).fieldErrors }
  }
  const data = parsed.data

  try {
    const payload = await getPayload({ config: configPromise })
    const { ids, ...choices } = await loadContactChoices(payload)

    const choiceErrors = checkChoices(data, choices)
    if (choiceErrors) return { status: 'invalid', attempt, values, errors: choiceErrors }

    // Counted only once the submission is valid, so correcting a mistake never
    // locks a visitor out. Over the limit gets the ordinary F04 error.
    if (!allowSubmission(enquiryLimiter, await getClientKey())) {
      return { status: 'error', attempt, values }
    }

    const { firstName, lastName } = splitName(data.name)
    await payload.create({
      collection: 'enquiries',
      data: {
        firstName,
        lastName,
        email: data.email,
        company: data.organisation || undefined,
        natureOfEnquiry: enquiryTypeLabel(data.enquiryType),
        message: data.message,
        // p. 198: newsletter consent is separate, optional and never a
        // condition of the enquiry.
        marketingConsent: data.newsletterConsent,
        toolRequested: data.enquiryType === 'tool' && data.tool ? ids[`tool:${data.tool}`] : undefined,
        domain: data.domain ? ids[`domain:${data.domain}`] : undefined,
        industry: data.industry ? ids[`industry:${data.industry}`] : undefined,
        projectLocation: data.projectLocation || undefined,
        currentStage: data.currentStage || undefined,
        source: 'Contact Page',
      },
    })
  } catch (error) {
    console.error('Failed to save contact enquiry:', error)
    return { status: 'error', attempt, values }
  }

  return { status: 'success', attempt, values: EMPTY_CONTACT_VALUES }
}
