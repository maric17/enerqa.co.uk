import { describe, it, expect } from 'vitest'
import { breadcrumbTrail, templateHasOwnTrail } from './FooterBreadcrumbs'

// Handoff p. 4 / p. 8: breadcrumbs name the current section and its parent page
// and never link to a page that does not exist. The old trail linked /domains,
// /industries, /data-portal/datasets, /data-portal/dashboards and /newsletter.
const DEAD_PARENTS = ['/domains', '/industries', '/data-portal/datasets', '/data-portal/dashboards', '/newsletter']

const hrefs = (path: string) => (breadcrumbTrail(path) ?? []).map((c) => c.href).filter(Boolean)

describe('breadcrumbTrail', () => {
  it('shows no trail on the homepage', () => {
    expect(breadcrumbTrail('/')).toBeNull()
  })

  it('puts a domain page under Domains and Industries with its real "&" title', () => {
    expect(breadcrumbTrail('/domains/energy-systems-transition')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Domains and Industries', href: '/domains-and-industries' },
      { label: 'Energy Systems & Transition' },
    ])
  })

  it('puts an industry page under Domains and Industries with its real title', () => {
    const trail = breadcrumbTrail('/industries/oil-gas-petrochemicals')
    expect(trail?.[1]).toEqual({ label: 'Domains and Industries', href: '/domains-and-industries' })
    expect(trail?.[2]).toEqual({ label: 'Oil, Gas & Petrochemicals' })
  })

  it('names sub-pages by their sitemap titles and parents (p. 3)', () => {
    expect(breadcrumbTrail('/project-development')?.map((c) => c.label)).toEqual([
      'Home',
      'Domains and Industries',
      'Project Development and Lifecycle Support',
    ])
    expect(breadcrumbTrail('/knowledge-hub/global-intelligence')?.map((c) => c.label)).toEqual([
      'Home',
      'Knowledge Hub',
      'Global Intelligence',
    ])
    expect(breadcrumbTrail('/data-portal/sources')?.[1]).toEqual({ label: 'Data Portal', href: '/data-portal' })
    // The explorer has no in-page trail; its footer must still identify the real page and parent.
    expect(breadcrumbTrail('/data-portal/explorer')).toEqual([
      { label: 'Home', href: '/' }, { label: 'Data Portal', href: '/data-portal' }, { label: 'Enerqa Data Explorer' },
    ])
  })

  it('links detail templates to their real section page only', () => {
    expect(hrefs('/data-portal/datasets/global-co2-emissions')).toEqual(['/', '/data-portal'])
    expect(hrefs('/data-portal/dashboards/any-dashboard')).toEqual(['/', '/data-portal'])
    expect(hrefs('/tools/esg-readiness')).toEqual(['/', '/tools'])
    expect(hrefs('/knowledge-hub/some-publication')).toEqual(['/', '/knowledge-hub'])
  })

  it('never links a parent that 404s', () => {
    const paths = [
      '/domains/climate-action-carbon-management',
      '/industries/energy-utilities',
      '/data-portal/datasets/x',
      '/data-portal/dashboards/x',
      '/newsletter/confirm',
      '/newsletter/unsubscribe',
      '/tools/easysolar',
    ]
    for (const path of paths) {
      for (const href of hrefs(path)) expect(DEAD_PARENTS).not.toContain(href)
    }
  })

  it('gives unknown URLs no made-up trail', () => {
    expect(breadcrumbTrail('/this-page-does-not-exist')).toBeNull()
    expect(breadcrumbTrail('/domains/not-a-domain/extra')).toBeNull()
  })

  it('ignores a trailing slash', () => {
    expect(breadcrumbTrail('/about/')).toEqual([{ label: 'Home', href: '/' }, { label: 'About' }])
  })
})

// One breadcrumb landmark per page: the footer trail steps aside where the
// template already renders its own at the top.
describe('templateHasOwnTrail', () => {
  it('is true for templates with an in-page breadcrumb', () => {
    for (const path of ['/tools', '/tools/esg-readiness', '/domains/energy-systems-transition', '/industries/energy-utilities', '/about', '/about/careers', '/tools/', '/knowledge-hub', '/knowledge-hub/', '/knowledge-hub/some-publication', '/knowledge-hub/global-intelligence', '/data-portal/datasets/x', '/data-portal/dashboards/x', '/data-portal/sources', '/data-portal/occurrences', '/data-portal/series/air-quality', '/privacy', '/terms', '/cookie-choices', '/accessibility']) {
      expect(templateHasOwnTrail(path)).toBe(true)
    }
  })

  it('is false where only the footer trail exists', () => {
    for (const path of ['/', '/contact', '/data-portal', '/data-portal/explorer', '/project-development', '/domains/x/y']) {
      expect(templateHasOwnTrail(path)).toBe(false)
    }
  })

  it('suppresses fallback trails on missing record URLs and trailing-slash detail routes', () => {
    // A missing record renders a 404, so the footer must not invent a parent-only trail.
    for (const path of ['/knowledge-hub/missing-record/', '/data-portal/datasets/missing-record/', '/data-portal/dashboards/missing-record/']) {
      expect(templateHasOwnTrail(path)).toBe(true)
    }
  })
})
