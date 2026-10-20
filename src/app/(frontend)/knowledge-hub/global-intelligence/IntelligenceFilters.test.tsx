import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { IntelligenceFilters } from './IntelligenceFilters';

function choose(label: string, values: string[]) {
  const group = screen.getByRole('group', { name: `${label} options` });
  for (const checkbox of within(group).getAllByRole('checkbox') as HTMLInputElement[]) {
    if (checkbox.checked !== values.includes(checkbox.value)) fireEvent.click(checkbox);
  }
}
const checked = (label: string) => (within(screen.getByRole('group', { name: `${label} options` })).getAllByRole('checkbox') as HTMLInputElement[]).filter(input => input.checked).map(input => input.value);

it('allows countries in different regions, then visibly clears children after a parent change', () => {
  render(<IntelligenceFilters filters={{}} domains={[]} industries={[]} languages={[]} />);
  choose('Country', ['QAT']);
  expect(checked('Region')).toEqual(['Western Asia']);
  // Qatar must not hide Germany and prevent OR selections across regions.
  choose('Country', ['QAT', 'DEU']);
  expect(checked('Country').sort()).toEqual(['DEU', 'QAT']);
  expect(checked('Continent')).toEqual(['Asia', 'Europe']);
  choose('Continent', ['Europe']);
  expect(checked('Country')).toEqual(['DEU']);
  expect(screen.getByRole('status')).toHaveTextContent('Conflicting country or region selections were cleared.');
});

it('uses checkbox groups, hides additional filters by default and omits source controls', () => {
  const { container } = render(<IntelligenceFilters filters={{ type: ['news'] }} domains={[]} industries={[]} languages={[{ value: 'en', label: 'EN' }]} />);
  expect(container.querySelector('details')).not.toHaveAttribute('open');
  expect(screen.getByText('Additional filters (1 selected)')).toBeInTheDocument();
  expect(container.querySelector('select')).toBeNull();
  expect(container.querySelector('[name="source"]')).toBeNull();
  fireEvent.click(screen.getByText('Additional filters (1 selected)'));
  expect(screen.getByRole('checkbox', { name: 'News' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'EN' })).toBeInTheDocument();
});
