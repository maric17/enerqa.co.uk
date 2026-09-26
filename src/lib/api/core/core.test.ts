import { describe, it, expect, vi, afterEach } from 'vitest';
import { commentLine, escapeCell, seriesToCsv } from './csv';
import { buildProvenance, isPublishable, publishableOnly, sourceLabel } from './provenance';
import { providerKey } from './fetch';
import { PROVIDERS, enabledProviders, providerEnabled } from './registry';
import { isDoiResolver, preferredReadUrl } from './urls';
import type { DataSeries } from './types';

/**
 * These cover the rules from pp. 226-227 that are easy to break silently:
 * missing values must not become zeros, unverified records must not publish,
 * and an export must carry its own provenance.
 */

const series: DataSeries = {
  id: 'test',
  label: 'Test series, "quoted"',
  unit: 't CO2e',
  frequency: 'annual',
  measureNote: 'CO2e, 100-year GWP',
  area: 'Qatar',
  observations: [
    { period: '2020', value: 41.2 },
    { period: '2021', value: null },
    { period: '2022', value: 0 },
  ],
  provenance: buildProvenance('world-bank-indicators', {
    sourceUrl: 'https://data.worldbank.org/x',
    observationPeriod: '2020–2022',
    sourceReleasedAt: '2026-07-13',
    accessStatus: 'verified_open',
    transformations: ['Grouped rows by country'],
  }),
};

describe('CSV export (p. 227)', () => {
  const csv = seriesToCsv([series], 'countries=QAT');
  const dataRows = csv.split('\n').filter((l) => l && !l.startsWith('#') && !l.startsWith('series,'));

  it('carries attribution, licence, methodology and retrieval time', () => {
    expect(csv).toContain('# Attribution:');
    expect(csv).toContain('# Licence:');
    expect(csv).toContain('# Methodology:');
    expect(csv).toContain('# Retrieved by Enerqa:');
    expect(csv).toContain('# Source released: 2026-07-13');
  });

  it('records the transformations applied', () => {
    expect(csv).toContain('Grouped rows by country');
  });

  it('records the filter that produced the file', () => {
    expect(csv).toContain('# Filter applied: countries=QAT');
  });

  // The label deliberately contains a comma, so these assert on the row text
  // rather than split(',') - which would mis-index across the quoted field.
  it('writes a missing value as an empty cell, never as zero', () => {
    const missing = dataRows.find((r) => r.includes(',2021,'))!;
    expect(missing).toContain(',Qatar,2021,,t CO2e');
  });

  it('keeps a real zero as a zero', () => {
    // A measured zero and an absent figure must stay distinguishable.
    const realZero = dataRows.find((r) => r.includes(',2022,'))!;
    expect(realZero).toContain(',Qatar,2022,0,t CO2e');
  });

  it('escapes quotes and commas so the file stays parseable', () => {
    expect(csv).toContain('"Test series, ""quoted"""');
  });
});

describe('CSV formula injection (L1077)', () => {
  const hostile: DataSeries = {
    ...series,
    label: '=HYPERLINK("http://x","click")',
    area: '@SUM(1+1)',
    measureNote: '\tcmd',
    observations: [
      { period: '2020', value: -3.5 },
      { period: '+2021', value: -0 },
    ],
  };
  const out = seriesToCsv([hostile], 'countries=QAT, =1+1, -2+3, @x');
  const rows = out.split('\n');

  /** RFC 4180 cells of one line, the way a spreadsheet reads them. */
  function cells(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    return [...out, cur];
  }

  it('neutralises cells that would start a formula', () => {
    for (const line of rows.filter(Boolean)) {
      for (const cell of cells(line)) {
        // Every cell a spreadsheet sees either is a plain number or does not
        // start with = + - @ tab or CR.
        if (/^[=+\-@\t\r]/.test(cell)) expect(cell, line).toMatch(/^[+-]?\d+(\.\d+)?$/);
      }
    }
    expect(out).toContain(`"'=HYPERLINK(""http://x"",""click"")"`);
    expect(out).toContain(`'@SUM(1+1)`);
  });

  it('never alters a negative number in the value column', () => {
    expect(out).toContain(',2020,-3.5,');
    expect(escapeCell(-12.25)).toBe('-12.25');
    expect(escapeCell('-12.25')).toBe('-12.25');
    expect(escapeCell('-1+2')).toBe("'-1+2");
  });

  it('neutralises formula text smuggled in through the filter description', () => {
    const filterLine = rows.find((l) => l.startsWith('# Filter applied'))!;
    expect(filterLine).toContain(" '=1+1");
    expect(filterLine).toContain(" '-2+3");
    expect(filterLine).toContain(" '@x");
    // A quote could open a quoted cell, so none survive in a comment line.
    expect(commentLine('a, "=1"')).not.toContain('"');
  });
});

