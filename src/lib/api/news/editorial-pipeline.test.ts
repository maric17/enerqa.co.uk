import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { NewsItem } from './types';

const mocks = vi.hoisted(() => ({ create: vi.fn(), fetch: vi.fn(), store: vi.fn(), read: vi.fn() }));
vi.mock('openai', () => ({ default: class { responses = { create: mocks.create }; } }));
vi.mock('./thenewsapi', () => ({ fetchTheNewsApiQuery: mocks.fetch, fetchTheNewsApiBasket: vi.fn() }));
vi.mock('./storage', () => ({ readNewsStore: mocks.read }));
vi.mock('../core/storage', () => ({ storeRecords: mocks.store, reserveRequest: async () => null }));
vi.mock('../core/registry', () => ({ providerEnabled: (id: string) => ['openai', 'thenewsapi'].includes(id) }));
vi.mock('../ai-search/config', () => ({ AI_SEARCH_CONFIG: { releaseReady: true, answerModel: 'configured-model' } }));

import { fetchLiveNews } from './index';
import { ok } from '../core/types';
const item = (title: string, summary: string): NewsItem => ({
  id: 'https://www.bbc.co.uk/news/example', url: 'https://www.bbc.co.uk/news/example', domain: 'bbc.co.uk',
  title, summary, provider: 'thenewsapi', providerLabel: 'TheNewsAPI', publisher: 'BBC', language: 'en',
  publishedAt: new Date().toISOString(), retrievedAt: new Date().toISOString(), rights: 'Metadata', regions: [],
});
const check = vi.fn(async (url: string) => ({ status: 'verified_open' as const, checkedAt: new Date().toISOString(), finalUrl: url, evidence: 'Opened anonymously' }));

beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('NEWS_EDITORIAL_REVIEW_ENABLED', 'true'); vi.stubEnv('OPENAI_API_KEY', 'test-key');
  mocks.store.mockResolvedValue(true);
  mocks.read.mockResolvedValue({ items: [], state: {}, available: true });
});
afterEach(() => vi.unstubAllEnvs());

it('passes description-based discovery through real semantic review, anonymous access and storage', async () => {
  mocks.fetch.mockResolvedValue(ok('thenewsapi', [item('New rules for UK homes', 'Standards require renewable energy and efficient heating.')]));
  mocks.create.mockResolvedValue({ status: 'completed', output_text: JSON.stringify({ verdicts: [
    { index: 0, relevant: true, confidence: 0.98, topics: ['energy'], reason: 'Housing energy standards are the main subject.' },
  ] }) });
  const result = await fetchLiveNews({ query: 'energy', gdeltQuery: 'energy', providers: ['thenewsapi'], check });
  expect(result.items).toHaveLength(1);
  expect(result.items[0].editorialReview?.decision).toBe('approved');
  expect(result.items[0].accessStatus).toBe('verified_open');
  expect(check).toHaveBeenCalledOnce();
  expect(mocks.store.mock.calls[0][0][0].record.editorialReview.topics).toEqual(['energy']);
});

it('retains an existing approval during interactive rediscovery when automatic review is disabled', async () => {
  const saved = item('Solar farm opens', 'New renewable generation is connected to the grid.');
  saved.editorialReview = { version: '2026-10-23-v1', decision: 'approved', topics: ['energy'],
    title: saved.title, summary: saved.summary, reason: 'Solar generation is the primary subject.', reviewedAt: new Date().toISOString() };
  mocks.read.mockResolvedValue({ items: [saved], state: {}, available: true });
  mocks.fetch.mockResolvedValue(ok('thenewsapi', [{ ...saved, editorialReview: undefined }]));
  vi.stubEnv('NEWS_EDITORIAL_REVIEW_ENABLED', 'false');
  const result = await fetchLiveNews({ query: 'solar', gdeltQuery: 'solar', providers: ['thenewsapi'], check });
  expect(result.items).toHaveLength(1);
  expect(result.items[0].editorialReview).toEqual(saved.editorialReview);
  expect(mocks.create).not.toHaveBeenCalled();
});

it('withholds an incidental keyword match before article access and persists the refusal privately', async () => {
  mocks.fetch.mockResolvedValue(ok('thenewsapi', [item('Actor describes the climate on set', 'An interview about a television programme.')]));
  mocks.create.mockResolvedValue({ status: 'completed', output_text: JSON.stringify({ verdicts: [
    { index: 0, relevant: false, confidence: 0.99, topics: [], reason: 'Climate describes a workplace atmosphere, not environmental coverage.' },
  ] }) });
  const result = await fetchLiveNews({ query: 'climate', gdeltQuery: 'climate', providers: ['thenewsapi'], check });
  expect(result.items).toEqual([]);
  expect(check).not.toHaveBeenCalled();
  expect(mocks.store.mock.calls[0][0][0]).toMatchObject({ accessStatus: 'unknown',
    record: { accessStatus: 'unknown', editorialReview: { decision: 'rejected' } } });
});
