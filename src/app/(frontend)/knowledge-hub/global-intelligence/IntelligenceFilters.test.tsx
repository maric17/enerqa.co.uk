import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { IntelligenceFilters } from './IntelligenceFilters';

function choose(label: string, values: string[]) {
  const select = screen.getByRole('listbox', { name: label }) as HTMLSelectElement;
  for (const option of select.options) option.selected = values.includes(option.value);
  fireEvent.change(select);
}

it('allows countries in different regions, then visibly clears children after a parent change', () => {
  render(<IntelligenceFilters filters={{}} domains={[]} industries={[]} sources={[]} languages={[]} />);
  choose('Country', ['QAT']);
  expect(screen.getByRole('listbox', { name: 'Region' })).toHaveValue(['Western Asia']);
  // Qatar must not hide Germany and prevent OR selections across regions.
  choose('Country', ['QAT', 'DEU']);
  expect(screen.getByRole('listbox', { name: 'Country' })).toHaveValue(['DEU', 'QAT']);
  expect(screen.getByRole('listbox', { name: 'Continent' })).toHaveValue(['Asia', 'Europe']);
  choose('Continent', ['Europe']);
  expect(screen.getByRole('listbox', { name: 'Country' })).toHaveValue(['DEU']);
  expect(screen.getByRole('status')).toHaveTextContent('Conflicting country or region selections were cleared.');
});
