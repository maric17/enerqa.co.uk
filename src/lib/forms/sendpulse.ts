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

export async function notifyEnquiry(id: number | string) {
  const from = process.env.SENDPULSE_FROM_EMAIL;
  if (!from) throw new Error('A verified email sender is required.');
  // Q8: send a CMS link, not a copy of the enquiry, to minimise mailbox retention.
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.enerqa.co.uk';
  await sendPulse('smtp/emails', { email: {
    subject: 'New Enerqa website enquiry', text: `A new enquiry is ready in the content editor: ${origin}/admin/collections/enquiries/${encodeURIComponent(id)}`,
    from: { name: COMPANY.name, email: from }, to: [{ email: COMPANY.email }],
  } });
}

export async function syncNewsletter(email: string, subscribed: boolean) {
  const book = process.env.SENDPULSE_ADDRESSBOOK_ID;
  if (!book || !/^\d+$/.test(book)) throw new Error('A newsletter mailing list is required.');
  // Q9: only the email address is shared. Never remove a provider suppression entry.
  await sendPulse(`addressbooks/${book}/emails${subscribed ? '' : '/unsubscribe'}`, { emails: [email] });
}
