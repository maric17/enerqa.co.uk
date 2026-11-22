import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { notifyEnquiry, syncNewsletter } from './sendpulse';

const fetchMock = vi.fn();
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); vi.stubEnv('SENDPULSE_ENABLED', 'true'); vi.stubEnv('SENDPULSE_CLIENT_ID', 'id'); vi.stubEnv('SENDPULSE_CLIENT_SECRET', 'secret'); vi.stubEnv('SENDPULSE_FROM_EMAIL', 'website@enerqa.co.uk'); vi.stubEnv('SENDPULSE_ADDRESSBOOK_ID', '123'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const replies = () => { fetchMock.mockResolvedValueOnce(Response.json({ access_token: 'test-token' })).mockResolvedValueOnce(Response.json({ result: true })); };
const enquiry = {
  id: 42, firstName: 'Ada', lastName: '—', email: 'ada@example.org', company: 'Example Ltd',
  natureOfEnquiry: 'Project Discussion', message: 'First line\nSecond line', marketingConsent: false,
  toolRequested: { id: 3, title: 'Example Tool' }, domain: { id: 5, title: 'Energy' }, industry: 9,
  projectLocation: 'Doha', currentStage: 'Feasibility',
};

it.each([
  [undefined, 'info@enerqa.co.uk'],
  [' ', 'info@enerqa.co.uk'],
  [' review@example.org ', 'review@example.org'],
])('includes the enquiry details and admin link for the selected mailbox (%s)', async (override, recipient) => {
  vi.stubEnv('ENQUIRY_NOTIFICATION_EMAIL', override);
  replies(); await notifyEnquiry(enquiry);
  const body = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(body.email.to).toEqual([{ email: recipient }]);
  expect(body.email.from.email).toBe('website@enerqa.co.uk');
  expect(body.email.text.split('\n')).toEqual([
    'Name: Ada', 'Email: ada@example.org', 'Organisation: Example Ltd', 'Enquiry type: Project Discussion',
    'Tool requested: Example Tool', 'Domain: Energy', 'Industry: Record #9', 'Project location: Doha',
    'Current stage: Feasibility', 'Newsletter opt-in: No', '', 'Message:', 'First line', 'Second line', '',
    expect.stringContaining('/admin/collections/enquiries/42'),
  ]);
  expect(body.email).not.toHaveProperty('reply_to');
});
it('adds only an email and honours newsletter unsubscribe without clearing blacklists', async () => {
  replies(); await syncNewsletter('ada@example.org', false);
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.sendpulse.com/addressbooks/123/emails/unsubscribe');
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ emails: ['ada@example.org'] });
});
it('makes no request while disabled and rejects provider failures', async () => {
  vi.stubEnv('SENDPULSE_ENABLED', 'false');
  await expect(notifyEnquiry(enquiry)).rejects.toThrow(/not configured/);
  expect(fetchMock).not.toHaveBeenCalled();
  vi.stubEnv('SENDPULSE_ENABLED', 'true');
  fetchMock.mockResolvedValueOnce(new Response('', { status: 401 }));
  await expect(notifyEnquiry(enquiry)).rejects.toThrow(/authentication/);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
