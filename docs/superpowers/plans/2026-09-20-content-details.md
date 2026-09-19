# Content Details (Part 12.1 & 12.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the detailed views for Publications and Tools, aligning them with the handoff specifications, including a new inline "Request Access" form.

**Architecture:** Extend the Payload CMS schema with a new `Enquiries` collection and missing fields on `Tools`. Update the Next.js App Router pages for `/knowledge-hub/[slug]` and `/tools/[slug]` to render these new fields and handle server actions for form submission.

**Tech Stack:** Next.js (App Router), React, Payload CMS, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-09-20-content-details-design.md`

## Global Constraints

- Never fabricate company work, credentials, or data.
- The `Enquiries` collection should be generic enough to support the site-wide contact form later.

---

### Task 1: Update Publication Detail Route

**Files:**
- Modify: `src/app/(frontend)/knowledge-hub/[slug]/page.tsx`

**Interfaces:**
- Consumes: The existing `Publications` collection data.

- [ ] **Step 1: Modify the hero section to include the author and unverified date notice**

```tsx
// In src/app/(frontend)/knowledge-hub/[slug]/page.tsx, around the date rendering:
            <span>
              {new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              {post.dateVerified === false && ' (date unverified)'}
            </span>
            
            {post.author && (
              <>
                <span className="mx-2 text-white/40">|</span>
                <span>By {post.author}</span>
              </>
            )}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(frontend\)/knowledge-hub/\[slug\]/page.tsx
git commit -m "feat: align publication detail header with spec"
```

---

### Task 2: Add Enquiries CMS Collection

**Files:**
- Create: `src/collections/Enquiries.ts`
- Modify: `src/payload.config.ts`

**Interfaces:**
- Produces: `Enquiries` collection schema for form submissions.

- [ ] **Step 1: Create Enquiries collection**

```typescript
// src/collections/Enquiries.ts
import type { CollectionConfig } from 'payload'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    create: () => true, // Allow public submissions
    read: () => false, // Admin only in reality, or based on user
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text', required: true },
    { name: 'message', type: 'textarea' },
    { name: 'toolRequested', type: 'relationship', relationTo: 'tools' },
    { name: 'source', type: 'text', defaultValue: 'Tool Request' },
  ],
}
```

- [ ] **Step 2: Register in payload.config.ts**

```typescript
// src/payload.config.ts
import { Enquiries } from './collections/Enquiries'
// Add Enquiries to the collections array
```

- [ ] **Step 3: Commit**

```bash
git add src/collections/Enquiries.ts src/payload.config.ts
git commit -m "feat: add Enquiries collection"
```

---

### Task 3: Extend Tools CMS Collection

**Files:**
- Modify: `src/collections/Tools.ts`

**Interfaces:**
- Produces: Enhanced `Tools` collection schema.

- [ ] **Step 1: Add new fields to Tools.ts**

```typescript
// In src/collections/Tools.ts, import standardEditor
import { standardEditor } from '../editorConfig'

// Add inside fields array:
    { name: 'version', type: 'text' },
    {
      name: 'access',
      type: 'select',
      defaultValue: 'Request Access',
      options: [
        { label: 'Request Access', value: 'Request Access' },
        { label: 'Public', value: 'Public' },
        { label: 'Enterprise', value: 'Enterprise' },
      ],
    },
    { name: 'purpose', type: 'richText', editor: standardEditor },
    { name: 'inputs', type: 'richText', editor: standardEditor },
    { name: 'outputs', type: 'richText', editor: standardEditor },
    { name: 'method', type: 'richText', editor: standardEditor },
    { name: 'privacy', type: 'richText', editor: standardEditor },
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/Tools.ts
git commit -m "feat: extend tools schema"
```

---

### Task 4: Build Inline "Request Access" Form

**Files:**
- Create: `src/components/tools/RequestAccessForm.tsx`
- Create: `src/app/(frontend)/tools/[slug]/actions.ts`

**Interfaces:**
- Consumes: `Enquiries` collection via Server Action.

- [ ] **Step 1: Create the Server Action**

```typescript
// src/app/(frontend)/tools/[slug]/actions.ts
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
```

- [ ] **Step 2: Create the Client Form Component**

```tsx
// src/components/tools/RequestAccessForm.tsx
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
    return <div className="p-4 bg-green-50 text-green-800 rounded">Request submitted successfully. We will be in touch.</div>
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/RequestAccessForm.tsx src/app/\(frontend\)/tools/\[slug\]/actions.ts
git commit -m "feat: add request access form component"
```

---

### Task 5: Update Tool Detail Route

**Files:**
- Modify: `src/app/(frontend)/tools/[slug]/page.tsx`

**Interfaces:**
- Consumes: `RequestAccessForm`, updated `Tools` collection.

- [ ] **Step 1: Modify the page layout**

```tsx
// In src/app/(frontend)/tools/[slug]/page.tsx
// Add imports for RichText, jsxConverters, and RequestAccessForm
import { RichText } from '@payloadcms/richtext-lexical/react'
import { jsxConverters } from '@/app/(frontend)/knowledge-hub/[slug]/page' // reuse converters if possible, or copy them
import { RequestAccessForm } from '@/components/tools/RequestAccessForm'

// Inside the component, update the layout to render the new fields:
// Title, Version (if exists)
// Purpose (tool.purpose)
// Inputs & Outputs (tool.inputs, tool.outputs)
// Methodology (tool.method)
// if (tool.access === 'Request Access') <RequestAccessForm toolId={tool.id} />

```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(frontend\)/tools/\[slug\]/page.tsx
git commit -m "feat: complete tool detail layout"
```

