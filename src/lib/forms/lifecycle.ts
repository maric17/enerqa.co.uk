import type { Payload } from 'payload';
import type { Enquiry } from '@/payload-types';
import { notifyEnquiry, sendPulseConfigured, syncNewsletter } from './sendpulse';

export const NEWSLETTER_SOURCE = 'Newsletter Form';

export async function saveNewsletterSubscription(payload: Payload, email: string) {
  const existing = await payload.find({ collection: 'enquiries', where: { and: [{ email: { equals: email.toLowerCase() } }, { source: { equals: NEWSLETTER_SOURCE } }] }, limit: 1, depth: 0 });
  const data = { firstName: 'Newsletter', lastName: 'Subscriber', email: email.toLowerCase(), natureOfEnquiry: 'Newsletter Subscription', message: '', marketingConsent: true, source: NEWSLETTER_SOURCE, newsletterSyncedAt: null };
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'enquiries', id: existing.docs[0].id, data })
    : await payload.create({ collection: 'enquiries', data });
  await deliverPendingEnquiry(payload, doc);
}

export async function deliverPendingEnquiry(payload: Payload, doc: Enquiry) {
  if (!sendPulseConfigured()) return;
  try {
    if (doc.source === NEWSLETTER_SOURCE) {
      if (doc.newsletterSyncedAt) return;
      await syncNewsletter(doc.email, doc.marketingConsent === true);
      await payload.update({ collection: 'enquiries', id: doc.id, data: { newsletterSyncedAt: new Date().toISOString() } });
    } else if (!doc.notificationSentAt) {
      await notifyEnquiry(doc.id);
      await payload.update({ collection: 'enquiries', id: doc.id, data: { notificationSentAt: new Date().toISOString() } });
    }
  } catch {
    // The saved record is the retry queue. A delivery outage must not lose the enquiry.
    console.warn('[forms] Delivery remains pending in the CMS.');
  }
}

export function enquiryExpiresAt(doc: Pick<Enquiry, 'createdAt' | 'lastSubstantiveContactAt'>): Date | null {
  const last = new Date(doc.lastSubstantiveContactAt || doc.createdAt);
  if (!Number.isFinite(last.getTime())) return null;
  // Q2 uses two calendar years, not an approximate 730-day duration.
  const year = last.getUTCFullYear() + 2;
  const month = last.getUTCMonth();
  const day = last.getUTCDate();
  last.setUTCFullYear(year, month, 1);
  last.setUTCDate(Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()));
  return last;
}

export function enquiryMayBeDeleted(doc: Enquiry, now = new Date()): boolean {
  if (doc.source === NEWSLETTER_SOURCE) return false;
  // Holds require both a documented reason and an expiry; review them before expiry.
  if (doc.retentionHoldReason && doc.retentionHoldUntil && new Date(doc.retentionHoldUntil) > now) return false;
  const expires = enquiryExpiresAt(doc);
  return expires !== null && expires <= now;
}

export async function maintainForms(payload: Payload, now = new Date()) {
  let page = 1;
  let deleted = 0;
  let pending = 0;
  // Collect IDs before deleting so pagination cannot skip records as rows disappear.
  const expired: Enquiry['id'][] = [];
  let more = true;
  let deliveryAttempts = 0;
  while (more) {
    const batch = await payload.find({ collection: 'enquiries', limit: 100, page, depth: 0, sort: 'id' });
    for (const doc of batch.docs) {
      if (enquiryMayBeDeleted(doc, now)) expired.push(doc.id);
      else {
        // Newsletter closure withdraws all subscriptions; suppression records stay minimal.
        if (doc.source === NEWSLETTER_SOURCE && doc.marketingConsent && process.env.NEWSLETTER_ENDED === 'true') {
          const suppressed = await payload.update({ collection: 'enquiries', id: doc.id, data: { marketingConsent: false, message: '', company: null, newsletterSyncedAt: null } });
          if (deliveryAttempts++ < 10) await deliverPendingEnquiry(payload, suppressed);
        } else if (deliveryAttempts < 10 && (doc.source === NEWSLETTER_SOURCE ? !doc.newsletterSyncedAt : !doc.notificationSentAt)) {
          // Bound external work so an outage does not consume the entire job deadline.
          deliveryAttempts++;
          await deliverPendingEnquiry(payload, doc);
        }
        if (doc.source === NEWSLETTER_SOURCE ? !doc.newsletterSyncedAt : !doc.notificationSentAt) pending++;
      }
    }
    more = batch.hasNextPage;
    page++;
  }
  for (const id of expired) {
    // Re-read before deletion: staff may have recorded substantive contact during the scan.
    const latest = await payload.findByID({ collection: 'enquiries', id, depth: 0 });
    if (enquiryMayBeDeleted(latest, now)) {
      // An atomic updatedAt condition preserves a concurrent staff edit after the read.
      const result = await payload.delete({ collection: 'enquiries', where: { and: [{ id: { equals: id } }, { updatedAt: { equals: latest.updatedAt } }] } });
      deleted += result.docs.length;
    }
  }
  return { deleted, pendingChecked: pending };
}
