import { describe, it, expect, vi } from 'vitest';
import type { Enquiry } from '@/payload-types';
import { enquiryExpiresAt, enquiryMayBeDeleted, maintainForms, saveNewsletterSubscription } from './lifecycle';

vi.mock('./sendpulse', () => ({ sendPulseConfigured: () => false, notifyEnquiry: vi.fn(), syncNewsletter: vi.fn() }));
const enquiry = (overrides: Partial<Enquiry> = {}): Enquiry => ({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.org', source: 'Contact Page', createdAt: '2024-10-03T00:00:00Z', updatedAt: '2026-10-03T00:00:00Z', ...overrides });

describe('Q2 retention', () => {
  it('expires two years after actual contact, without extending retention for admin edits', () => {
    expect(enquiryMayBeDeleted(enquiry(), new Date('2026-10-03T00:00:00Z'))).toBe(true);
    expect(enquiryMayBeDeleted(enquiry({ lastSubstantiveContactAt: '2025-10-03T00:00:00Z' }), new Date('2026-10-03'))).toBe(false);
    expect(enquiryExpiresAt(enquiry({ createdAt: '2024-02-29T12:00:00Z' }))?.toISOString()).toBe('2026-02-28T12:00:00.000Z');
  });
  it('preserves newsletters and documented active holds, but expires a lapsed hold', () => {
    const now = new Date('2026-10-03');
    expect(enquiryMayBeDeleted(enquiry({ source: 'Newsletter Form' }), now)).toBe(false);
    expect(enquiryMayBeDeleted(enquiry({ retentionHoldReason: 'Legal hold', retentionHoldUntil: '2027-01-01' }), now)).toBe(false);
    expect(enquiryMayBeDeleted(enquiry({ retentionHoldReason: 'Legal hold', retentionHoldUntil: '2026-01-01' }), now)).toBe(true);
    expect(enquiryMayBeDeleted(enquiry({ createdAt: 'invalid' }), now)).toBe(false);
  });
  it('collects all pages before deletion and checks for concurrent staff edits', async () => {
    const old = enquiry();
    const contacted = enquiry({ id: 2, lastSubstantiveContactAt: '2026-10-01' });
    const payload = { find: vi.fn().mockResolvedValueOnce({ docs: [old], hasNextPage: true }).mockResolvedValueOnce({ docs: [contacted], hasNextPage: false }), findByID: vi.fn().mockResolvedValue(old), delete: vi.fn().mockResolvedValue({ docs: [old] }) };
    expect(await maintainForms(payload as never, new Date('2026-10-03'))).toMatchObject({ deleted: 1 });
    expect(payload.find).toHaveBeenCalledTimes(2);
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { and: [{ id: { equals: 1 } }, { updatedAt: { equals: old.updatedAt } }] } }));
  });
  it('keeps a separate newsletter record when an enquiry expires', async () => {
    const payload = { find: vi.fn().mockResolvedValue({ docs: [] }), create: vi.fn().mockResolvedValue(enquiry({ source: 'Newsletter Form' })) };
    await saveNewsletterSubscription(payload as never, 'ADA@Example.org');
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ email: 'ada@example.org', source: 'Newsletter Form', marketingConsent: true }) }));
  });
});
