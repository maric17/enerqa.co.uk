'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { allowSubmission, newsletterLimiter } from '@/lib/forms/limits'
import { getClientKey } from '@/lib/forms/clientKey'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address.').max(254, 'Please enter a valid email address.'),
  consent: z.boolean().refine(val => val === true, {
    message: 'Please tick the box to confirm you want to receive the newsletter.',
  }),
  website: z.string().max(0, 'Spam detected').optional(), // Honeypot
})

export type NewsletterFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  /**
   * What the visitor submitted, returned on every error. React 19 resets a
   * form after its action, so a form that wants to keep the typed address
   * (p. 198 "preserve input on recoverable errors") re-renders it from here.
   */
  values?: { email: string; consent: boolean };
}

/** Newsletter signups share the Enquiries collection; this tag tells them apart. */
const NEWSLETTER_SOURCE = 'Newsletter Form'

export async function submitNewsletterForm(prevState: NewsletterFormState, formData: FormData): Promise<NewsletterFormState> {
  // A filled honeypot is a bot. Send it to the same confirmation page a person
  // would see, so it learns nothing, but store nothing (p. 228 spam protection).
  if (formData.get('website')) {
    redirect('/newsletter/confirm')
  }

  const rawData = {
    email: String(formData.get('email') ?? '').trim(),
    consent: formData.get('consent') === 'on',
    website: String(formData.get('website') ?? ''),
  }

  const values = { email: rawData.email, consent: rawData.consent }
  const validatedFields = newsletterSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    return {
      success: false,
      errors,
      values,
      // Say which field is wrong. The old message blamed the email address even
      // when the real problem was the missing consent tick.
      message: errors.email?.[0] ?? errors.consent?.[0] ?? 'Please check the form and try again.',
    }
  }

  // p. 228 spam protection. Counted only once the submission is valid, so
  // fixing a typo never locks anyone out.
  if (!allowSubmission(newsletterLimiter, await getClientKey())) {
    return { success: false, values, message: 'We could not save your subscription just now. Please try again later.' }
  }

  try {
    // Inside the try: an unreachable CMS is a delivery error, not a crash.
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'enquiries',
      data: {
        firstName: 'Newsletter',
        lastName: 'Subscriber',
        email: validatedFields.data.email,
        natureOfEnquiry: 'Newsletter Subscription',
        message: 'Newsletter subscription request',
        marketingConsent: validatedFields.data.consent,
        source: NEWSLETTER_SOURCE,
      }
    })
  } catch (error) {
    // p. 228: delivery-error handling - an honest message, never a fake success.
    console.error('Failed to subscribe:', error)
    return { success: false, values, message: 'We could not save your subscription just now. Please try again later.' }
  }

  // Outside the try: redirect() works by throwing, which the catch would swallow.
  redirect('/newsletter/confirm')
}

export type UnsubscribeFormState = {
  done: boolean;
  message?: string;
}

/**
 * Unsubscribe (p. 4 "transactional state").
 *
 * Withdraws marketing consent on every newsletter record for the address. The
 * reply is the same whether or not the address was on the list, so the form
 * cannot be used to find out who subscribes.
 */
export async function unsubscribeNewsletter(prevState: UnsubscribeFormState, formData: FormData): Promise<UnsubscribeFormState> {
  if (formData.get('website')) return { done: true }

  const parsed = z.string().email().max(254).safeParse(String(formData.get('email') ?? '').trim())
  if (!parsed.success) {
    return { done: false, message: 'Please enter a valid email address.' }
  }

  // Unsubscribing writes to the CMS too, so it shares the newsletter limit.
  if (!allowSubmission(newsletterLimiter, await getClientKey())) {
    return { done: false, message: 'We could not process this just now. Please try again later, or email info@enerqa.co.uk.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'enquiries',
      where: {
        and: [
          { email: { equals: parsed.data } },
          { source: { equals: NEWSLETTER_SOURCE } },
        ],
      },
      data: { marketingConsent: false },
    })
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    return { done: false, message: 'We could not process this just now. Please try again later, or email info@enerqa.co.uk.' }
  }

  return { done: true }
}
