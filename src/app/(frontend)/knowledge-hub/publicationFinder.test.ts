import { describe, it, expect } from 'vitest';
import { facetCounts, lexicalText, matchesFacets, matchPublication, paginate, searchWords, sortByDate } from './publicationFinder';
import { queryTerms } from '../search/searchIndex';

// A minimal Lexical document, shaped like the rebuilt publication bodies.
const doc = {
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Hydrogen colours' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Green hydrogen is made' }, { type: 'text', text: ' by electrolysis.' }] },
      { type: 'list', children: [{ type: 'listitem', children: [{ type: 'text', text: 'Blue uses CCS' }] }] },
    ],
  },
};

const pub = (title: string, text: string) => ({ title, searchText: searchWords(title, text) });

describe('lexicalText', () => {
  it('joins the text of every block, keeping block boundaries as spaces', () => {
    expect(lexicalText(doc.root)).toBe('Hydrogen colours Green hydrogen is made by electrolysis. Blue uses CCS');
  });

  it('returns an empty string for a missing body', () => {
    expect(lexicalText(null)).toBe('');
    expect(lexicalText(undefined)).toBe('');
  });
});

describe('searchWords', () => {
  it('keeps each normalised word once, so the index stays small', () => {
    expect(searchWords('Carbon carbon CARBON', 'footprint')).toBe('carbon footprint');
  });

  it('ignores empty parts', () => {
    expect(searchWords(null, undefined, '', 'ESG')).toBe('esg');
  });

  it('folds Arabic letter variants like the site search does', () => {
    expect(searchWords('أمن الطاقة')).toBe('امن الطاقة');
  });
});

describe('matchPublication (K03: titles, article text, summaries and tags)', () => {
  const hydrogen = pub('Exploring the Rainbow of Hydrogen Technology', lexicalText(doc.root));
  const tourism = pub('Sustainable Tourism', 'Tourism is a powerful driver of economic growth');

  it('matches everything when there is no query', () => {
    expect(matchPublication(tourism, [])).toBeGreaterThan(0);
  });

  it('finds a word that appears only in the article body', () => {
    expect(matchPublication(hydrogen, queryTerms('electrolysis'))).toBeGreaterThan(0);
    expect(matchPublication(tourism, queryTerms('electrolysis'))).toBe(0);
  });

  it('matches the start of a word while typing ("hydro" finds hydrogen)', () => {
    expect(matchPublication(hydrogen, queryTerms('hydro'))).toBeGreaterThan(0);
  });

  it('matches plural and singular forms ("emissions" finds "emission")', () => {
    expect(matchPublication(pub('Scope 4', 'avoided emission reporting'), queryTerms('emissions'))).toBeGreaterThan(0);
  });

  it('requires every search word, so extra words narrow the results', () => {
    expect(matchPublication(hydrogen, queryTerms('green hydrogen'))).toBeGreaterThan(0);
    expect(matchPublication(hydrogen, queryTerms('green tourism'))).toBe(0);
  });

  it('ranks a title match above a body-only match', () => {
    const inTitle = pub('Hydrogen in the Gulf', 'policy');
    const inBody = pub('Energy policy', 'mentions hydrogen once');
    expect(matchPublication(inTitle, queryTerms('hydrogen'))).toBeGreaterThan(matchPublication(inBody, queryTerms('hydrogen')));
  });
});

describe('sortByDate', () => {
  it('lists verified dates newest first, then unverified ones, so a placeholder date never looks newest', () => {
    const items = [
      { title: 'B placeholder', date: '2024-12-01T00:00:00.000Z', dateVerified: false },
      { title: 'Old verified', date: '2022-10-09T12:00:00.000Z', dateVerified: true },
      { title: 'A placeholder', date: '2024-12-01T00:00:00.000Z', dateVerified: false },
      { title: 'New verified', date: '2024-10-10T12:00:00.000Z', dateVerified: true },
    ];
    expect(sortByDate(items).map((i) => i.title)).toEqual(['New verified', 'Old verified', 'A placeholder', 'B placeholder']);
  });

  it('does not change the input array', () => {
    const items = [{ title: 'b', date: null, dateVerified: false }, { title: 'a', date: null, dateVerified: false }];
    sortByDate(items);
    expect(items.map((i) => i.title)).toEqual(['b', 'a']);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('returns one page of items and the page count', () => {
    expect(paginate(items, 1, 10)).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], page: 1, pageCount: 3 });
    expect(paginate(items, 3, 10).items).toEqual([21, 22, 23, 24, 25]);
  });

  it('clamps a page number that is out of range (e.g. after a filter shrinks the list)', () => {
    expect(paginate(items, 9, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
  });

  it('always reports at least one page, even with no results', () => {
    expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pageCount: 1 });
  });
});

describe('facetCounts (no filter option leads to an empty list)', () => {
  const card = (slug: string, title: string, text: string, date: string, archiveCategory: string | null) => ({
    id: slug, slug, title, excerpt: null, author: null, date, dateVerified: true, type: 'Article', language: 'en',
    archiveCategory, fileUrl: null, image: null, domains: [], industries: [], searchText: searchWords(title, text),
  });
  const pubs = [
    card('hydrogen', 'Rainbow of Hydrogen', 'electrolysis', '2024-05-01T12:00:00.000Z', 'energy-technology-and-finance'),
    card('scwt', 'Supercritical Water', 'hydrothermal waste', '2024-06-01T12:00:00.000Z', 'energy-technology-and-finance'),
    card('tourism', 'Sustainable Tourism', 'travel', '2024-07-01T12:00:00.000Z', 'environment-and-society'),
    card('sudan', "Sudan's Energy Balance 2020", 'power generation', '2022-10-09T12:00:00.000Z', null),
  ];
  const none = { archiveCategory: [], domain: [], industry: [], type: [], year: [], language: [] };

  it('counts every publication when nothing is selected', () => {
    const counts = facetCounts(pubs, [], none);
    expect(counts.year.get('2024')).toBe(3);
    expect(counts.year.get('2022')).toBe(1);
  });

  it('follows the search, so a year the search rules out counts 0', () => {
    const counts = facetCounts(pubs, queryTerms('hydro'), none);
    expect(counts.year.get('2024')).toBe(2);
    expect(counts.year.get('2022') ?? 0).toBe(0);
  });

  it('ignores the facet\'s own selection, because values in one facet are alternatives', () => {
    const counts = facetCounts(pubs, [], { ...none, year: ['2024'] });
    expect(counts.year.get('2022')).toBe(1);
  });

  it('follows the other facets\' selections', () => {
    const counts = facetCounts(pubs, [], { ...none, archiveCategory: ['environment-and-society'] });
    expect(counts.year.get('2024')).toBe(1);
    expect(counts.year.get('2022') ?? 0).toBe(0);
  });
});

describe('matchesFacets', () => {
  const pub = { date: '2022-10-09T12:00:00.000Z', archiveCategory: null, type: 'Article', language: 'en', author: 'A', domains: [{ slug: 'energy', title: 'Energy' }], industries: [] };
  const none = { archiveCategory: [], domain: [], industry: [], type: [], year: [], language: [] };

  it('ORs values inside a facet and ANDs across facets', () => {
    expect(matchesFacets(pub, { ...none, year: ['2024', '2022'] })).toBe(true);
    expect(matchesFacets(pub, { ...none, year: ['2022'], domain: ['water'] })).toBe(false);
  });
});
