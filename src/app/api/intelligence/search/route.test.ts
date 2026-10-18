import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock('@/lib/feeds/liveIntelligence', () => ({ searchLiveIntelligence: mocks.search }));
vi.mock('@/lib/forms/clientKey', () => ({ getClientKey: async () => 'test-visitor' }));
import { GET } from './route';
beforeEach(() => { mocks.search.mockReset(); });
it('validates filters before any upstream request', async () => {
  const response = await GET(new Request('http://localhost/api/intelligence/search?source=untrusted'));
  expect(response.status).toBe(400); expect(mocks.search).not.toHaveBeenCalled();
});
it('passes complete normalized filters to server search and prevents public response caching', async () => {
  mocks.search.mockResolvedValue({ items: [], sourcesFailed: false });
  const response = await GET(new Request('http://localhost/api/intelligence/search?country=DEU&type=news&source=newsdata'));
  expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(mocks.search).toHaveBeenCalledWith(expect.objectContaining({ country: ['DEU'], region: ['Western Europe'], source: ['newsdata'] }));
});
it('returns a safe error when provider search throws', async () => {
  mocks.search.mockRejectedValue(new Error('private key=secret'));
  const response = await GET(new Request('http://localhost/api/intelligence/search?type=news'));
  expect(response.status).toBe(503); expect(await response.text()).not.toContain('secret');
});
