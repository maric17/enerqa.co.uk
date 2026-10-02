import React from 'react'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Header } from './Header'
import { LanguageProvider } from './LanguageProvider'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => '/about',
  useRouter: () => ({ push }),
}))
// Plain elements: the real next/link and next/image need the Next runtime.
vi.mock('next/link', () => ({
  default: ({ href, children, prefetch: _prefetch, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt, fill: _fill, priority: _priority, sizes: _sizes, ...rest }: any) => <img src={src} alt={alt} {...rest} />,
}))

const renderHeader = () =>
  render(
    <LanguageProvider>
      <Header />
    </LanguageProvider>,
  )

const domainsTrigger = () => screen.getByRole('button', { name: /Domains and Industries/ })

beforeEach(() => {
  push.mockClear()
  document.documentElement.lang = 'en'
  document.documentElement.dir = 'ltr'
  document.body.dataset.lang = 'en'
})

describe('Header navigation (p. 7)', () => {
  it('has six primary items, starting with Home and using the label "About"', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const items = nav.querySelectorAll(':scope > .nav-item > a, :scope > .nav-item > button')
    const labels = Array.from(items).map((el) => el.querySelector('.en')?.textContent).filter(Boolean)
    expect(labels).toEqual(['Home', 'Domains and Industries', 'Knowledge Hub', 'Data Portal', 'Tools', 'About'])
  })

  it('puts no heading before the page H1 (the Featured card used an <h5>)', () => {
    const { container } = renderHeader()
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
  })

  it('keeps the Data Portal link and opens an Explorer submenu with keyboard support', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: /Data Portal/ })).toHaveAttribute('href', '/data-portal')
    const toggle = within(nav).getByRole('button', { name: 'Data Portal submenu' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const explorer = within(document.getElementById('mega-menu-data-portal')!).getByRole('link', { name: 'Data Explorer' })
    expect(explorer).toHaveAttribute('href', '/data-portal/explorer')
    explorer.focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(toggle)
    const mobile = document.getElementById('mobile-nav')!
    expect(mobile.querySelector('a[href="/data-portal/explorer"]')).toHaveTextContent('Data Explorer')
  })

  it('toggles the mega menu by click and pins a hover-opened menu instead of closing it', () => {
    renderHeader()
    const trigger = domainsTrigger()
    const item = trigger.parentElement as HTMLElement

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    // Mouse hover opens; a click in the same tick must keep it open.
    fireEvent.pointerEnter(item, { pointerType: 'mouse' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('ignores touch "hover", so a tap opens the menu and keeps it open', () => {
    renderHeader()
    const trigger = domainsTrigger()
    fireEvent.pointerEnter(trigger.parentElement as HTMLElement, { pointerType: 'touch' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('returns focus to the trigger when Escape is pressed inside the panel', () => {
    renderHeader()
    const trigger = domainsTrigger()
    fireEvent.click(trigger)
    const firstLink = within(document.getElementById('mega-menu-domains') as HTMLElement).getAllByRole('link')[0]
    firstLink.focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(trigger)
  })

  it('offers About as a labelled mobile group, like on desktop', () => {
    renderHeader()
    const mobile = document.getElementById('mobile-nav') as HTMLElement
    const groups = Array.from(mobile.querySelectorAll('details > summary')).map((s) => s.textContent)
    expect(groups).toEqual(['Domains and Industries', 'Data Portal', 'About'])
  })

  it('returns focus to the menu button when the mobile menu closes', () => {
    renderHeader()
    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    expect(document.activeElement).toHaveAttribute('aria-label', 'Close menu')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(menuButton)
  })
})

describe('Header search dialog (p. 228)', () => {
  it('is a named modal dialog that takes focus and gives it back on Escape', () => {
    renderHeader()
    const searchButton = screen.getByRole('button', { name: 'Search' })
    searchButton.focus()
    fireEvent.click(searchButton)

    const dialog = document.querySelector('[role="dialog"][aria-label="Search Enerqa"]') as HTMLElement
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(document.activeElement).toBe(within(dialog).getByRole('textbox', { name: 'Search' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(searchButton)
  })

  it('sends Enter to the full search page', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const input = document.querySelector('.search-panel input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'solar feasibility' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(push).toHaveBeenCalledWith('/search?q=solar%20feasibility')
  })
})

describe('Language toggle (p. 8, p. 227)', () => {
  it('exposes the pressed state', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Arabic' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps the English page and explains that Arabic is not available yet', () => {
    renderHeader()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Arabic' }))
    })
    expect(screen.getByRole('status')).toHaveTextContent('Arabic is not available yet')
    // No lang="ar" dir="rtl" over English text, and span.en content stays visible.
    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.body.dataset.lang).toBe('en')
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
