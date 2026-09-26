import { describe, it, expect } from 'vitest';
import {
  aiAnswersEnabled,
  buildSystemInstruction,
  citedSources,
  createAiQuota,
  splitCitations,
  toAiSources,
  type AiSource,
} from './aiAnswer';
import type { SearchHit } from './searchIndex';

/** The AI half of the p. 227 search tests. */

const SOURCES: AiSource[] = [
  { n: 1, title: 'ESG Readiness Tool', url: '/tools/esg-readiness', category: 'Tool', excerpt: 'A structured assessment.' },
  { n: 2, title: 'Project Development and Lifecycle Support', url: '/project-development', category: 'Lifecycle' },
];

describe('provider gate (pp. 13, 224; L914)', () => {
  it('stays off while the registry has the provider disabled or unreviewed', () => {
    // The real registry row is disabled today, so the default must be off even with a key.
    expect(aiAnswersEnabled({ GEMINI_API_KEY: 'k' })).toBe(false);
    expect(aiAnswersEnabled({ GEMINI_API_KEY: 'k' }, false)).toBe(false);
  });

  it('needs both the switch and a key', () => {
    expect(aiAnswersEnabled({}, true)).toBe(false);
    expect(aiAnswersEnabled({ GEMINI_API_KEY: 'k' }, true)).toBe(true);
  });
});

describe('hard quota guard (p. 224)', () => {
  const MIN = 60_000;

  it('stops at the per-minute budget and recovers after the window', () => {
    const quota = createAiQuota({ perDay: 100, perMinute: 2, perVisitorPerHour: 100 });
    expect(quota.tryConsume('a', 0)).toBe(true);
    expect(quota.tryConsume('b', 1)).toBe(true);
    expect(quota.tryConsume('c', 2)).toBe(false);
    expect(quota.tryConsume('c', MIN + 1)).toBe(true);
  });

  it('stops one visitor without blocking the others', () => {
    const quota = createAiQuota({ perDay: 100, perMinute: 100, perVisitorPerHour: 1 });
    expect(quota.tryConsume('a', 0)).toBe(true);
    expect(quota.tryConsume('a', 1)).toBe(false);
    expect(quota.tryConsume('b', 2)).toBe(true);
  });

  it('never exceeds the daily budget, and a refused call is not counted', () => {
    const quota = createAiQuota({ perDay: 3, perMinute: 100, perVisitorPerHour: 100 });
    const results = Array.from({ length: 10 }, (_, i) => quota.tryConsume(`v${i}`, i * MIN));
    expect(results.filter(Boolean)).toHaveLength(3);
  });
});

describe('prompt (pp. 13, 169, 202, 227)', () => {
  const prompt = buildSystemInstruction(SOURCES);

  it('uses the approved description, not "a data analytics firm"', () => {
    expect(prompt).toContain('Enerqa is a multidisciplinary project-development and consultancy company');
    expect(prompt).not.toMatch(/data analytics firm/i);
  });

  it('allows a general answer to a general question and forbids forced recommendations', () => {
    expect(prompt).toContain('A general question can receive a general answer');
    expect(prompt).toContain('do not steer it towards Enerqa');
  });

  it('forbids invented company work and uncited sources', () => {
    expect(prompt).toContain('Never state or imply anything about Enerqa');
    expect(prompt).toContain('never cite anything else');
  });

  it('numbers the retrieved records it may cite', () => {
    expect(prompt).toContain('[1] ESG Readiness Tool (Tool): A structured assessment.');
    expect(prompt).toContain('[2] Project Development and Lifecycle Support (Lifecycle): No excerpt.');
  });

  it('says so when nothing was retrieved, instead of leaving an empty list', () => {
    expect(buildSystemInstruction([])).toContain('(No Enerqa records matched this question.)');
  });

  it('asks for a reply in the language of the question (Arabic queries)', () => {
    expect(prompt).toContain('Reply in the language of the question');
  });
});

describe('citations cite only what was retrieved (p. 227)', () => {
  it('splits an answer into text and citation markers', () => {
    expect(splitCitations('Start here [1]. Then [1, 2].', 2)).toEqual([
      { text: 'Start here ' },
      { cite: 1 },
      { text: '. Then ' },
      { cite: 1 },
      { cite: 2 },
      { text: '.' },
    ]);
  });

  it('keeps a number outside the source list as plain text', () => {
    // A model that invents "[7]" must not produce a link to a source that does not exist.
    expect(splitCitations('See [7].', 2)).toEqual([{ text: 'See [7].' }]);
    expect(citedSources('See [7].', SOURCES)).toEqual([]);
  });

  it('lists only the sources the answer used, in source order', () => {
    // Conflicting sources: both are shown when both are cited, so the reader can compare.
    expect(citedSources('B says [2]; A disagrees [1].', SOURCES).map((s) => s.n)).toEqual([1, 2]);
    expect(citedSources('Only B [2].', SOURCES).map((s) => s.n)).toEqual([2]);
    expect(citedSources('No citations.', SOURCES)).toEqual([]);
  });

  it('numbers the top keyword hits as the citable sources', () => {
    const hit = (title: string): SearchHit => ({ title, url: `/${title}`, group: 'tools', category: 'Tool', score: 1, matched: ['x'] });
    const sources = toAiSources([hit('a'), hit('b'), hit('c')], 2);
    expect(sources.map((s) => [s.n, s.title])).toEqual([[1, 'a'], [2, 'b']]);
  });
});
