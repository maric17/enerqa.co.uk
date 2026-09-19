'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function submitToolRequest(formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  
  try {
    await payload.create({
      collection: 'enquiries',
      data: {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        message: formData.get('message') as string,
        toolRequested: formData.get('toolId') as string,
        source: 'Tool Request',
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to submit request' }
  }
}
