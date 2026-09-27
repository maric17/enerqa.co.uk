import { describe, expect, it } from 'vitest';
import { getToolAccess, requestAccessHref, splitCatalogue } from './access';

const base = { slug: 'easysolar', access: 'Request Access' as const, file: null, iframeUrl: null, link: null };

describe('requestAccessHref', () => {
  it('uses the p. 165 contact route with the tool slug', () => {
    expect(requestAccessHref('esg-readiness')).toBe('/contact?intent=tool&tool=esg-readiness');
  });
});

describe('splitCatalogue (p. 165 T02/T03)', () => {
  const rows = ['ghg-other', 'greenscale-pro', 'esg-readiness', 'easysolar'].map((slug) => ({ slug }));

  it('puts the flagships in T02 in p. 165 order and never repeats them in T03', () => {
    const { flagships, otherTools } = splitCatalogue(rows);
    expect(flagships.map((t) => t.slug)).toEqual(['esg-readiness', 'easysolar', 'greenscale-pro']);
    expect(otherTools.map((t) => t.slug)).toEqual(['ghg-other']);
  });

  it('skips a flagship that is missing (e.g. not validated) instead of leaving a gap', () => {
    const { flagships } = splitCatalogue(rows.filter((t) => t.slug !== 'easysolar'));
    expect(flagships.map((t) => t.slug)).toEqual(['esg-readiness', 'greenscale-pro']);
  });
});

describe('getToolAccess (pp. 166, 191)', () => {
  it('defaults to Request Access on the contact route', () => {
    expect(getToolAccess(base)).toEqual({
      kind: 'request',
      label: 'Request Access',
      availability: 'Request Access',
      href: '/contact?intent=tool&tool=easysolar',
    });
  });

  it('never shows legacy "Public"/"Enterprise" as a label or offers "Open Tool"', () => {
    for (const access of ['Public', 'Enterprise'] as const) {
      const result = getToolAccess({ ...base, access });
      expect(result.kind).toBe('request');
      expect(result.availability).toBe('Request Access');
    }
  });

  it('keeps accurate controlled labels such as Client Only and In Development', () => {
    expect(getToolAccess({ ...base, access: 'Client Only' }).availability).toBe('Client Only');
    expect(getToolAccess({ ...base, access: 'In Development' }).availability).toBe('In Development');
  });

  it('offers Download Tool only when a file is attached', () => {
    expect(getToolAccess({ ...base, access: 'Download Available' }).kind).toBe('request');
    const withFile = getToolAccess({
      ...base,
      access: 'Download Available',
      file: { id: 1, url: '/files/tool.xlsx', updatedAt: '', createdAt: '' } as never,
    });
    expect(withFile).toMatchObject({ kind: 'download', label: 'Download Tool', href: '/files/tool.xlsx' });
  });

  it('offers Launch Tool only with a working embed or link', () => {
    expect(getToolAccess({ ...base, access: 'Online Tool' }).kind).toBe('request');
    expect(getToolAccess({ ...base, access: 'Online Tool', iframeUrl: 'https://app.test' })).toMatchObject({
      kind: 'online',
      label: 'Launch Tool',
      href: '/tools/easysolar#access',
      embedded: true,
    });
    expect(getToolAccess({ ...base, access: 'Online Tool', link: 'https://tool.test' })).toMatchObject({
      kind: 'online',
      href: 'https://tool.test',
      embedded: false,
    });
  });
});
