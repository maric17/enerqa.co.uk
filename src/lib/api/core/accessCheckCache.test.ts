import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkAccess, RECHECK_SECONDS, resetAccessMemo } from './accessCheck';
import { savedAccessCheck, saveAccessCheck } from './storage';
import { unstable_cache } from 'next/cache';

vi.mock('./storage', () => ({ savedAccessCheck: vi.fn(), saveAccessCheck: vi.fn() }));
// Detect using a second cache: background rejection escapes the caller's error handler.
vi.mock('next/cache', () => ({ unstable_cache: vi.fn(callback => callback) }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(unstable_cache).mockReset().mockImplementation(callback => callback);
  resetAccessMemo();
  vi.mocked(savedAccessCheck).mockResolvedValue(null);
  vi.mocked(saveAccessCheck).mockResolvedValue();
});
afterEach(() => { resetAccessMemo(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('access verdict cache and temporary source failures', () => {
  it('does not serve an expired approval or log a background cache error when the next check times out', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    let revalidation = Promise.resolve();
    const stale = { status: 'verified_open', checkedAt: new Date(Date.now() - 8 * 86400000).toISOString(), evidence: 'Expired approval.', finalUrl: null };
    // Model Next's stale-while-revalidate path: the caller cannot catch this rejection.
    vi.mocked(unstable_cache).mockImplementationOnce(callback => (async (...args: unknown[]) => {
      revalidation = callback(...args).then(() => {}).catch(error => console.error('revalidating cache with key: access-check', error));
      return stale;
    }) as typeof callback);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection timed out')));
    const verdict = await checkAccess('https://doi.org/10.5194/egusphere-egu25-14671');
    await revalidation;
    expect(verdict.status).toBe('unknown');
    expect(verdict.evidence).toContain('connection timed out');
    expect(log).not.toHaveBeenCalled();
    expect(saveAccessCheck).toHaveBeenCalledWith(expect.any(String), verdict, 1800);
  });

  it('shares one pending request and evidence write for simultaneous checks of the same URL', async () => {
    const fetch = vi.fn(async () => new Response('%PDF-1.7 complete document', { headers: { 'Content-Type': 'application/pdf' } }));
    vi.stubGlobal('fetch', fetch);
    const [first, second] = await Promise.all([checkAccess('https://example.org/paper.pdf'), checkAccess('https://example.org/paper.pdf')]);
    expect(first).toEqual(second);
    expect(first.status).toBe('verified_open');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(saveAccessCheck).toHaveBeenCalledTimes(1);
    expect(saveAccessCheck).toHaveBeenCalledWith(expect.any(String), first, RECHECK_SECONDS);
  });

  it('retries an uncertain result after 30 minutes and can recover to a verified document', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(new Response('%PDF-1.7 complete document', { headers: { 'Content-Type': 'application/pdf' } }));
    vi.stubGlobal('fetch', fetch);
    const now = Date.now();
    const url = 'https://example.org/retry.pdf';
    expect((await checkAccess(url, now)).status).toBe('unknown');
    expect((await checkAccess(url, now + 1799000)).status).toBe('unknown');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect((await checkAccess(url, now + 1800001)).status).toBe('verified_open');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('uses shared saved evidence without another source request', async () => {
    const verdict = { status: 'verified_open' as const, checkedAt: new Date().toISOString(), evidence: 'Verified full PDF.', finalUrl: 'https://example.org/paper.pdf' };
    vi.mocked(savedAccessCheck).mockResolvedValue(verdict);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(await checkAccess(verdict.finalUrl)).toEqual(verdict);
    expect(fetch).not.toHaveBeenCalled();
    expect(saveAccessCheck).not.toHaveBeenCalled();
  });

  it('keeps a provider 503 or bot wall unconfirmed with a short retry interval', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status: 503 })));
    const verdict = await checkAccess('https://example.org/unavailable');
    expect(verdict.status).toBe('unknown');
    expect(saveAccessCheck).toHaveBeenCalledWith(expect.any(String), verdict, 1800);
  });
});
