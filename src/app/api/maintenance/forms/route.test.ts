import { afterEach, expect, it, vi } from 'vitest';
const maintain = vi.hoisted(() => vi.fn().mockResolvedValue({ deleted: 0 }));
vi.mock('payload', () => ({ getPayload: () => ({}) }));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('@/lib/forms/lifecycle', () => ({ maintainForms: maintain }));
import { GET } from './route';
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it('requires both activation and the scheduler secret before touching stored data', async () => {
  vi.stubEnv('FORMS_RETENTION_ENABLED', 'false');
  vi.stubEnv('CRON_SECRET', 'secret');
  expect((await GET(new Request('https://www.enerqa.co.uk/api/maintenance/forms'))).status).toBe(503);
  vi.stubEnv('FORMS_RETENTION_ENABLED', 'true');
  expect((await GET(new Request('https://www.enerqa.co.uk/api/maintenance/forms'))).status).toBe(401);
  expect(maintain).not.toHaveBeenCalled();
  expect((await GET(new Request('https://www.enerqa.co.uk/api/maintenance/forms', { headers: { authorization: 'Bearer secret' } }))).status).toBe(200);
  expect(maintain).toHaveBeenCalledTimes(1);
});
