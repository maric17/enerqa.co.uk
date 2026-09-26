import { unstable_cache } from 'next/cache';
import type { AccessStatus, Provenance } from './types';

/**
 * The anonymous access check behind `verified_open` (handoff pp. 209, 227).
 *
 * p. 209: "Require documented OA status or a vetted official-source allowlist
 * plus a lawful anonymous-access check of the actual final destination.
 * Resolve redirects and verify that the complete HTML/PDF/data file opens
 * without subscription, login, email capture, payment or embargo." and
 * "Broken, gated, CAPTCHA-blocked or uncertain destinations remain unpublished
 * pending human review." p. 227: "HTTP 200 or an open abstract is not
 * sufficient evidence."
 *
 * So the connectors no longer mark anything `verified_open` themselves. They
 * record the documented OA evidence (OpenAlex is_oa, OSTI rel=fulltext, the
 * news allowlist ...) and leave the status `unknown`; this module then opens
 * the destination the way a visitor would - no cookies, no credentials, no
 * key, redirects followed - and only a destination that actually serves the
 * document is promoted. Anything else fails closed to `unknown` (or `gated` /
 * `broken` when the answer says so), which `publishableOnly()` keeps off the
 * page.
 *
 * Cost control: only records that could be displayed are checked (callers
 * walk their ranked list and stop once they have enough), at most
 * MAX_CONCURRENT at a time, each with a short timeout. A definitive verdict is
 * cached for RECHECK_SECONDS in Next's shared cache, which is the "recheck
 * periodically" p. 209 asks for; an uncertain one is remembered in memory for
 * a short while and then tried again.
 */

export type AccessVerdict = {
  status: AccessStatus;
  /** When the check actually ran (p. 227 `accessCheckedAt`). */
  checkedAt: string;
  /** What was observed, in plain words, for `accessEvidence`. */
  evidence: string;
  /** Where the redirects ended, or null when nothing answered. */
  finalUrl: string | null;
};

/** p. 209 "recheck periodically": a week. */
export const RECHECK_SECONDS = 7 * 24 * 3600;
/** How long an uncertain result (timeout, 5xx, bot challenge) is remembered before retrying. */
const RETRY_UNCERTAIN_MS = 30 * 60 * 1000;
const MAX_CONCURRENT = 4;
/**
 * Enough of an HTML page to reach its body text: a Guardian article's <body>
 * starts ~195 KB in and its paragraphs ~290 KB in (25 Sep 2026). A PDF only
 * needs its signature, but reading stops at this cap either way.
 */
const MAX_BYTES = 1_000_000;
const TIMEOUT_MS = 10000;

function userAgent(): string {
  const contact = process.env.API_CONTACT_EMAIL ?? 'info@enerqa.co.uk';
  // Honest about what this is: an access check, not a browser.
  return `enerqa.co.uk/1.0 access-check (+https://enerqa.co.uk; ${contact})`;
}

/**
 * Bot walls. Their pages answer HTTP 200 or 403 without showing the document,
 * so the destination could not be confirmed: "CAPTCHA-blocked ... remain
 * unpublished pending human review" (p. 209). Only markers of the wall page
 * itself are listed: Cloudflare's `challenge-platform` script and Imperva's
 * `_Incapsula_Resource` script are injected into ordinary pages too (seen on
 * unep.org and ifrs.org, 25 Sep 2026), so on their own they prove nothing. A
 * wall that shows neither is still caught by the near-empty-page rule.
 */
const CHALLENGE_MARKERS = [
  /cf_chl_opt|cf-chl-bypass/i,
  /<title>\s*Just a moment\.\.\.\s*<\/title>/i,
  /Attention Required! \| Cloudflare/i,
  /Request unsuccessful\. Incapsula incident/i,
  /captcha-delivery\.com|px-captcha/i,
  /<title>\s*Access Denied\s*<\/title>/i,
];

/**
 * Pages that state the document is not free to read. The schema.org flag is
 * the publisher's own machine-readable declaration; the phrases are the
 * standard wall prompts, matched whole so a site-wide "Subscribe" link in a
 * menu does not count.
 */
const PAYWALL_MARKERS = [
  /"isAccessibleForFree"\s*:\s*"?false"?/i,
  /(subscribe|register|sign in|log in) to (continue|keep) reading/i,
  /you have reached (your|the) (free )?(article )?limit/i,
  /purchase (this article|access to this article|a subscription to read)/i,
];

/** Non-HTML, non-PDF types that are a readable document or dataset in themselves. */
const DOCUMENT_TYPES = /^(text\/(plain|csv|xml|tab-separated-values)|application\/(xml|json|epub\+zip|zip|vnd\.openxmlformats[^;]*|vnd\.ms-excel|msword))$/;

