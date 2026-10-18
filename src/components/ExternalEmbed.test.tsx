import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ExternalEmbed } from './ExternalEmbed'
import { saveConsent } from '@/lib/consent'

const SRC = 'https://www.gapminder.org/tools/?embedded=true'

beforeEach(() => localStorage.clear())

describe('ExternalEmbed (p. 208 U03: third-party content waits for consent)', () => {
  it('loads nothing from the other site until the visitor chooses', () => {
    const { container } = render(<ExternalEmbed src={SRC} title="Gapminder Tools" />)
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText(/gapminder\.org/, { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open on gapminder\.org/ })).toHaveAttribute('href', SRC)
  })

  it('loads this one embed when the visitor clicks Load', () => {
    const { container } = render(<ExternalEmbed src={SRC} title="Gapminder Tools" />)
    fireEvent.click(screen.getByRole('button', { name: 'Load content – Gapminder Tools' }))
    const frame = container.querySelector('iframe')
    expect(frame).toHaveAttribute('src', SRC)
    expect(frame).toHaveAttribute('title', 'Gapminder Tools')
    expect(frame).toHaveAttribute('loading', 'lazy')
  })

  it('loads straight away when the visitor has allowed embeds in Cookie Choices', () => {
    saveConsent({ embeds: true })
    const { container } = render(<ExternalEmbed src={SRC} title="Gapminder Tools" />)
    expect(container.querySelector('iframe')).toHaveAttribute('src', SRC)
  })
})
