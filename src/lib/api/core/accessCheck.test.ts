import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyVerdict, checkAccess, firstVerified, judge, resetAccessMemo, type AccessVerdict } from './accessCheck';
import { buildProvenance } from './provenance';

/**
 * pp. 209, 227: `verified_open` means an anonymous check of the final
 * destination actually opened the document. HTTP 200 alone is not enough,
 * and anything uncertain fails closed.
 */

const checkedAt = '2026-09-25T10:00:00.000Z';
const bytes = (text: string) => new TextEncoder().encode(text);
const article = `<html><head><title>Story</title></head><body>${'<p>Real article text about energy. </p>'.repeat(60)}</body></html>`;

afterEach(() => {
  vi.unstubAllGlobals();
  resetAccessMemo();
});

describe('judging what the destination returned', () => {
  const base = { status: 200, finalUrl: 'https://example.org/a', contentType: 'text/html; charset=utf-8', checkedAt };

  it('passes a readable page with no wall', () => {
    const v = judge({ ...base, head: bytes(article) });
    expect('transient' in v).toBe(false);
    expect((v as AccessVerdict).status).toBe('verified_open');
    expect((v as AccessVerdict).checkedAt).toBe(checkedAt);
  });

  it('passes a real PDF and refuses a fake one', () => {
    expect((judge({ ...base, contentType: 'application/pdf', head: bytes('%PDF-1.7 ...') }) as AccessVerdict).status).toBe('verified_open');
    expect((judge({ ...base, contentType: 'application/pdf', head: bytes('<html>login</html>') }) as AccessVerdict).status).toBe('unknown');
  });

  it('marks a publisher-declared paywall as gated', () => {
    const page = article.replace('<head>', '<head><script type="application/ld+json">{"isAccessibleForFree": false}</script>');
    expect((judge({ ...base, head: bytes(page) }) as AccessVerdict).status).toBe('gated');
  });

  it('marks a redirect to a sign-in page as gated', () => {
    expect((judge({ ...base, finalUrl: 'https://publisher.com/login?next=/a', head: bytes(article) }) as AccessVerdict).status).toBe('gated');
  });

  it('never publishes a bot challenge (p. 209 "CAPTCHA-blocked ... remain unpublished")', () => {
    const wall = '<html><head><title>Just a moment...</title></head><body>checking</body></html>';
    const v = judge({ ...base, status: 403, head: bytes(wall) });
    expect('transient' in v && v.verdict.status).toBe('unknown');
  });

  it('is not fooled by the bot-protection script ordinary pages carry', () => {
    // unep.org and ifrs.org embed these on normal pages (25 Sep 2026).
    const page = article.replace('</head>', "<script src='/cdn-cgi/challenge-platform/scripts/jsd/main.js'></script><script src='/_Incapsula_Resource?x=1'></script></head>");
    expect((judge({ ...base, head: bytes(page) }) as AccessVerdict).status).toBe('verified_open');
  });

  it('treats a near-empty page as unconfirmed, not open', () => {
    const v = judge({ ...base, head: bytes('<html><body><div id="app"></div></body></html>') });
    expect('transient' in v && v.verdict.status).toBe('unknown');
  });

  it('refuses an image served where a document was promised', () => {
    expect((judge({ ...base, contentType: 'image/jpeg', head: bytes('xxxx') }) as AccessVerdict).status).toBe('unknown');
  });

  it('maps 401/402 to gated and 404/410 to broken', () => {
    expect((judge({ ...base, status: 401, head: bytes('') }) as AccessVerdict).status).toBe('gated');
    expect((judge({ ...base, status: 410, head: bytes('') }) as AccessVerdict).status).toBe('broken');
  });
});

describe('the check itself', () => {
  it('fails closed to unknown when the destination does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('timeout'); }));
    const v = await checkAccess('https://slow.example.org/x');
    expect(v.status).toBe('unknown');
  });

  it('follows redirects anonymously and records the real check time', async () => {
    const fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.redirect).toBe('follow');
      expect(init?.credentials).toBe('omit');
      const res = new Response(article, { status: 200, headers: { 'Content-Type': 'text/html' } });
      Object.defineProperty(res, 'url', { value: 'https://final.example.org/article' });
      return res;
    });
    vi.stubGlobal('fetch', fetch);
    const before = Date.now();
    const v = await checkAccess('https://doi.org/10.1/x');
    expect(v.status).toBe('verified_open');
    expect(v.finalUrl).toBe('https://final.example.org/article');
    expect(Date.parse(v.checkedAt)).toBeGreaterThanOrEqual(before - 1000);
    // Remembered: a second call does not request again.
    await checkAccess('https://doi.org/10.1/x');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('writes the verdict onto provenance, keeping the documented OA evidence', () => {
    const p = buildProvenance('openalex', { sourceUrl: 'https://x', accessEvidence: 'Documented open access: is_oa.' });
    expect(p.accessStatus).toBe('unknown');
    expect(p.accessCheckedAt).toBeNull();
    const out = applyVerdict(p, { status: 'verified_open', checkedAt, evidence: 'Opened.', finalUrl: 'https://x' });
    expect(out.accessStatus).toBe('verified_open');
    expect(out.accessCheckedAt).toBe(checkedAt);
    expect(out.accessEvidence).toBe('Documented open access: is_oa. Opened.');
  });
});

describe('checking only what could be displayed', () => {
  const verdict = (status: AccessVerdict['status']): AccessVerdict => ({ status, checkedAt, evidence: '', finalUrl: null });

  it('walks the ranked list in order and stops once enough have passed', async () => {
    const seen: string[] = [];
    const check = async (url: string) => {
      seen.push(url);
      return verdict(url.includes('gated') ? 'gated' : 'verified_open');
    };
    const items = ['a', 'gated-b', 'c', 'd', 'e', 'f'].map((id) => ({ id, url: `https://x/${id}` }));
    const out = await firstVerified(items, { url: (i) => i.url, limit: 2, check });
    expect(out.map((o) => o.item.id)).toEqual(['a', 'c']);
    // Never checked: records that could not have been shown.
    expect(seen).not.toContain('https://x/e');
    expect(seen).not.toContain('https://x/f');
  });

  it('tries a vetted alternative copy when the first destination is gated (p. 209)', async () => {
    const check = async (url: string) => verdict(url.includes('publisher') ? 'unknown' : 'verified_open');
    const items = [{ urls: ['https://publisher.com/pdf', 'https://repository.org/copy'] }];
    const out = await firstVerified(items, { urls: (i) => i.urls, limit: 1, check });
    expect(out[0].url).toBe('https://repository.org/copy');
  });
});

it('does not count site navigation as the full document', () => {
  // An article teaser surrounded by a long menu is not complete reading access.
  const page = `<html><body><nav>${'<p>Menu links and unrelated words </p>'.repeat(100)}</nav><article><p>A short abstract.</p></article></body></html>`;
  const verdict = judge({ status: 200, finalUrl: 'https://example.org/abstract', contentType: 'text/html', checkedAt, head: bytes(page) });
  expect('transient' in verdict ? verdict.verdict.status : verdict.status).toBe('unknown');
});

it('keeps an abstract-only scholarly landing page unpublished', () => {
  const page = `<html><head><meta name="citation_title" content="Study"></head><body><h2>Abstract</h2>${'<p>Summary of the study findings. </p>'.repeat(80)}</body></html>`;
  const verdict = judge({ status: 200, finalUrl: 'https://journal.example/abstract', contentType: 'text/html', checkedAt, head: bytes(page) });
  expect('transient' in verdict ? verdict.verdict.status : verdict.status).toBe('unknown');
});
