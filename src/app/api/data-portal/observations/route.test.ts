import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

afterEach(() => vi.unstubAllGlobals());

describe('Gapminder country observations', () => {
  it('reads Fast Track country columns and preserves zero values', async () => {
    // Fast Track uses country instead of geo; this must not become a World series.
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => 'country,time,unhcr_refg_in\nafg,2000,0\nalb,2001,12\nafg,2002,\nafg,2003,Infinity\n' })));
    const response = await GET(new Request('http://localhost/api/data-portal/observations?id=fasttrack:unhcr_refg_in'));
    const data = await response.json();
    expect(data.observations).toEqual([{ geo: 'afg', time: '2000', value: 0 }, { geo: 'alb', time: '2001', value: 12 }]);
    expect(data.count).toBe(2);
  });
});
