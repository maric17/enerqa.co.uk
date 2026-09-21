'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function submitToolRequest(formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  
  try {
    await payload.create({
      collection: 'enquiries',
      data: {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        message: formData.get('message') as string,
        toolRequested: parseInt(formData.get('toolId') as string, 10),
        source: 'Tool Request',
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to submit request' }
  }
}
