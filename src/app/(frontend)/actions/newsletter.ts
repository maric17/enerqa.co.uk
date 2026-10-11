'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { allowSubmission, newsletterLimiter } from '@/lib/forms/limits'
import { getClientKey } from '@/lib/forms/clientKey'
import { NEWSLETTER_SOURCE, saveNewsletterSubscription, deliverPendingEnquiry } from '@/lib/forms/lifecycle'

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
    await saveNewsletterSubscription(payload, validatedFields.data.email)
  } catch {
    // p. 228: delivery-error handling - an honest message, never a fake success.
    console.error('Failed to subscribe.')
    return { success: false, values, message: 'We could not save your subscription just now. Please try again later.' }
  }

  // Outside the try: redirect() works by throwing, which the catch would swallow.
  redirect('/newsletter/confirm')
}

export type UnsubscribeFormState = {
  done: boolean;
  message?: string;
  /** Refill the address after a recoverable error, including React's form reset. */
  values?: { email: string };
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

  const values = { email: String(formData.get('email') ?? '').trim() }
  const parsed = z.string().email().max(254).safeParse(values.email)
  if (!parsed.success) {
    return { done: false, values, message: 'Please enter a valid email address.' }
  }

  // Unsubscribing writes to the CMS too, so it shares the newsletter limit.
  if (!allowSubmission(newsletterLimiter, await getClientKey())) {
    return { done: false, values, message: 'We could not process this just now. Please try again later, or email info@enerqa.co.uk.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const email = parsed.data.toLowerCase()
    // Case-insensitive lookup also covers old mixed-case records. Filter exact addresses
    // before updating: Payload's "like" is a substring search, not an identity check.
    let page = 1
    let more = true
    let foundSubscription = false
    while (more) {
      const matches = await payload.find({ collection: 'enquiries', where: { email: { like: email } }, limit: 100, page, depth: 0 })
      for (const match of matches.docs) {
        if (match.email.toLowerCase() !== email) continue
        const newsletter = match.source === NEWSLETTER_SOURCE
        const doc = await payload.update({ collection: 'enquiries', id: match.id,
          // Q2: newsletter records become minimal suppression records. Enquiries retain their own lawful basis.
          data: newsletter ? { marketingConsent: false, firstName: 'Newsletter', lastName: 'Subscriber', company: null, message: '', natureOfEnquiry: null,
            toolRequested: null, domain: null, industry: null, projectLocation: null, currentStage: null, newsletterSyncedAt: null } : { marketingConsent: false },
        })
        if (newsletter) { foundSubscription = true; await deliverPendingEnquiry(payload, doc) }
      }
      more = matches.hasNextPage
      page++
    }
    // Also queue suppression for a provider-only subscriber, without revealing membership.
    if (!foundSubscription) {
      const suppression = await payload.create({ collection: 'enquiries', data: { firstName: 'Newsletter', lastName: 'Subscriber', email, source: NEWSLETTER_SOURCE, marketingConsent: false, message: '' } })
      await deliverPendingEnquiry(payload, suppression)
    }
  } catch {
    console.error('Failed to unsubscribe.')
    return { done: false, values, message: 'We could not process this just now. Please try again later, or email info@enerqa.co.uk.' }
  }

  return { done: true }
}
