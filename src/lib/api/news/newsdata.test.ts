import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFromProvider } from '../core/fetch';
import { ok } from '../core/types';
import { fetchNewsdataQuery } from './newsdata';

// Exercise the real request builder without spending provider credits.
vi.mock('../core/fetch', () => ({ fetchFromProvider: vi.fn(), providerKey: () => 'test-key' }));
beforeEach(() => vi.mocked(fetchFromProvider).mockResolvedValue(ok('newsdata', { status: 'success', results: [] })));

describe('NewsData publisher prefilter', () => {
  it('excludes the publisher that makes every scheduled request fail with UnsupportedFilter', async () => {
    await fetchNewsdataQuery('climate', 7200, true);
    const url = new URL(vi.mocked(fetchFromProvider).mock.calls.at(-1)![1]);
    // NewsData rejects worldbank.org; the site's definitive allowlist is unchanged.
    expect(url.searchParams.get('domainurl')?.split(',')).toEqual(['reuters.com', 'theguardian.com', 'iea.org', 'un.org']);
    expect(url.searchParams.get('size')).toBe('10');
  });
});
