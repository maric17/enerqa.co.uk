'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { z } from 'zod'

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  natureOfEnquiry: z.string().min(1, 'Nature of enquiry is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  marketingConsent: z.boolean().default(false),
  // Honeypot field - should be empty
  website: z.string().max(0, 'Spam detected').optional(),
})

export type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function submitContactForm(prevState: FormState, formData: FormData): Promise<FormState> {
  // Validate honeypot first
  const website = formData.get('website');
  if (website) {
    // Silently reject if honeypot is filled
    return { success: true, message: 'Thanks! Your message has been sent.' };
  }

  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    company: formData.get('company'),
    natureOfEnquiry: formData.get('natureOfEnquiry'),
    message: formData.get('message'),
    marketingConsent: formData.get('marketingConsent') === 'on',
    website: formData.get('website'),
  }

  const validatedFields = contactSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors in the form.'
    }
  }

  const payload = await getPayload({ config: configPromise })
  
  try {
    await payload.create({
      collection: 'enquiries',
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        email: validatedFields.data.email,
        company: validatedFields.data.company,
        natureOfEnquiry: validatedFields.data.natureOfEnquiry,
        message: validatedFields.data.message,
        marketingConsent: validatedFields.data.marketingConsent,
        source: 'Contact Page',
      }
    })
    
    return { success: true, message: 'Your message has been successfully sent. A member of the Enerqa team will be in touch shortly.' }
  } catch (error) {
    console.error('Failed to submit contact form:', error)
    return { success: false, message: 'An unexpected error occurred while saving your enquiry. Please try again later.' }
  }
}