/** A redirect that ends on a sign-in page means the document itself is gated. */
const LOGIN_PATH = /\/(login|log-in|signin|sign-in|sso|auth|authenticate|account\/login|idp)(\/|$|\?)/i;

type Transient = { transient: true; verdict: AccessVerdict };

/** Read at most `max` bytes of the body, then stop the download. */
async function readHead(res: Response, max = MAX_BYTES): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array();
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < max) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.byteLength;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const out = new Uint8Array(Math.min(size, max));
  let at = 0;
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, out.byteLength - at);
    out.set(chunk.subarray(0, take), at);
    at += take;
    if (at >= out.byteLength) break;
  }
  return out;
}

/**
 * Decide from what came back. Exported for tests: it is the part with the
 * rules in it, and needs no network.
 */
export function judge(input: {
  status: number;
  finalUrl: string;
  contentType: string;
  head: Uint8Array;
  checkedAt: string;
}): AccessVerdict | Transient {
  const { status, finalUrl, contentType, head, checkedAt } = input;
  const at = (s: AccessStatus, evidence: string): AccessVerdict => ({ status: s, checkedAt, evidence, finalUrl });
  const where = `Anonymous check on ${checkedAt.slice(0, 10)}: ${finalUrl}`;

  if (status === 401 || status === 402) return at('gated', `${where} answered HTTP ${status}.`);
  if (status === 404 || status === 410) return at('broken', `${where} answered HTTP ${status}.`);
  if (status === 429 || status >= 500) {
    return { transient: true, verdict: at('unknown', `${where} answered HTTP ${status}; to be rechecked.`) };
  }

  let path = '';
  try {
    path = new URL(finalUrl).pathname + new URL(finalUrl).search;
  } catch {
    /* keep empty */
  }
  if (LOGIN_PATH.test(path)) return at('gated', `${where} redirected to a sign-in page.`);

  const text = new TextDecoder('utf-8', { fatal: false }).decode(head);
  if (CHALLENGE_MARKERS.some((re) => re.test(text))) {
    return { transient: true, verdict: at('unknown', `${where} answered with a bot challenge, so the document could not be confirmed.`) };
  }
  if (status === 403) return at('unknown', `${where} refused an anonymous request (HTTP 403).`);
  if (status !== 200) return at('unknown', `${where} answered HTTP ${status}.`);

  const type = contentType.split(';')[0].trim().toLowerCase();
  const pdfSignature = text.startsWith('%PDF-');

  if (type === 'application/pdf' || pdfSignature) {
    return pdfSignature
      ? at('verified_open', `${where} served the PDF itself (HTTP 200, application/pdf) without sign-in or payment.`)
      : at('unknown', `${where} claimed a PDF but did not send one.`);
  }

  if (type === 'text/html' || type === 'application/xhtml+xml' || (!type && /<html/i.test(text))) {
    if (PAYWALL_MARKERS.some((re) => re.test(text))) {
      return at('gated', `${where} declares the content is not free to read.`);
    }
    // An almost empty page is a bot wall, a script shell or an interstitial,
    // not a document. Retried later rather than cached as a verdict.
    const words = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ').split(/\s+/).filter(Boolean).length;
    if (words < 150) {
      return { transient: true, verdict: at('unknown', `${where} returned a page with almost no readable text (a bot wall or a script-only shell).`) };
    }
    return at(
      'verified_open',
      `${where} opened as a readable page (HTTP 200) with no sign-in, paywall or bot-challenge markers.`,
    );
  }

  // Plain-text, XML, EPUB and data files: served whole without credentials is
  // the test. An image or a video is not the document (OpenAlex sometimes
  // lists a graphical abstract JPEG as the "PDF" URL).
  if (!DOCUMENT_TYPES.test(type)) return at('unknown', `${where} served ${type || 'an untyped file'}, not a readable document.`);
  if (head.byteLength > 0) return at('verified_open', `${where} served the file (HTTP 200, ${type}) without sign-in.`);
  return at('unknown', `${where} returned an empty body.`);
}

let inFlight = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve));
  else inFlight += 1;
  try {
    return await fn();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else inFlight -= 1;
  }
}

