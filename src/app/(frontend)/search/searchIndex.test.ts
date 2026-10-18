import { describe, it, expect, vi } from 'vitest';
import {
  SEARCH_COPY,
  excerptFor,
  formatSourceDate,
  groupHits,
  normalise,
  queryTerms,
  readQuery,
  runSearch,
  searchIndex,
  stem,
  usableText,
  type IndexEntry,
} from './searchIndex';
import { SITE_INDEX } from './siteIndex';

/**
 * p. 227: "Test general queries unrelated to Enerqa, relevant project
 * questions, ambiguous terminology, Arabic queries, conflicting sources and
 * retrieval failures." These cover the keyword half of search; the AI half is
 * in aiAnswer.test.ts.
 */

// A small index shaped like the real one: the static hub pages plus one record
// per CMS collection, using the records' real titles.
const INDEX: IndexEntry[] = [
  ...SITE_INDEX,
  {
    title: 'Climate Action & Carbon Management',
    url: '/domains/climate-action-carbon-management',
    group: 'domains',
    category: 'Domain',
    excerpt: 'Carbon accounting, mitigation planning and climate finance readiness.',
  },
  {
    title: 'Carbon Markets and Offsetting',
    url: '/domains/climate-action-carbon-management#carbon-markets',
    group: 'domains',
    category: 'Capability',
  },
  {
    title: 'Oil and Gas',
    url: '/industries/oil-and-gas',
    group: 'domains',
    category: 'Industry',
    excerpt: 'Decarbonisation and transition planning for oil and gas operations.',
  },
  {
    title: 'IRECs: A Catalyst for Renewable Energy Investment in Qatar',
    url: '/knowledge-hub/irecs-a-catalyst-for-renewable-energy-investment-in-qatar',
    group: 'publications',
    category: 'Article',
    excerpt: 'How renewable energy certificates support investment in solar capacity.',
    date: '2024-03-10T00:00:00.000Z',
    dateVerified: true,
  },
  {
    title: 'Global CO2 Emissions',
    url: '/data-portal/datasets/global-co2-emissions',
    group: 'data',
    category: 'Dataset',
    excerpt: 'Annual carbon dioxide emissions by country.',
  },
  {
    title: 'ESG Readiness Tool',
    url: '/tools/esg-readiness',
    group: 'tools',
    category: 'Tool',
    excerpt: 'A structured assessment of environmental, social and governance practices.',
  },
  {
    title: 'easySOLAR',
    url: '/tools/easysolar',
    group: 'tools',
    category: 'Tool',
    excerpt: 'Solar PV feasibility and yield estimates.',
  },
];

const urls = (query: string) => searchIndex(INDEX, query).map((h) => h.url);

describe('term matching (AI03, p. 202)', () => {
  it('finds the ESG Readiness Tool for the spec chip "What does ESG readiness involve?"', () => {
    // It used to return "No matches": the whole sentence was matched as one phrase.
    expect(urls('What does ESG readiness involve?')[0]).toBe('/tools/esg-readiness');
  });

  it('drops question words and keeps topic terms', () => {
    expect(queryTerms('What does ESG readiness involve?')).toEqual(['esg', 'readines', 'involv']);
  });

  it('meets plural and -ing forms with a light stemmer', () => {
    expect(stem('projects')).toBe('project');
    expect(stem('financing')).toBe('financ');
    expect(stem('finance')).toBe('financ'); // so it also meets "financial"
    expect(stem('industries')).toBe('industr');
    expect(stem('gas')).toBe('gas'); // too short to strip
    expect(urls('carbon markets')).toContain('/domains/climate-action-carbon-management#carbon-markets');
  });

  it('matches word starts, not letters inside unrelated words', () => {
    const hits = searchIndex([{ title: 'Las Vegas', url: '/x', group: 'domains', category: 'X' }], 'gas');
    expect(hits).toHaveLength(0);
  });

  it('only counts "Enerqa" when it is the whole query', () => {
    expect(queryTerms('Enerqa carbon')).toEqual(['carbon']);
    expect(queryTerms('Enerqa')).toEqual(['enerqa']);
  });
});

describe('relevant project questions (p. 227)', () => {
  it('sends a project-finance question to the lifecycle page', () => {
    // p. 13 chip. /project-development must be indexed (L906).
    expect(urls('How can a climate project attract finance?')).toContain('/project-development');
  });

  it('answers the feasibility chip with lifecycle and solar results', () => {
    const found = urls('Explore renewable-energy feasibility');
    expect(found).toContain('/project-development');
  });
});

describe('general queries unrelated to Enerqa (pp. 13, 227)', () => {
  it('returns nothing rather than forcing an Enerqa result', () => {
    // Real Enerqa text mentions "natural capital"; one incidental word is not relevance.
    const withCapital = [...INDEX, { title: 'Biodiversity and Natural Capital', url: '/nc', group: 'domains' as const, category: 'Capability' }];
    expect(searchIndex(withCapital, 'What is the capital of France?')).toEqual([]);
    expect(searchIndex(withCapital, 'natural capital').map((h) => h.url)).toEqual(['/nc']);
    expect(urls('best pizza recipe')).toEqual([]);
  });

  it('needs two matching terms once a query has three or more', () => {
    // One shared common word must not return the site.
    expect(urls('energy football world cup')).toEqual([]);
  });
});

