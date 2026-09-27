import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CONSENT_KEY, embedsAllowed, saveConsent } from './consent'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('consent storage (p. 208 U03)', () => {
  it('treats a visitor who has chosen nothing as "no embeds"', () => {
    expect(embedsAllowed()).toBe(false)
  })

  it('remembers a saved choice, and a withdrawn one', () => {
    saveConsent({ embeds: true })
    expect(embedsAllowed()).toBe(true)
    saveConsent({ embeds: false })
    expect(embedsAllowed()).toBe(false)
  })

  it('treats unreadable or foreign values as "no embeds"', () => {
    localStorage.setItem(CONSENT_KEY, 'not json')
    expect(embedsAllowed()).toBe(false)
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ embeds: 'yes' }))
    expect(embedsAllowed()).toBe(false)
  })

  it('falls back to "no embeds" when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(embedsAllowed()).toBe(false)
  })
})
