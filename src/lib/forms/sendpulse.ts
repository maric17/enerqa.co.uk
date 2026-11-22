import type { Enquiry } from '@/payload-types';
import { COMPANY } from '../content/company';

// Server-only credentials. No provider errors, tokens or recipient data enter logs.
export function sendPulseConfigured(): boolean {
  return process.env.SENDPULSE_ENABLED === 'true' && Boolean(process.env.SENDPULSE_CLIENT_ID && process.env.SENDPULSE_CLIENT_SECRET);
}

async function sendPulse(path: string, body: unknown) {
  if (!sendPulseConfigured()) throw new Error('Email delivery is not configured.');
  const auth = await fetch('https://api.sendpulse.com/oauth/access_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000),
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: process.env.SENDPULSE_CLIENT_ID, client_secret: process.env.SENDPULSE_CLIENT_SECRET }),
  });
  const token = auth.ok ? await auth.json() : null;
  if (!token?.access_token) throw new Error('Email service authentication failed.');
  const response = await fetch(`https://api.sendpulse.com/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.access_token}` },
    cache: 'no-store', signal: AbortSignal.timeout(8000), body: JSON.stringify(body),
  });
  const result = response.ok ? await response.json() : null;
  if (result?.result !== true) throw new Error('Email service did not confirm delivery.');
}

type RelatedChoice = { id: number; title: string } | number | null;
type EnquiryNotification = Pick<Enquiry, 'id' | 'firstName' | 'lastName' | 'email' | 'company' |
  'natureOfEnquiry' | 'message' | 'marketingConsent' | 'projectLocation' | 'currentStage'> & {
  toolRequested?: RelatedChoice;
  domain?: RelatedChoice;
  industry?: RelatedChoice;
};

function choiceLabel(choice?: RelatedChoice) {
  if (typeof choice === 'number') return `Record #${choice}`;
  return choice?.title;
}

export async function notifyEnquiry(enquiry: EnquiryNotification) {
  const from = process.env.SENDPULSE_FROM_EMAIL;
  if (!from) throw new Error('A verified email sender is required.');
  const recipient = process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim() || COMPANY.email;
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.enerqa.co.uk';
  const link = `${origin}/admin/collections/enquiries/${enquiry.id}`;
  const includeDetails = process.env.ENQUIRY_NOTIFICATION_DETAILS === 'true';
  const text = includeDetails
    ? enquiryDetails(enquiry, link)
    : `A new enquiry is ready in the content editor: ${link}`;
  await sendPulse('smtp/emails', { email: {
    subject: 'New Enerqa website enquiry', text,
    from: { name: COMPANY.name, email: from }, to: [{ email: recipient }],
  } });
}

function enquiryDetails(enquiry: EnquiryNotification, link: string) {
  const name = enquiry.lastName === '—' ? enquiry.firstName : `${enquiry.firstName} ${enquiry.lastName}`;
  const fields = [
    ['Name', name],
    ['Email', enquiry.email],
    ['Organisation', enquiry.company],
    ['Enquiry type', enquiry.natureOfEnquiry],
    ['Tool requested', choiceLabel(enquiry.toolRequested)],
    ['Domain', choiceLabel(enquiry.domain)],
    ['Industry', choiceLabel(enquiry.industry)],
    ['Project location', enquiry.projectLocation],
    ['Current stage', enquiry.currentStage],
    ['Newsletter opt-in', enquiry.marketingConsent ? 'Yes' : 'No'],
  ];
  // Keep form values in the plain-text body. The sender and recipient come from server settings.
  return [
    ...fields.map(([label, value]) => `${label}: ${value?.replace(/\s+/g, ' ').trim() || 'Not provided'}`),
    '',
    'Message:',
    enquiry.message?.trim() || 'Not provided',
    '',
    `Open in admin: ${link}`,
  ].join('\n');
}

export async function syncNewsletter(email: string, subscribed: boolean) {
  const book = process.env.SENDPULSE_ADDRESSBOOK_ID;
  if (!book || !/^\d+$/.test(book)) throw new Error('A newsletter mailing list is required.');
  // Q9: only the email address is shared. Never remove a provider suppression entry.
  await sendPulse(`addressbooks/${book}/emails${subscribed ? '' : '/unsubscribe'}`, { emails: [email] });
}
