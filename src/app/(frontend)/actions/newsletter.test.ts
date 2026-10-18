import { beforeEach, it, expect, vi } from 'vitest';

const db = vi.hoisted(() => ({ find: vi.fn(), update: vi.fn(), create: vi.fn() }));
const deliver = vi.hoisted(() => vi.fn());
vi.mock('payload', () => ({ getPayload: () => db }));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('@/lib/forms/clientKey', () => ({ getClientKey: () => 'test' }));
vi.mock('@/lib/forms/limits', () => ({ allowSubmission: () => true, newsletterLimiter: {} }));
vi.mock('@/lib/forms/lifecycle', () => ({ NEWSLETTER_SOURCE: 'Newsletter Form', deliverPendingEnquiry: deliver, saveNewsletterSubscription: vi.fn() }));
import { unsubscribeNewsletter } from './newsletter';

beforeEach(() => { vi.clearAllMocks(); db.update.mockImplementation(async ({ id, data }) => ({ id, ...data })); db.create.mockImplementation(async ({ data }) => ({ id: 3, ...data })); });
const form = () => { const fd = new FormData(); fd.set('email', 'Ada@Example.org'); return fd; };

it('withdraws only the exact address, strips newsletter data and preserves enquiry contents', async () => {
  db.find.mockResolvedValue({ docs: [{ id: 1, email: 'ADA@example.org', source: 'Newsletter Form' }, { id: 2, email: 'ada@example.org', source: 'Contact Page' }, { id: 9, email: 'evilada@example.org', source: 'Newsletter Form' }], hasNextPage: false });
  expect(await unsubscribeNewsletter({ done: false }, form())).toEqual({ done: true });
  expect(db.update).toHaveBeenCalledTimes(2);
  expect(db.update.mock.calls[0][0]).toMatchObject({ id: 1, data: { company: null, message: '', marketingConsent: false, newsletterSyncedAt: null } });
  expect(db.update.mock.calls[1][0]).toEqual({ collection: 'enquiries', id: 2, data: { marketingConsent: false } });
  expect(deliver).toHaveBeenCalledTimes(1);
});
it('queues provider-only suppression with the same public result, without revealing membership', async () => {
  db.find.mockResolvedValue({ docs: [], hasNextPage: false });
  expect(await unsubscribeNewsletter({ done: false }, form())).toEqual({ done: true });
  expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ email: 'ada@example.org', marketingConsent: false, source: 'Newsletter Form' }) }));
});
it('reports a database failure instead of claiming an unsubscribe completed', async () => {
  db.find.mockRejectedValue(new Error('offline'));
  const result = await unsubscribeNewsletter({ done: false }, form());
  expect(result.done).toBe(false);
  expect(result.values).toEqual({ email: 'Ada@Example.org' });
  expect(db.create).not.toHaveBeenCalled();
});
