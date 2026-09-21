import { describe, it, expect } from 'vitest';
import {
  matchesBasket,
  getBasket,
  isAllowedDomain,
  normaliseUrl,
  isPlausibleDate,
  applyGate,
  type NewsItem,
} from './types';

/**
 * These are real headlines returned by the live providers while this connector
 * was being built. NewsData's free `/latest` endpoint applies the `q` filter
 * loosely, so the relevance rules in types.ts are the only thing standing
 * between the homepage and a rapper's mural. Keep the failing examples here:
 * they are the reason the rules look the way they do.
 */
const stub = (title: string, summary = '', over: Partial<NewsItem> = {}): NewsItem => ({
  id: over.url ?? title,
  title,
  summary,
  url: over.url ?? 'https://www.reuters.com/x',
  domain: 'reuters.com',
  publisher: 'Reuters',
  publishedAt: new Date().toISOString(),
  language: 'en',
  provider: 'newsdata',
  providerLabel: 'Example',
  retrievedAt: new Date().toISOString(),
  rights: 'rights string',
  regions: ['Global'],
  ...over,
});

describe('relevance filtering', () => {
  const all = getBasket('all');

  const REJECTED: [string, string][] = [
    ["Oracle's $18 billion data center debt under pressure, FT reports", 'loans quoted by syndicate banks including Santander and Jefferies'],
    ['Louisiana woman faces charges after 17 cats found dead in extreme-heat', 'cats found dead amid dangerously hot conditions with no water'],
    ['Mural of rapper Macklemore painted in Gaza after Sheeran tour furore', 'Artists in Gaza have painted a mural on a slab of concrete'],
    ["Tasma Walton: 'I understand what it's like to be powerless'", 'The actor and writer on her Perth homecoming'],
    ['A weekend bursting at the seams with derbies', 'a gala weekend of derby games'],
    ["'Clear retribution': dismay as key Alzheimer's study cancelled", 'funding cuts that target DEI could delay diagnoses'],
  ];

  it.each(REJECTED)('rejects off-topic story: %s', (title, summary) => {
    expect(matchesBasket(stub(title, summary), all)).toBe(false);
  });

  const ACCEPTED: [string, string][] = [
    ["Australia's renewables transition is well under way", 'a goal of 82% renewable energy and planned solar and wind projects'],
    ["Australia's big polluters rely on carbon offsets for climate credibility", 'Credits are treated as a swap for emissions'],
    ['What goes into diesel prices?', 'The price of distillate fuel oil, driven by crude oil and retail margins'],
    ['New England natural gas prices have been trading near record discounts', 'spot prices traded below the national benchmark'],
    ['Top US power grid operator urges big users to curb demand amid heat', 'PJM asked large consumers to reduce electricity demand'],
    ['United States on track for record crude oil production in 2026', 'We forecast US crude oil production will average a record'],
    ['Corpus Christi LNG expansion makes facility the second-largest in the US', 'The expansion raises liquefaction capacity'],
    ['US veterans have greater levels of Pfas in their blood than civilians', 'Soil and water around military bases show elevated Pfas pollution'],
  ];

  it.each(ACCEPTED)('accepts on-topic story: %s', (title, summary) => {
    expect(matchesBasket(stub(title, summary), all)).toBe(true);
  });

  it('does not treat a word as a match inside a longer word', () => {
    // "powerless" must not satisfy the Energy keyword "power".
    expect(matchesBasket(stub("I understand what it's like to be powerless"), getBasket('energy'))).toBe(false);
    // ...while real inflections still match.
    expect(matchesBasket(stub('Global emissions fell last year', 'carbon emissions'), getBasket('climate'))).toBe(true);
  });

  it('anchors on the headline, not a passing mention in the summary', () => {
    expect(
      matchesBasket(stub('Local restaurant reopens after refurbishment', 'the kitchen now recycles its water'), all),
    ).toBe(false);
  });

  it('routes an article to the right basket', () => {
    const diesel = stub('What goes into diesel prices?', 'driven by crude oil, retail margins and distribution costs');
    expect(matchesBasket(diesel, getBasket('business'))).toBe(true);
    expect(matchesBasket(diesel, getBasket('environment'))).toBe(false);
  });
});

describe('source allowlist', () => {
  it('accepts approved domains and their subdomains', () => {
    expect(isAllowedDomain('reuters.com')).toBe(true);
    expect(isAllowedDomain('eea.europa.eu')).toBe(true); // subdomain of europa.eu
  });

  it('rejects a lookalike domain', () => {
    // A plain endsWith() check would wrongly accept this.
    expect(isAllowedDomain('notreuters.com')).toBe(false);
    expect(isAllowedDomain('example.com')).toBe(false);
    expect(isAllowedDomain('')).toBe(false);
  });
});

describe('url normalisation', () => {
  it('removes tracking parameters', () => {
    expect(normaliseUrl('https://www.reuters.com/a?utm_source=twitter&fbclid=x')).toBe(
      'https://www.reuters.com/a',
    );
  });

  it('keeps parameters that identify the article', () => {
    // EIA addresses articles by query string. Stripping it would collapse the
    // whole feed onto one deduplication key.
    const a = normaliseUrl('https://www.eia.gov/todayinenergy/detail.php?id=68164');
    const b = normaliseUrl('https://www.eia.gov/todayinenergy/detail.php?id=68165');
    expect(a).not.toBe(b);
  });
});

describe('publication date validation', () => {
  it('rejects missing, future and stale dates', () => {
    expect(isPlausibleDate(null)).toBe(false);
    expect(isPlausibleDate('not a date')).toBe(false);
    expect(isPlausibleDate(new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString())).toBe(false);
    expect(isPlausibleDate(new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString())).toBe(false);
  });

  it('accepts a recent date', () => {
    expect(isPlausibleDate(new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString())).toBe(true);
  });
});

describe('post-ingestion gate', () => {
  it('drops disallowed domains, duplicates and excess items from one publisher', () => {
    const items = [
      stub('One', '', { url: 'https://www.reuters.com/1' }),
      stub('One again', '', { url: 'https://www.reuters.com/1?utm_source=x' }), // same article
      stub('Two', '', { url: 'https://www.reuters.com/2' }),
      stub('Three', '', { url: 'https://www.reuters.com/3' }), // over the cap
      stub('Blocked', '', { url: 'https://example.com/4', domain: 'example.com' }),
    ];

    const gated = applyGate(items, { maxPerPublisher: 2 });
    expect(gated.map((i) => i.title)).toEqual(['One', 'Two']);
  });
});
