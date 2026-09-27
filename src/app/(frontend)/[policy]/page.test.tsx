import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stand-ins for the Next runtime and the CMS.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))
vi.mock('@payloadcms/richtext-lexical/react', () => ({ RichText: () => <div data-testid="approved-text" /> }))

// Approved rows in the CMS for this test; everything else is a draft.
let approved: { slug: string; approvedOn: string; updatedAt: string; content: object }[] = []
vi.mock('@/lib/policies', async () => {
  const { POLICY_PAGES } = await import('@/collections/Policies')
  return {
    getPublishedPolicies: async () => approved,
    getPublishedPolicyLinks: async () =>
      POLICY_PAGES.filter((p) => approved.some((d) => d.slug === p.slug)).map((p) => ({ label: p.title, href: `/${p.slug}` })),
  }
})

import PolicyPage from './page'

const row = (slug: string) => ({ slug, approvedOn: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-05T00:00:00.000Z', content: {} })
const renderPolicy = async (policy: string) => render(await PolicyPage({ params: Promise.resolve({ policy }) }))

beforeEach(() => {
  approved = []
})

describe('policy pages (pp. 4, 208)', () => {
  it('404s while the text is not approved (U02), and for unknown slugs', async () => {
    await expect(renderPolicy('privacy')).rejects.toThrow('NEXT_NOT_FOUND')
    approved = [row('privacy')]
    await expect(renderPolicy('privacy-policy')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('shows approved text under the p. 208 title, dated by the approval (U01)', async () => {
    approved = [row('privacy')]
    await renderPolicy('privacy')
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Notice' })).toBeInTheDocument()
    expect(screen.getByTestId('approved-text')).toBeInTheDocument()
    expect(screen.getByText('1 October 2026')).toBeInTheDocument()
  })

  it('gives privacy and accessibility a working contact route (U03)', async () => {
    approved = [row('privacy'), row('accessibility'), row('terms')]
    for (const slug of ['privacy', 'accessibility']) {
      const { unmount } = await renderPolicy(slug)
      expect(screen.getByRole('link', { name: 'info@enerqa.co.uk' }).getAttribute('href')).toMatch(/^mailto:info@enerqa\.co\.uk/)
      expect(screen.getByRole('link', { name: 'contact form' })).toHaveAttribute('href', '/contact')
      unmount()
    }
    await renderPolicy('terms')
    expect(screen.queryByRole('link', { name: 'info@enerqa.co.uk' })).toBeNull()
  })

  it('puts the real consent control on Cookie Choices (U03)', async () => {
    approved = [row('cookie-choices')]
    await renderPolicy('cookie-choices')
    expect(screen.getByRole('checkbox', { name: /embedded third-party content/i })).toBeInTheDocument()
  })

  it('links only approved sibling policies', async () => {
    approved = [row('privacy'), row('terms')]
    await renderPolicy('privacy')
    const nav = screen.getByRole('navigation', { name: 'Policies' })
    expect([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/terms', '/privacy'])
  })
})
