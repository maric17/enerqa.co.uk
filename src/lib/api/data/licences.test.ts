import { describe, it, expect, vi, afterEach } from 'vitest';
import { isUsable, licenceLine } from './openaq';
import { fetchCountryEmissions, MAX_YEARS } from './climateTrace';
import { fetchDatasetDois } from './gbifOccurrence';
import { resetHealth } from '../core/health';

afterEach(() => {
  vi.unstubAllGlobals();
  resetHealth();
});

describe('OpenAQ licence flags (p. 223, L1062)', () => {
  const base = { id: 1, name: 'CC BY 4.0', commercialUseAllowed: true, redistributionAllowed: true };

  it('requires modification permission as well, because every export is transformed', () => {
    expect(isUsable({ ...base, modificationAllowed: true })).toBe(true);
    expect(isUsable({ ...base })).toBe(false);
    expect(isUsable({ ...base, modificationAllowed: false })).toBe(false);
    expect(isUsable(undefined)).toBe(false);
  });

  it('carries a share-alike obligation into the licence line', () => {
    expect(licenceLine([{ ...base, name: 'CC BY-SA 4.0', shareAlikeRequired: true }])).toMatch(/share-alike/);
    expect(licenceLine([{ ...base }])).toBe('CC BY 4.0');
  });
});

describe('Climate TRACE (p. 218, L1050)', () => {
  it('refuses a year range that would fan out into many upstream calls', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const res = await fetchCountryEmissions({ countries: ['QAT'], since: 1960, to: 2100 });
    expect(res.ok).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(MAX_YEARS).toBeLessThanOrEqual(10);
  });

  it('labels the beta API and records no release it cannot confirm', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([{ country: 'QAT', rank: 1, emissions: { co2e_100yr: 5 } }]), { status: 200 })),
    );
    const res = await fetchCountryEmissions({ countries: ['QAT'], since: 2023, to: 2023 });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.data[0].measureNote).toMatch(/Beta/);
    expect(res.data[0].provenance.version).toBeNull();
    expect(res.data[0].provenance.transformations.join(' ')).toMatch(/does not state the inventory release/);
  });
});

describe('GBIF dataset DOIs (p. 223, L1060)', () => {
  it('looks up each contributing dataset once', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ title: 'Survey', doi: '10.15468/abc' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const key = '50c9509d-22c7-4a22-a47d-8c48425ef4a7';
    const out = await fetchDatasetDois([key, key, 'not-a-key']);
    expect(out).toEqual([{ key, title: 'Survey', doi: '10.15468/abc' }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
