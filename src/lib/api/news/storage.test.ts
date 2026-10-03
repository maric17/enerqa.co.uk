import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NewsItem } from './types';

const mocks = vi.hoisted(() => ({ query: vi.fn(), available: true }));
vi.mock('../core/storage', () => ({ providerDatabase: () => mocks.available ? { query: mocks.query } : null }));
vi.mock('../core/accessCheck', () => ({ RECHECK_SECONDS: 7 * 86400 }));
import { claimNewsRefresh, finishNewsRefresh, readNewsStore } from './storage';

function row(over: Record<string, unknown> = {}) {
  const url = 'https://www.theguardian.com/article';
  const record: NewsItem = { id: url, url, title: 'Climate finance agreement', summary: null,
    domain: 'theguardian.com', provider: 'newsdata', publisher: 'The Guardian', providerLabel: 'NewsData.io',
    publishedAt: new Date().toISOString(), retrievedAt: new Date().toISOString(), language: 'en', regions: [], rights: 'Metadata' };
  return { provider: 'newsdata', source_id: 'source-id', destination: url, record,
    access_status: 'verified_open', access_checked_at: new Date(), retrieved_at: new Date(), verdict: null, ...over };
}

beforeEach(() => { mocks.query.mockReset(); mocks.available = true; });
afterEach(() => vi.restoreAllMocks());

describe('saved news evidence', () => {
  it('accepts recent verified news and excludes other stored record shapes and refused evidence', async () => {
    const saved = row();
    mocks.query.mockResolvedValue({ rows: [saved, row({ record: { doi: '10.1/test' } }), row({ access_status: 'gated' })] });
    const result = await readNewsStore();
    expect(result.available).toBe(true);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].accessStatus).toBe('verified_open');
    expect(result.items[0].url).toBe(saved.destination);
  });

  it('withholds expired access evidence on page reads while allowing background rechecks', async () => {
    mocks.query.mockResolvedValue({ rows: [row({ access_checked_at: new Date(Date.now() - 8 * 86400000) })] });
    expect((await readNewsStore()).items).toHaveLength(0);
    expect((await readNewsStore(true)).items).toHaveLength(1);
  });

  it('removes an old approved card immediately when a newer access check refused it', async () => {
    mocks.query.mockResolvedValue({ rows: [row({ access_checked_at: new Date(Date.now() - 1000), verdict: { status: 'gated', checkedAt: new Date().toISOString() } })] });
    expect((await readNewsStore()).items).toHaveLength(0);
  });

  it('does not accept an approved hostname stored alongside an unapproved destination', async () => {
    const saved = row();
    saved.record.url = 'https://unapproved.example/article';
    saved.destination = saved.record.url;
    mocks.query.mockResolvedValue({ rows: [saved] });
    // The read rebuilds the hostname so the existing allowlist can reject this record.
    expect((await readNewsStore()).items[0].domain).toBe('unapproved.example');
  });

  it('reports database failure without logging native connection details', async () => {
    mocks.query.mockRejectedValue(new Error('postgres://private-secret'));
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect((await readNewsStore()).available).toBe(false);
    expect(log).toHaveBeenCalledWith('[enerqa:news] Saved news could not be read.');
    mocks.available = false;
    expect((await readNewsStore()).available).toBe(false);
  });
});

describe('shared scheduled-job guard', () => {
  it('claims with one atomic slot and lease condition, without changing the schema', async () => {
    mocks.query.mockResolvedValue({ rows: [{ record: { lastSuccessAt: { newsdata: '2026-10-02T22:00:00Z' } } }] });
    const claim = await claimNewsRefresh();
    expect(claim?.state.lastSuccessAt?.newsdata).toBe('2026-10-02T22:00:00Z');
    expect(mocks.query).toHaveBeenCalledOnce();
    const [sql, parameters] = mocks.query.mock.calls[0];
    expect(sql).toContain('ON CONFLICT');
    expect(sql).toContain("previous.record->>'slot' IS DISTINCT FROM EXCLUDED.record->>'slot'");
    expect(sql).toContain("< (EXCLUDED.record->>'slot')::timestamptz");
    expect(sql).toContain('leaseUntil');
    expect(JSON.parse(parameters[2]).token).toBe(claim?.token);
  });

  it('returns no claim when the database rejects a duplicate slot', async () => {
    mocks.query.mockResolvedValue({ rows: [] });
    expect(await claimNewsRefresh()).toBeNull();
  });

  it('only finishes the current lease and retains the claim token outside public diagnostics', async () => {
    mocks.query.mockResolvedValue({ rowCount: 1 });
    await finishNewsRefresh({ token: 'private-lease', state: {} }, { lastCompletedAt: '2026-10-03T06:00:00Z' });
    const [sql, params] = mocks.query.mock.calls[0];
    expect(sql).toContain("record->>'token' = $4");
    expect(params[3]).toBe('private-lease');
    expect(JSON.parse(params[2]).leaseUntil).toBeNull();
    mocks.query.mockResolvedValue({ rowCount: 0 });
    await expect(finishNewsRefresh({ token: 'old-lease', state: {} }, {})).rejects.toThrow('no longer owned');
  });
});
