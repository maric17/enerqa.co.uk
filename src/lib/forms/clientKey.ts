import { headers } from 'next/headers';

/**
 * The visitor's IP address, used only as an in-memory rate-limit key (it is
 * never stored or logged).
 *
 * Hosting platforms such as Vercel overwrite `x-forwarded-for` / `x-real-ip`
 * with the real client address, so the first entry can be trusted there. On a
 * host that passes the header through unchanged a client could spoof it, which
 * weakens the limit but cannot bypass validation or the honeypot.
 */
export async function getClientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip')?.trim() || 'unknown';
}