describe('CSV stale-data line (p. 227)', () => {
  it('adds a stale notice when the cached release is past its refresh interval', () => {
    const old = {
      ...series,
      provenance: { ...series.provenance, retrievedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    };
    expect(seriesToCsv([old])).toContain('# Stale data: World Bank Indicators API v2 could not be refreshed.');
    expect(seriesToCsv([series])).not.toContain('Stale data');
  });
});

describe('access gating (p. 227)', () => {
  it('publishes only verified_open records', () => {
    const open = { provenance: buildProvenance('openalex', { sourceUrl: 'https://x', accessStatus: 'verified_open' }) };
    const unknown = { provenance: buildProvenance('openalex', { sourceUrl: 'https://y' }) };
    const gated = { provenance: buildProvenance('openalex', { sourceUrl: 'https://z', accessStatus: 'gated' }) };

    expect(isPublishable(open.provenance)).toBe(true);
    expect(isPublishable(unknown.provenance)).toBe(false);
    expect(isPublishable(gated.provenance)).toBe(false);
    expect(publishableOnly([open, unknown, gated])).toHaveLength(1);
  });

  it('defaults an unstated access status to unknown, not open', () => {
    // The safe default matters: a connector that forgets to set this must fail
    // closed rather than publish something nobody checked.
    const p = buildProvenance('doaj', { sourceUrl: 'https://example.org' });
    expect(p.accessStatus).toBe('unknown');
    expect(p.accessCheckedAt).toBeNull();
  });
});

describe('source labelling (p. 227)', () => {
  it('keeps observation period, source release and retrieval time apart', () => {
    const label = sourceLabel(series.provenance);
    expect(label).toContain('data for 2020–2022');
    expect(label).toContain('released');
    expect(label).toContain('retrieved');
  });
});

describe('provider registry (p. 227)', () => {
  it('keeps ReliefWeb disabled until an appname is registered', () => {
    // p. 213: a pre-approved appname is required and an unregistered one
    // returns HTTP 403, so this must not be switched on by accident.
    expect(PROVIDERS.reliefweb.enabled).toBe(false);
    expect(enabledProviders().map((p) => p.id)).not.toContain('reliefweb');
  });

  it('records when each provider was last reviewed', () => {
    for (const provider of Object.values(PROVIDERS)) {
      // An unreviewed provider (Gemini) may carry no date, but only while it
      // is switched off (p. 224: "must pass review before enabling").
      if (provider.accessReviewedOn === null) {
        expect(provider.enabled, provider.id).toBe(false);
        expect(providerEnabled(provider.id)).toBe(false);
      } else {
        expect(provider.accessReviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      expect(provider.attribution.length).toBeGreaterThan(0);
    }
  });

  it('registers the news providers and the AI answer so each has an off switch (L1023)', () => {
    for (const id of ['newsdata', 'gdelt', 'eia_rss', 'eea_rss', 'gemini'] as const) {
      expect(PROVIDERS[id]?.id).toBe(id);
    }
    // p. 224: Gemini has not passed review, so it is off.
    expect(providerEnabled('gemini')).toBe(false);
  });

  it('never names a browser-exposed environment variable for a key', () => {
    // NEXT_PUBLIC_* is shipped to every visitor (p. 226, p. 228).
    for (const provider of Object.values(PROVIDERS)) {
      expect(provider.keyEnvVar ?? '').not.toMatch(/^NEXT_PUBLIC_/);
    }
  });
});

describe('provider keys', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns null for a keyless provider', () => {
    expect(providerKey('nasa-power')).toBeNull();
  });

  it('returns null rather than a literal fallback when the key is unset', () => {
    vi.stubEnv('EIA_API_KEY', '');
    expect(providerKey('eia-open-data')).toBeNull();
  });

  it('reads the key when it is set', () => {
    vi.stubEnv('EIA_API_KEY', 'abc123');
    expect(providerKey('eia-open-data')).toBe('abc123');
  });
});

describe('reading destinations (p. 212)', () => {
  it('recognises DOI resolvers', () => {
    expect(isDoiResolver('https://doi.org/10.1234/abc')).toBe(true);
    expect(isDoiResolver('https://dx.doi.org/10.1234/abc')).toBe(true);
    expect(isDoiResolver('https://www.mdpi.com/article')).toBe(false);
    expect(isDoiResolver('not a url')).toBe(false);
  });

  it('prefers a repository copy over the DOI resolver', () => {
    expect(
      preferredReadUrl(['https://doi.org/10.1234/abc', 'https://repository.org/paper.pdf']),
    ).toBe('https://repository.org/paper.pdf');
  });

  it('still returns the DOI when it is the only open copy', () => {
    // A hybrid open-access article often lives only at the publisher. Dropping
    // it would discard genuinely readable research, which p. 212 does not ask
    // for - it asks us not to PREFER the DOI.
    expect(preferredReadUrl(['https://doi.org/10.1234/abc'])).toBe('https://doi.org/10.1234/abc');
  });

  it('returns null when there is no usable destination', () => {
    expect(preferredReadUrl([null, undefined, ''])).toBeNull();
  });
});
