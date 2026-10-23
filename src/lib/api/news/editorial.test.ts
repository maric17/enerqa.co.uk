import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NewsItem } from './types';

const mocks = vi.hoisted(() => ({ create: vi.fn(), reserve: vi.fn(), enabled: true, releaseReady: true }));
vi.mock('openai', () => ({ default: class { responses = { create: mocks.create }; } }));
vi.mock('../core/registry', () => ({ providerEnabled: () => mocks.enabled }));
vi.mock('../core/storage', () => ({ reserveRequest: mocks.reserve }));
vi.mock('../ai-search/config', () => ({ AI_SEARCH_CONFIG: { get releaseReady() { return mocks.releaseReady; }, answerModel: 'configured-model' } }));

import { parseEditorialVerdicts, reviewNewsItems, type EditorialStats } from './editorial';
import { hasEditorialApproval, matchesBasket, getBasket } from './types';

const article = (title: string, summary: string | null = null): NewsItem => ({
  id: title, title, summary, url: 'https://www.bbc.co.uk/news/article', domain: 'bbc.co.uk', publisher: 'BBC',
  publishedAt: new Date().toISOString(), retrievedAt: new Date().toISOString(), language: 'en', regions: [],
  provider: 'thenewsapi', providerLabel: 'TheNewsAPI', rights: 'Metadata',
});
const stats = (): EditorialStats => ({ approved: 0, rejected: 0, pending: 0, issue: null });
const verdict = (over = {}) => ({ index: 0, relevant: true, confidence: 0.98, topics: ['energy'], reason: 'The primary subject is home heating decarbonisation.', ...over });
const respond = (verdicts: unknown[]) => mocks.create.mockResolvedValue({ status: 'completed', output_text: JSON.stringify({ verdicts }) });

beforeEach(() => {
  vi.resetAllMocks(); mocks.enabled = true; mocks.releaseReady = true;
  mocks.reserve.mockResolvedValue(null);
  vi.stubEnv('OPENAI_API_KEY', 'test-key'); vi.stubEnv('NEWS_EDITORIAL_REVIEW_ENABLED', 'true');
});
afterEach(() => vi.unstubAllEnvs());

describe('meaning-based news review', () => {
  it('approves a story from its description and uses reviewed categories without requiring headline keywords', async () => {
    respond([verdict()]);
    const item = article('New rules for UK homes', 'The new standards require low-carbon heating and better insulation.');
    const counters = stats(); const [reviewed] = await reviewNewsItems([item], counters);
    expect(hasEditorialApproval(reviewed)).toBe(true);
    expect(matchesBasket(reviewed, getBasket('energy'))).toBe(true);
    expect(matchesBasket(reviewed, getBasket('business'))).toBe(false);
    expect(counters).toMatchObject({ approved: 1, pending: 0, issue: null });
    expect(mocks.create.mock.calls[0][0]).toMatchObject({ store: false, model: 'configured-model', text: { format: { strict: true } } });
    expect(hasEditorialApproval({ ...reviewed, summary: 'The article was changed.' })).toBe(false);
    // Identical text reuses its saved review and does not buy another model call.
    await reviewNewsItems([reviewed], stats());
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });

  it('rejects the exact client screenshot digest without calling an AI provider', async () => {
    const [item] = await reviewNewsItems([article("Newspaper headlines: 'Burnham faces climate revolt' and 'Harry wants to fix feud'",
      'Several papers lead on remarks from the Duke of Sussex about reconciling with his family.')], stats());
    expect(item.editorialReview?.decision).toBe('rejected');
    expect(matchesBasket(item, getBasket('climate'))).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([{ relevant: false, topics: [] }, { confidence: 0.5 }])('withholds negative or uncertain semantic decisions: %j', async (decision) => {
    respond([verdict(decision)]);
    const [item] = await reviewNewsItems([article('Actor describes the climate on set')], stats());
    expect(item.editorialReview?.decision).toBe('rejected');
    expect(hasEditorialApproval(item)).toBe(false);
  });

  it.each(['provider', 'flag', 'key'])('makes no paid call when the %s switch is off', async (switchOff) => {
    if (switchOff === 'provider') mocks.enabled = false;
    if (switchOff === 'flag') vi.stubEnv('NEWS_EDITORIAL_REVIEW_ENABLED', 'false');
    if (switchOff === 'key') vi.stubEnv('OPENAI_API_KEY', '');
    const counters = stats(); const [item] = await reviewNewsItems([article('Solar investment grows')], counters);
    expect(hasEditorialApproval(item)).toBe(false);
    expect(counters).toMatchObject({ pending: 1, issue: 'editorial_review_not_enabled' });
    expect(mocks.reserve).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
  });

  it('keeps scheduled news review independent of the public AI-search release', async () => {
    mocks.releaseReady = false; respond([verdict()]);
    const [item] = await reviewNewsItems([article('Solar investment grows')], stats());
    expect(hasEditorialApproval(item)).toBe(true);
  });

  it('keeps a missing, malformed, refused or interrupted model response unpublished', async () => {
    for (const output of [{ status: 'incomplete', output_text: '{}' }, { status: 'completed', output_text: '{}' },
      { status: 'completed', output_text: JSON.stringify({ verdicts: [verdict({ index: 7 })] }) }]) {
      mocks.create.mockResolvedValue(output);
      const counters = stats(); const [item] = await reviewNewsItems([article('Solar investment grows')], counters);
      expect(item.editorialReview?.decision).toBe('pending');
      expect(counters.issue).toBe('editorial_review_unavailable');
    }
  });

  it('honors the distributed budget before sending article metadata', async () => {
    mocks.reserve.mockResolvedValue('daily budget reached');
    const counters = stats(); await reviewNewsItems([article('Solar investment grows')], counters);
    expect(counters.issue).toBe('editorial_review_budget_reached');
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate indices and unknown topics instead of trusting structurally valid JSON', () => {
    expect(() => parseEditorialVerdicts(JSON.stringify({ verdicts: [verdict(), verdict()] }), 2)).toThrow();
    expect(() => parseEditorialVerdicts(JSON.stringify({ verdicts: [verdict({ topics: ['celebrity'] })] }), 1)).toThrow();
  });
});