/** One anonymous request. Throws a Transient so nothing uncertain is cached. */
async function probe(url: string): Promise<AccessVerdict> {
  const checkedAt = new Date().toISOString();
  let res: Response;
  try {
    res = await withSlot(() =>
      fetch(url, {
        method: 'GET',
        redirect: 'follow',
        credentials: 'omit',
        cache: 'no-store',
        headers: { 'User-Agent': userAgent(), Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'no response';
    throw { transient: true, verdict: { status: 'unknown', checkedAt, evidence: `Anonymous check on ${checkedAt.slice(0, 10)} got no answer from ${url} (${msg}).`, finalUrl: null } } satisfies Transient;
  }
  const contentType = res.headers.get('content-type') ?? '';
  // A PDF is confirmed by its signature; there is no need to download it.
  const head = await readHead(res, /pdf/i.test(contentType) ? 4096 : MAX_BYTES).catch(() => new Uint8Array());
  const result = judge({
    status: res.status,
    finalUrl: res.url || url,
    contentType,
    head,
    checkedAt,
  });
  if ('transient' in result) throw result;
  return result;
}

type Memo = { verdict: AccessVerdict; until: number };
const memoKey = '__enerqaAccessChecks';
const g = globalThis as unknown as { [memoKey]?: Map<string, Memo> };
const memo: Map<string, Memo> = (g[memoKey] ??= new Map());

/**
 * The verdict for one destination: shared cache, then memory, then a real
 * request. Never throws; anything uncertain is `unknown`.
 */
export async function checkAccess(url: string, now = Date.now()): Promise<AccessVerdict> {
  const remembered = memo.get(url);
  if (remembered && remembered.until > now) return remembered.verdict;

  try {
    let verdict: AccessVerdict;
    try {
      verdict = await unstable_cache(() => probe(url), ['access-check', url], {
        revalidate: RECHECK_SECONDS,
        tags: ['access-check'],
      })();
    } catch (error) {
      if (error instanceof Error && error.message.includes('incrementalCache missing')) verdict = await probe(url);
      else throw error;
    }
    memo.set(url, { verdict, until: now + RECHECK_SECONDS * 1000 });
    return verdict;
  } catch (error) {
    const verdict: AccessVerdict =
      error && typeof error === 'object' && 'transient' in error
        ? (error as Transient).verdict
        : { status: 'unknown', checkedAt: new Date(now).toISOString(), evidence: 'Access check failed to run.', finalUrl: null };
    memo.set(url, { verdict, until: now + RETRY_UNCERTAIN_MS });
    return verdict;
  }
}

/** Put a verdict onto a record's provenance, keeping the documented OA evidence it came with. */
export function applyVerdict(provenance: Provenance, verdict: AccessVerdict): Provenance {
  const documented = provenance.accessEvidence ? `${provenance.accessEvidence} ` : '';
  return {
    ...provenance,
    accessStatus: verdict.status,
    accessCheckedAt: verdict.checkedAt,
    accessEvidence: `${documented}${verdict.evidence}`,
  };
}

/**
 * Walk a ranked list and return, in the same order, the first `limit` items
 * whose destination passes the check. Items are checked a few at a time and
 * the walk stops as soon as enough have passed, so records that could never
 * be displayed are never checked. `maxChecks` bounds the work when most
 * destinations fail.
 *
 * `urls` lists an item's destinations in preference order. When the first
 * fails, the next is tried: p. 209 "A vetted alternative OA copy can replace
 * a gated publisher/DOI destination." `url` in the result is the one that
 * passed.
 */
export async function firstVerified<T>(
  items: T[],
  opts: {
    url?: (item: T) => string;
    urls?: (item: T) => string[];
    limit: number;
    maxChecks?: number;
    check?: (url: string) => Promise<AccessVerdict>;
  },
): Promise<{ item: T; verdict: AccessVerdict; url: string }[]> {
  const { limit, maxChecks = Math.max(limit * 3, limit + 4), check = checkAccess } = opts;
  const urlsOf = opts.urls ?? ((item: T) => (opts.url ? [opts.url(item)] : []));
  const passed: { item: T; verdict: AccessVerdict; url: string; index: number }[] = [];
  const candidates = items.slice(0, maxChecks);

  async function firstOpen(item: T): Promise<{ verdict: AccessVerdict; url: string } | null> {
    // At most three copies of one record, so a record with many mirrors
    // cannot eat the whole check budget.
    for (const url of [...new Set(urlsOf(item))].slice(0, 3)) {
      const verdict = await check(url);
      if (verdict.status === 'verified_open') return { verdict, url };
    }
    return null;
  }

  for (let start = 0; start < candidates.length && passed.length < limit; ) {
    // Check just enough in parallel to fill the remaining slots.
    const batch = candidates.slice(start, start + Math.max(1, limit - passed.length));
    const results = await Promise.all(batch.map((item) => firstOpen(item)));
    results.forEach((result, i) => {
      if (result) passed.push({ item: batch[i], ...result, index: start + i });
    });
    start += batch.length;
  }

  return passed
    .sort((a, b) => a.index - b.index)
    .slice(0, limit)
    .map(({ item, verdict, url }) => ({ item, verdict, url }));
}

/** For tests only. */
export function resetAccessMemo(): void {
  memo.clear();
}
