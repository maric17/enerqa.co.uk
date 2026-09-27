import { describe, it, expect } from 'vitest';
import { usableExcerpt } from './publicationExcerpt';

// Real excerpts from the 2024 archive import (publications table, 25 Sep 2026).
describe('usableExcerpt (H08, p. 14 / p. 225)', () => {
  it('rejects the importer failure message', () => {
    expect(usableExcerpt('Could not extract content automatically.')).toBeNull();
  });

  it('rejects table-of-contents fragments', () => {
    expect(usableExcerpt('2. Climate Forcers: The Hidden  Drivers of Global Warming')).toBeNull();
    expect(
      usableExcerpt(
        'Sustainable Tourism     4. The Hidden Link Between Cigarette Smoking  and Climate Change  5. Empowering Communities',
      ),
    ).toBeNull();
  });

  it('rejects running headers with page numbers and bylines', () => {
    const title = 'Greenhouse Gases and Climate Change: An Overview';
    expect(
      usableExcerpt(
        'Greenhouse Gases and Climate Change: An Overview     16    Greenhouse Gases and Climate Change: An  Overview   By: Quosay A. Ahmed',
        title,
      ),
    ).toBeNull();
  });

  it('rejects an excerpt that only repeats the title', () => {
    expect(
      usableExcerpt('The Hidden Costs of Your Burger and Pizza: what is really at stake for us all?', 'The Hidden Costs of Your Burger and Pizza'),
    ).toBeNull();
  });

  it('rejects empty and very short values', () => {
    expect(usableExcerpt(null)).toBeNull();
    expect(usableExcerpt('   ')).toBeNull();
    expect(usableExcerpt('Too short.')).toBeNull();
  });

  it('keeps a clean editorial excerpt unchanged', () => {
    const clean =
      'Greenhouse gases are atmospheric constituents that absorb and emit infrared radiation, warming the lower atmosphere.';
    expect(usableExcerpt(clean, 'Greenhouse Gases and Climate Change: An Overview')).toBe(clean);
  });
});
