import { describe, expect, it } from 'vitest';
import { pilotHref } from './pilot';

describe('public Arabic links', () => {
  it('preserves a public page’s query and section when changing its language', () => {
    const explorer = '/data-portal/explorer?country=QAT#chart';
    expect(pilotHref('ar', explorer)).toBe('/ar' + explorer);
    expect(pilotHref('en', explorer)).toBe(explorer);
  });

  it('keeps newsletter confirmation in the chosen language', () => {
    expect(pilotHref('ar', '/newsletter/confirm')).toBe('/ar/newsletter/confirm');
  });

  it.each([
    '/api/data/population?country=QAT',
    '/admin/collections/publications',
    '/media/report.pdf',
    '/ar/tools',
    'https://example.com/tools',
    '//example.com/tools',
    '#chart',
  ])('leaves %s alone', (href) => {
    expect(pilotHref('ar', href)).toBe(href);
  });
});