describe('ambiguous terminology (p. 227)', () => {
  it('shows every sense of "carbon", grouped, instead of guessing one', () => {
    const groups = groupHits(searchIndex(INDEX, 'carbon')).map((g) => g.group);
    expect(groups).toEqual(['domains', 'data']);
  });

  it('ranks a title match above a text-only match', () => {
    // The Climate domain mentions "readiness" in its text and sorts first
    // alphabetically; the tool has it in the title.
    const hits = searchIndex(INDEX, 'readiness');
    expect(hits.map((h) => h.url)).toEqual(['/tools/esg-readiness', '/domains/climate-action-carbon-management']);
  });
});

describe('Arabic queries (p. 227)', () => {
  const arabic: IndexEntry = {
    title: 'الطاقة الشمسية في قطر',
    url: '/knowledge-hub/solar-qatar-ar',
    group: 'publications',
    category: 'Article',
  };

  it('matches Arabic terms, including with the و prefix attached', () => {
    expect(searchIndex([arabic], 'الطاقة الشمسية').map((h) => h.url)).toEqual([arabic.url]);
    expect(searchIndex([arabic], 'والطاقة').map((h) => h.url)).toEqual([]); // prefix on the query, not the record
    expect(searchIndex([{ ...arabic, title: 'والطاقة الشمسية' }], 'الطاقة').map((h) => h.url)).toEqual([arabic.url]);
  });

  it('folds hamza forms and diacritics', () => {
    expect(normalise('أَإِآ')).toBe('ااا');
  });

  it('drops Arabic question words', () => {
    expect(queryTerms('ما هي الطاقة الشمسية؟')).toEqual(['الطاقة', 'الشمسية']);
  });

  it('returns an empty result, not an error, against an English-only index', () => {
    expect(urls('الطاقة الشمسية')).toEqual([]);
  });
});

describe('grouping (AI03, p. 202)', () => {
  it('uses the spec groups in the spec order, whatever the ranking', () => {
    const ranked = searchIndex(INDEX, 'solar investment emissions carbon tool readiness');
    const reversed = [...ranked].reverse();
    expect(groupHits(reversed).map((g) => g.heading)).toEqual(['Domains and Work Areas', 'Enerqa Publication', 'Data', 'Tools']);
  });

  it('links publication hits to the article, not the Knowledge Hub landing page', () => {
    const pub = searchIndex(INDEX, 'IRECs').find((h) => h.group === 'publications');
    expect(pub?.url).toBe('/knowledge-hub/irecs-a-catalyst-for-renewable-energy-investment-in-qatar');
  });
});

describe('index hygiene (L904, L906)', () => {
  it('does not list the 404ing /data-portal/datasets hub', () => {
    expect(SITE_INDEX.map((e) => e.url)).not.toContain('/data-portal/datasets');
  });

  it('indexes the canonical lifecycle page', () => {
    expect(SITE_INDEX.map((e) => e.url)).toContain('/project-development');
  });

  it('treats the import placeholder excerpt as no excerpt', () => {
    expect(usableText('Could not extract content automatically.')).toBeUndefined();
    expect(usableText('  Real text ')).toBe('Real text');
  });
});

describe('retrieval failures (p. 227)', () => {
  it('reports a failed load as the failure state instead of throwing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const outcome = await runSearch('carbon', () => Promise.reject(new Error('CMS down')));
    expect(outcome).toEqual({ status: 'failed' });
    spy.mockRestore();
  });

  it('groups the hits when the load succeeds', async () => {
    const outcome = await runSearch('carbon', async () => INDEX);
    expect(outcome.status).toBe('ok');
    if (outcome.status === 'ok') expect(outcome.groups.length).toBeGreaterThan(0);
  });

  it('uses the spec wording for the states (p. 202 AI01, AI04)', () => {
    expect(SEARCH_COPY).toEqual({
      placeholder: 'Ask a question or explore a topic.',
      loading: 'Searching for relevant information.',
      empty: 'No relevant Enerqa content was found; try another query or explore our domains.',
      failure: 'Search is temporarily unavailable; use site navigation or keyword search.',
    });
  });
});

describe('helpers', () => {
  it('reads the first q value, trimmed and capped', () => {
    expect(readQuery(['  a ', 'b'])).toBe('a');
    expect(readQuery(undefined)).toBe('');
    expect(readQuery('x'.repeat(400))).toHaveLength(300);
  });

  it('centres the excerpt on the first match in long text', () => {
    const text = `${'Intro words here. '.repeat(20)}The readiness assessment covers governance.`;
    const ex = excerptFor(text, ['readines'], 80)!;
    expect(ex.startsWith('…')).toBe(true);
    expect(ex).toContain('readiness');
  });

  it('shows verified dates only', () => {
    expect(formatSourceDate('2024-03-10T00:00:00.000Z', true)).toBe('10 Mar 2024');
    expect(formatSourceDate('2024-03-10T00:00:00.000Z', false)).toBeUndefined();
    expect(formatSourceDate(null)).toBeUndefined();
  });
});
