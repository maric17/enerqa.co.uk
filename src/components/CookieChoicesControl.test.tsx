import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CookieChoicesControl } from './CookieChoicesControl'
import { ExternalEmbed } from './ExternalEmbed'
import { embedsAllowed } from '@/lib/consent'

const SRC = 'https://tool.example.org/app'

// The control and an embed side by side: p. 208 U03 says the control must
// change what actually loads, not just describe a setting.
const renderBoth = () =>
  render(
    <>
      <CookieChoicesControl />
      <ExternalEmbed src={SRC} title="Example tool" />
    </>,
  )

beforeEach(() => localStorage.clear())

describe('CookieChoicesControl (p. 208 U03)', () => {
  it('starts with embeds switched off', () => {
    renderBoth()
    expect(screen.getByRole('checkbox', { name: /embedded third-party content/i })).not.toBeChecked()
  })

  it('allowing embeds saves the choice and loads the embed', () => {
    const { container } = renderBoth()
    fireEvent.click(screen.getByRole('checkbox', { name: /embedded third-party content/i }))
    expect(embedsAllowed()).toBe(true)
    expect(container.querySelector('iframe')).toHaveAttribute('src', SRC)
    expect(screen.getByRole('status')).toHaveTextContent(/saved/i)
  })

  it('withdrawing consent stops the embed loading', () => {
    const { container } = renderBoth()
    const box = screen.getByRole('checkbox', { name: /embedded third-party content/i })
    fireEvent.click(box)
    fireEvent.click(box)
    expect(embedsAllowed()).toBe(false)
    expect(container.querySelector('iframe')).toBeNull()
  })
})
