'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the privacy notice',
  }),
  website: z.string().max(0, 'Spam detected').optional(), // Honeypot
})

export type NewsletterFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function submitNewsletterForm(prevState: NewsletterFormState, formData: FormData): Promise<NewsletterFormState> {
  const website = formData.get('website');
  if (website) {
    return { success: true, message: 'Thanks! You have been subscribed.' };
  }

  const rawData = {
    email: formData.get('email'),
    consent: formData.get('consent') === 'on',
    website: formData.get('website'),
  }

  const validatedFields = newsletterSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please provide a valid email address.'
    }
  }

  const payload = await getPayload({ config: configPromise })
  
  try {
    await payload.create({
      collection: 'enquiries',
      data: {
        firstName: 'Newsletter',
        lastName: 'Subscriber',
        email: validatedFields.data.email,
        natureOfEnquiry: 'Newsletter Subscription',
        message: 'Newsletter subscription request',
        marketingConsent: validatedFields.data.consent,
        source: 'Newsletter Form',
      }
    })
    
    return { success: true, message: 'Thanks! You have been subscribed.' }
  } catch (error) {
    console.error('Failed to subscribe:', error)
    return { success: false, message: 'An unexpected error occurred. Please try again later.' }
  }
}
