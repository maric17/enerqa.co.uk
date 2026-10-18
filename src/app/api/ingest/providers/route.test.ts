import { afterEach, expect, it, vi } from 'vitest';
import { GET } from './route';
import { buildIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';
vi.mock('@/lib/feeds/intelligenceIndex', () => ({ buildIntelligenceIndex: vi.fn() }));
vi.mock('@/lib/api/core/storage', () => ({ pruneRequestHistory: vi.fn() }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it('rejects unconfigured or unauthorized jobs before any provider work', async () => {
  // A public URL must not allow visitors to spend the site's source allowances.
  vi.stubEnv('CRON_SECRET', '');
  expect((await GET(new Request('https://example.org'))).status).toBe(503);
  vi.stubEnv('CRON_SECRET', 'fixture');
  expect((await GET(new Request('https://example.org', { headers: { authorization: 'Bearer wrong' } }))).status).toBe(401);
  expect(buildIntelligenceIndex).not.toHaveBeenCalled();
});
it('reports source failure honestly for an authenticated job', async () => {
  vi.stubEnv('CRON_SECRET', 'fixture');
  vi.mocked(buildIntelligenceIndex).mockResolvedValue({ items: [], sourcesFailed: true });
  const result = await GET(new Request('https://example.org', { headers: { authorization: 'Bearer fixture' } }));
  expect(result.status).toBe(503);
  expect(await result.json()).toEqual({ storedItems: 0, sourcesFailed: true });
});
