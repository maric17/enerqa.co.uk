import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { notifyEnquiry, syncNewsletter } from './sendpulse';

const fetchMock = vi.fn();
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); vi.stubEnv('SENDPULSE_ENABLED', 'true'); vi.stubEnv('SENDPULSE_CLIENT_ID', 'id'); vi.stubEnv('SENDPULSE_CLIENT_SECRET', 'secret'); vi.stubEnv('SENDPULSE_FROM_EMAIL', 'website@enerqa.co.uk'); vi.stubEnv('SENDPULSE_ADDRESSBOOK_ID', '123'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const replies = () => { fetchMock.mockResolvedValueOnce(Response.json({ access_token: 'test-token' })).mockResolvedValueOnce(Response.json({ result: true })); };

it('notifies only info@ with a CMS link, without copying form contents', async () => {
  replies(); await notifyEnquiry(42);
  const body = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(body.email.to).toEqual([{ email: 'info@enerqa.co.uk' }]);
  expect(body.email.text).toContain('/admin/collections/enquiries/42');
  expect(body.email).not.toHaveProperty('reply_to');
});
it('adds only an email and honours newsletter unsubscribe without clearing blacklists', async () => {
  replies(); await syncNewsletter('ada@example.org', false);
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.sendpulse.com/addressbooks/123/emails/unsubscribe');
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ emails: ['ada@example.org'] });
});
it('makes no request while disabled and rejects provider failures', async () => {
  vi.stubEnv('SENDPULSE_ENABLED', 'false');
  await expect(notifyEnquiry(42)).rejects.toThrow(/not configured/);
  expect(fetchMock).not.toHaveBeenCalled();
  vi.stubEnv('SENDPULSE_ENABLED', 'true');
  fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));
  await expect(notifyEnquiry(42)).rejects.toThrow(/authentication/);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
