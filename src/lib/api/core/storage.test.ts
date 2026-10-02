import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reserveRequest, storeRecords } from './storage';

const mocks = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn(), connect: vi.fn() }));
vi.mock('pg', () => ({ Pool: class { connect = mocks.connect; query = mocks.query; } }));
beforeEach(() => {
  vi.stubEnv('DATABASE_URI', 'postgres://fixture');
  delete (globalThis as { __enerqaProviderStorage?: unknown }).__enerqaProviderStorage;
  mocks.query.mockReset(); mocks.release.mockReset();
  mocks.connect.mockResolvedValue({ query: mocks.query, release: mocks.release });
  mocks.query.mockResolvedValue({ rows: [{ daily: '0', recent: '0', last: null }] });
});
afterEach(() => { vi.unstubAllEnvs(); });

describe('shared provider request accounting', () => {
  it('locks, counts and reserves on one transaction before releasing the connection', async () => {
    expect(await reserveRequest('newsdata')).toBeNull();
    const sql = mocks.query.mock.calls.map(([q]) => q);
    expect(sql[0]).toBe('BEGIN');
    expect(sql.findIndex(q => q.includes('pg_advisory_xact_lock'))).toBeLessThan(sql.findIndex(q => q.includes('SELECT count')));
    expect(sql).toContain('INSERT INTO enerqa_connectors.provider_requests(provider) VALUES ($1)');
    expect(sql.at(-1)).toBe('COMMIT');
    expect(mocks.release).toHaveBeenCalledOnce();
  });
  it('refuses exhausted daily and hourly budgets without spending again', async () => {
    mocks.query.mockResolvedValue({ rows: [{ daily: '150', recent: '0', last: null }] });
    expect(await reserveRequest('newsdata')).toMatch(/daily/);
    mocks.query.mockResolvedValue({ rows: [{ daily: '50', recent: '50', last: null }] });
    expect(await reserveRequest('oecd-sdmx')).toMatch(/rolling/);
    expect(mocks.query.mock.calls.some(([q]) => q.startsWith('INSERT'))).toBe(false);
  });
  it('rolls back a failed database operation and releases its connection', async () => {
    mocks.query.mockRejectedValueOnce(new Error('fixture connection error'));
    await expect(reserveRequest('newsdata')).rejects.toThrow('fixture connection error');
    expect(mocks.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mocks.release).toHaveBeenCalledOnce();
  });
  it('fails closed when a real server has no shared ledger', async () => {
    vi.stubEnv('DATABASE_URI', ''); vi.stubEnv('NODE_ENV', 'production');
    expect(await reserveRequest('newsdata')).toMatch(/not configured/);
  });
});

it('stores the original record, actual check time and separate retrieval time', async () => {
  const record = { provider: 'openalex' as const, sourceId: 'W123', destination: 'https://repository.example/full.pdf',
    accessStatus: 'verified_open', accessCheckedAt: '2026-10-02T00:00:00Z', retrievedAt: '2026-10-01T00:00:00Z', record: { doi: '10.1/test', licence: 'CC0' } };
  expect(await storeRecords([record])).toBe(true);
  expect(JSON.parse(mocks.query.mock.calls[0][1][0])).toEqual([record]);
  expect(mocks.query.mock.calls[0][0]).toContain('ON CONFLICT');
});
