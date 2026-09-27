import { describe, it, expect, vi } from 'vitest'

// The collection's hook imports next/cache, which needs the Next runtime.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { Policies, POLICY_PAGES, publishedPoliciesWhere, requiredWhenApproved } from './Policies'

describe('Policies (p. 208)', () => {
  it('uses the four p. 208 U01 titles', () => {
    expect(POLICY_PAGES.map((p) => p.title)).toEqual([
      'Terms of Use',
      'Privacy Notice',
      'Cookie Choices',
      'Accessibility Statement',
    ])
  })

  it('cannot be approved without a named approver and date (U02)', () => {
    expect(requiredWhenApproved('', { siblingData: { approved: true } })).toMatch(/required/i)
    expect(requiredWhenApproved(null, { siblingData: { approved: true } })).toMatch(/required/i)
    expect(requiredWhenApproved('Jane Doe, Director', { siblingData: { approved: true } })).toBe(true)
    // Drafts can be saved half-filled.
    expect(requiredWhenApproved('', { siblingData: { approved: false } })).toBe(true)
  })

  it('shows anonymous API readers approved policies only', () => {
    const read = Policies.access!.read as (args: { req: { user: unknown } }) => unknown
    expect(read({ req: { user: null } })).toEqual(publishedPoliciesWhere)
    expect(read({ req: { user: { id: 1 } } })).toBe(true)
  })
})
