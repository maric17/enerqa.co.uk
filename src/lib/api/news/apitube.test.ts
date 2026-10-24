import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fetchFromProvider, providerKey } from '../core/fetch';
import { ok } from '../core/types';
import { apiTubeQuery, fetchApiTubeBasket, fetchApiTubeQuery, mapApiTubeResults, rejectApiTubeBody } from './apitube';
import { hasApiTubeApproval, screenApiTubeItem } from './apitubeScreening';

vi.mock('../core/fetch', () => ({ fetchFromProvider: vi.fn(), providerKey: vi.fn() }));
const raw = (over = {}) => ({ id: 123, title: 'Solar power replaces coal generation', description: 'Renewable electricity expands.',
  href: 'https://www.theguardian.com/environment/solar', published_at: new Date().toISOString(), language: 'en',
  categories: [{ id: 319, name: 'renewable energy', score: 2.5,
    links: { self: 'https://api.apitube.io/v1/news/category/iptc_mediatopics/medtop:20000257' } }], ...over });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(providerKey).mockReturnValue('private-test-key');
  vi.mocked(fetchFromProvider).mockResolvedValue(ok('apitube', { status: 'ok', results: [] })); });
afterEach(() => vi.restoreAllMocks());

it('translates industry prefix searches into supported title predicates without changing quoted phrases', () => {
  expect(apiTubeQuery('(manufactur* OR steel*) AND (electric* OR "renewable energy")'))
    .toBe('(title.pattern:"manufactur" OR title.pattern:"steel") AND (title.pattern:"electric" OR "renewable energy")');
});

it('keeps the key in a header and respects APITube source, language, category and date limits', async () => {
  await fetchApiTubeQuery('solar OR hydrogen', 3600, true, ['en', 'ar', 'fr', 'de'], { days: 60, basket: 'energy' });
  const [provider, url, options] = vi.mocked(fetchFromProvider).mock.calls[0];
  const params = new URL(url).searchParams;
  expect(provider).toBe('apitube'); expect(url).not.toContain('private-test-key');
  expect(options?.headers).toEqual({ 'X-API-Key': 'private-test-key' });
  expect(params.get('query')).toBe('solar OR hydrogen');
  expect(params.get('source.domain')?.split(',')).toHaveLength(3);
  expect(params.get('language.code')).toBe('en,ar,fr');
  expect(params.get('category.id')?.split(',').length).toBeLessThanOrEqual(3);
  expect(params.get('per_page')).toBe('10');
  expect(Date.now() - Date.parse(params.get('published_at.start')!)).toBeLessThan(31 * 86400000 + 1000);
  expect(Date.parse(params.get('published_at.end')!) - Date.parse(params.get('published_at.start')!)).toBe(31 * 86400000);
  expect(params.get('fl')).not.toMatch(/body|summary/);
});

it('maps numeric article IDs and canonical category links without copying article bodies', () => {
  const [item] = mapApiTubeResults([null, {}, raw({ body: 'PRIVATE FULL BODY', summary: ['Generated summary'] })], new Date().toISOString());
  expect(item).toMatchObject({ provider: 'apitube', sourceId: '123', providerLabel: 'APITube', summary: 'Renewable electricity expands.',
    providerCategories: [{ id: 'medtop:20000257', name: 'renewable energy', score: 2.5 }] });
  expect(JSON.stringify(item)).not.toContain('PRIVATE FULL BODY');
  expect(JSON.stringify(item)).not.toContain('Generated summary');
  expect(hasApiTubeApproval(screenApiTubeItem(item))).toBe(true);
  expect(hasApiTubeApproval({ ...screenApiTubeItem(item), providerCategories: [] })).toBe(false);
});

it.each([
  ["Newspaper headlines: 'Burnham faces climate revolt' and 'Harry wants to fix feud'", 'Climate change appears in a mixed digest.'],
  ['Lara Croft’s voice actor recalls Tomb Raider', 'An interview about a video game.'],
  ['France riots disrupt Hollywood movie shoots', 'Film production is disrupted.'],
  ['Cobb climate summary & weather forecast', 'A daily local weather forecast.'],
])('rejects a provider-misclassified story before publication: %s', (title, description) => {
  const [item] = mapApiTubeResults([raw({ title, description, categories: [{ id: 'medtop:20000418', name: 'climate change', score: 2 }] })], new Date().toISOString());
  expect(screenApiTubeItem(item).editorialReview?.decision).toBe('rejected');
});

it('requires sustainable-finance context instead of treating every finance story as ESG', () => {
  const categories = [{ id: 'medtop:04000000', name: 'economy, business and finance' }];
  const items = mapApiTubeResults([raw({ title: 'Green bonds fund renewable energy', description: 'Sustainable finance supports decarbonisation.', categories }),
    raw({ title: 'Company appoints new chief executive', description: 'The board announced an appointment.', categories })], new Date().toISOString());
  expect(screenApiTubeItem(items[0]).editorialReview?.topics).toContain('business');
  expect(screenApiTubeItem(items[1]).editorialReview?.decision).toBe('rejected');
});

it('recognizes corporate deforestation obligations as ESG coverage without relying on the acronym', () => {
  const [item] = mapApiTubeResults([raw({ title: 'Corporate lobbyists seek to dilute deforestation law',
    description: 'Companies challenge environmental obligations.', categories: [{ id: 'medtop:06000000', name: 'environment' }] })], new Date().toISOString());
  expect(screenApiTubeItem(item).editorialReview?.topics).toEqual(['environment', 'business']);
});

it('does not mistake a Wall Street accountability story for stock-market reporting', () => {
  const categories = [{ id: 'medtop:04000000', name: 'economy, business and finance' }];
  const [legal, market] = mapApiTubeResults([
    raw({ title: 'Lawmakers propose accountability bill for Wall Street bosses', description: 'Legislators introduce new legal obligations.', categories }),
    raw({ title: 'FTSE stocks fall as London trading opens', description: 'Share prices decline.', categories }),
  ], new Date().toISOString());
  expect(screenApiTubeItem(legal).editorialReview?.decision).toBe('rejected');
  expect(screenApiTubeItem(market).editorialReview?.topics).toEqual(['markets']);
});

it('handles missing credentials, malformed replies and exhausted quotas without exposing provider messages', async () => {
  vi.mocked(providerKey).mockReturnValue(null);
  expect((await fetchApiTubeBasket('climate')).ok).toBe(false); expect(fetchFromProvider).not.toHaveBeenCalled();
  expect(rejectApiTubeBody({ status: 'ok', results: [] })).toBeNull();
  expect(rejectApiTubeBody({ status: 'ok', results: {} })?.reason).toBe('unavailable');
  expect(rejectApiTubeBody({ errors: [{ code: 'ER0176', message: 'secret' }] })?.reason).toBe('rate_limited');
  expect(JSON.stringify(rejectApiTubeBody({ errors: [{ message: 'secret' }] }))).not.toContain('secret');
});
