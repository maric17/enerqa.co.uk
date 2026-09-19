'use client'

import React, { useState } from 'react'
import { submitToolRequest } from '@/app/(frontend)/tools/[slug]/actions'
import { Button } from '@/components/ui/Button'

export function RequestAccessForm({ toolId }: { toolId: string }) {
  const [submitted, setSubmitted] = useState(false)

  async function action(formData: FormData) {
    formData.append('toolId', toolId)
    const result = await submitToolRequest(formData)
    if (result.success) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 text-green-800 rounded">
        Request submitted successfully. We will be in touch.
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md mt-6">
      <h3 className="text-xl font-bold">Request Access</h3>
      <input type="text" name="name" placeholder="Full Name" required className="border p-2 rounded" />
      <input type="email" name="email" placeholder="Work Email" required className="border p-2 rounded" />
      <input type="text" name="company" placeholder="Company" required className="border p-2 rounded" />
      <textarea name="message" placeholder="How do you plan to use this tool? (Optional)" className="border p-2 rounded" rows={3}></textarea>
      <Button type="submit">Request Access</Button>
    </form>
  )
}
