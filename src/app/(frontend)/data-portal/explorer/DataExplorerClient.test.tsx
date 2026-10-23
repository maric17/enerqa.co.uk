import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import DataExplorerClient from './DataExplorerClient';

// Render chart options as text so tests verify plotted values without a canvas.
vi.mock('echarts-for-react', () => ({ default: ({ option }: any) => <div data-testid="chart">{JSON.stringify(option)}</div> }));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));

const catalogue = [
  { id: 'life', name: 'Life expectancy', topic: 'Health' },
  { id: 'income', name: 'Income per person', topic: 'Economy' },
  { id: 'empty', name: 'Historical population', topic: 'Population' },
  { id: 'daily', name: 'Daily measurements', topic: 'Environment' },
];
const observations: Record<string, unknown[]> = {
  life: [{ geo: 'afg', time: '2000', value: 0 }, { geo: 'afg', time: '2001', value: 60 }, { geo: 'alb', time: '2000', value: 70 }],
  income: [{ geo: 'afg', time: '2000', value: 100 }, { geo: 'afg', time: '2002', value: 200 }, { geo: 'alb', time: '2000', value: 300 }],
  empty: [{ geo: 'afg', time: '1800', value: 10 }],
  daily: [
    { geo: 'afg', time: '2024-01-01', value: 0 },
    { geo: 'afg', time: '2024-01-02', value: 100 },
    { geo: 'afg', time: '2024-01-08', value: 20 },
    { geo: 'afg', time: '2024-02-01', value: 80 },
    { geo: 'afg', time: '2025-01-01', value: -20 },
  ],
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    const url = new URL(input, 'http://localhost');
    const id = url.searchParams.get('id') || '';
    const data = url.pathname.endsWith('catalogue') ? { results: catalogue }
      : url.pathname.endsWith('metadata') ? { ...catalogue.find(c => c.id === id), concept: id, source: 'Test provider', licence: 'CC BY', attribution: 'Test attribution' }
      : { observations: observations[id] || [] };
    return { ok: true, json: async () => data };
  }));
});
afterEach(() => vi.unstubAllGlobals());

// Choose a visible suggestion; the chart updates without a separate apply action.
function chooseIndicator(axis: 'X' | 'Y', name: string) {
  fireEvent.change(screen.getByRole('combobox', { name: `${axis}-axis indicator` }), { target: { value: name } });
  fireEvent.click(within(screen.getByRole('listbox', { name: `${axis}-axis indicator suggestions` })).getByRole('option', { name: new RegExp(`^${name}(?:$| )`) }));
}
const chart = () => JSON.parse(screen.getByTestId('chart').textContent!);
const ready = async () => { render(<DataExplorerClient />); await screen.findByTestId('chart'); };

describe('Explorer selections and data', () => {
  it('opens a linked indicator and geography without fetching the default unrelated series', async () => {
    render(<DataExplorerClient initialIndicatorId="income" initialCountry="alb" />);
    await screen.findByTestId('chart');
    expect(screen.getByRole('combobox', { name: 'Y-axis indicator' })).toHaveValue('Income per person');
    expect(chart().legend.data).toEqual(['Albania']);
    expect(screen.getByRole('checkbox', { name: 'Albania' })).toBeChecked();
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes('id=life'))).toBe(false);
  });

  it('explains an invalid link instead of displaying a different indicator', async () => {
    render(<DataExplorerClient initialIndicatorId="missing" />);
    await screen.findByText('The requested indicator is unavailable. Choose an indicator to continue.');
    expect(screen.queryByTestId('chart')).not.toBeInTheDocument();
    chooseIndicator('Y', 'Income per person');
    await screen.findByTestId('chart');
    expect(chart().yAxis.name).toBe('Income per person');
  });
  it('offers every period and explains when yearly data cannot supply finer views', async () => {
    await ready();
    const selector = screen.getByRole('combobox', { name: 'Time period' });
    expect(within(selector).getAllByRole('option').map(o => o.textContent)).toEqual(['Daily', 'Weekly', 'Monthly', 'Yearly']);
    const calls = vi.mocked(fetch).mock.calls.length;
    for (const period of ['daily', 'weekly', 'monthly']) {
      fireEvent.change(selector, { target: { value: period } });
      expect(screen.getByText(/These observations are only available/)).toHaveTextContent(`The selected ${period} view shows the available yearly values`);
      expect(chart().xAxis.data).toEqual(['2000', '2001']);
    }
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
  });

  it('updates period averages, axis ranges, tables and comparison tooltips', async () => {
    await ready();
    chooseIndicator('Y', 'Daily measurements');
    await waitFor(() => expect(chart().yAxis.name).toBe('Daily measurements'));
    const selector = screen.getByRole('combobox', { name: 'Time period' });
    const cases = [
      ['daily', ['2024-01-01', '2024-01-02', '2024-01-08', '2024-02-01', '2025-01-01'], [0, 100, 20, 80, -20], 112],
      ['weekly', ['2024-01-01', '2024-01-08', '2024-01-29', '2024-12-30'], [50, 20, 80, -20], 90],
      ['monthly', ['2024-01', '2024-02', '2025-01'], [40, 80, -20], 90],
      ['yearly', ['2024', '2025'], [50, -20], 57],
    ] as const;
    const calls = vi.mocked(fetch).mock.calls.length;
    for (const [period, labels, values, maximum] of cases) {
      fireEvent.change(selector, { target: { value: period } });
      expect(chart().xAxis.data).toEqual(labels);
      expect(chart().series[0].data).toEqual(values);
      expect(chart().yAxis.max).toBe(maximum);
      expect(screen.queryByText(/These observations are only available/)).toBeNull();
    }
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
    fireEvent.click(screen.getByRole('button', { name: 'Bar Chart' }));
    expect(chart().series[0].type).toBe('bar');
    expect(chart().yAxis.min).toBeLessThan(0);
    fireEvent.change(selector, { target: { value: 'monthly' } });
    fireEvent.click(screen.getByRole('button', { name: 'Data Table' }));
    expect(screen.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
    expect(within(screen.getByRole('table')).getByText('40')).toBeInTheDocument();
    chooseIndicator('X', 'Daily measurements');
    fireEvent.click(screen.getByRole('button', { name: 'Bubble Chart' }));
    expect(chart().series[0].data).toEqual([[40, 40, '2024-01'], [80, 80, '2024-02'], [-20, -20, '2025-01']]);
    expect(chart().series[0].dimensions[2].displayName).toBe('Month');
  });

  it('shows full country names and keeps zero distinct from missing values', async () => {
    await ready();
    expect(screen.getByRole('checkbox', { name: 'Afghanistan' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Albania' })).toBeInTheDocument();
    expect(chart().series.find((s: any) => s.name === 'Afghanistan').data).toEqual([0, 60]);
    expect(chart().series.find((s: any) => s.name === 'Albania').data).toEqual([70, null]);
    fireEvent.click(screen.getByRole('button', { name: 'Data Table' }));
    expect(within(screen.getByRole('table')).getByText('Albania')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('0')).toBeInTheDocument();
  });

  it('shows suggestions as typing replaces the current label and applies a choice immediately', async () => {
    await ready();
    const selector = screen.getByRole('combobox', { name: 'Y-axis indicator' });
    expect(selector).toHaveValue('Life expectancy');
    fireEvent.change(selector, { target: { value: 'economy' } });
    expect(selector).toHaveAttribute('aria-expanded', 'true');
    expect(selector).toHaveValue('economy');
    expect(screen.getByRole('option', { name: /^Income per person/ })).toBeInTheDocument();
    // Searching alone keeps the current chart stable until a suggestion is chosen.
    expect(chart().yAxis.name).toBe('Life expectancy');
    fireEvent.click(screen.getByRole('option', { name: /^Income per person/ }));
    await waitFor(() => expect(chart().yAxis.name).toBe('Income per person'));
    expect(selector).toHaveValue('Income per person');
    expect(selector).toHaveAttribute('aria-expanded', 'false');
    fireEvent.change(selector, { target: { value: 'unmatched phrase' } });
    expect(screen.getByText('No indicators match your search.')).toBeInTheDocument();
    fireEvent.keyDown(selector, { key: 'Escape' });
    expect(selector).toHaveValue('Income per person');
  });

  it('supports typo-tolerant suggestions and Enter selection on both axes', async () => {
    await ready();
    const selector = screen.getByRole('combobox', { name: 'X-axis indicator' });
    fireEvent.change(selector, { target: { value: 'expectncy' } });
    expect(screen.getByRole('option', { name: /^Life expectancy/ })).toBeInTheDocument();
    fireEvent.keyDown(selector, { key: 'Enter' });
    expect(selector).toHaveValue('Life expectancy');
    expect(chart().xAxis.type).toBe('value');
  });

  it('shows exact linked Gapminder attribution, original provider credit and the comparison chart', async () => {
    await ready();
    expect(screen.getByText('Data sources and attribution')).toBeInTheDocument();
    expect(screen.getByText('Test provider')).toBeInTheDocument();
    expect(screen.getByText(/Based on free material from/)).toHaveTextContent('Based on free material from GAPMINDER.ORG, CC-BY LICENSE');
    expect(screen.getByRole('link', { name: 'CC-BY LICENSE' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    expect(screen.queryByText(/source-grade MRV/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Original Gapminder Chart' }));
    expect(screen.getByText(/Comparison view/)).toBeInTheDocument();
    expect(screen.getByText(/FREE TO USE!/)).toHaveTextContent('FREE TO USE! CC-BY GAPMINDER.ORG');
  });

  it('searches countries by name or code without clearing hidden selections', async () => {
    await ready();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Afghanistan' }));
    const search = screen.getByRole('searchbox', { name: 'Search countries' });
    fireEvent.change(search, { target: { value: 'ALB' } });
    expect(screen.queryByRole('checkbox', { name: 'Afghanistan' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Albania' })).toBeInTheDocument();
    expect(chart().legend.data).toEqual(['Afghanistan']);
    fireEvent.change(search, { target: { value: 'afghanistan' } });
    expect(screen.getByRole('checkbox', { name: 'Afghanistan' })).toBeChecked();
  });

  it('compares only matching country/year pairs and returns to Year', async () => {
    await ready();
    chooseIndicator('X', 'Income per person');
    await waitFor(() => expect(chart().series.find((s: any) => s.name === 'Afghanistan').data).toEqual([[100, 0, 2000]]));
    expect(chart().xAxis.type).toBe('value');
    expect(chart().series[0].type).toBe('scatter');
    expect(screen.getByText('X-axis source: Income per person')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Data Table' }));
    expect(within(screen.getByRole('table')).getByRole('columnheader', { name: 'Income per person (X)' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
    chooseIndicator('X', 'Year');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
    expect(screen.queryByText('X-axis source: Income per person')).toBeNull();
  });

  it('explains datasets with no overlapping years and prevents empty downloads', async () => {
    await ready();
    chooseIndicator('X', 'Historical population');
    await screen.findByText(/No matching country and observation date pairs/);
    expect(screen.queryByTestId('chart')).toBeNull();
    expect(screen.getByRole('button', { name: 'Filtered CSV' })).toBeDisabled();
  });

  it('can use the same indicator on both axes without fetching it again', async () => {
    await ready();
    const calls = vi.mocked(fetch).mock.calls.length;
    chooseIndicator('X', 'Life expectancy');
    expect(chart().series.find((s: any) => s.name === 'Afghanistan').data).toEqual([[0, 0, 2000], [60, 60, 2001]]);
    expect(new Set(chart().series[0].dimensions.map((d: any) => d.name)).size).toBe(3);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
  });

  it('shows an upstream error and recovers when the x-axis changes back to Year', async () => {
    await ready();
    vi.mocked(fetch).mockImplementation(async () => ({ ok: false, json: async () => ({ error: 'Upstream unavailable' }) }) as Response);
    chooseIndicator('X', 'Income per person');
    expect(await screen.findByRole('alert')).toHaveTextContent('Upstream unavailable');
    chooseIndicator('X', 'Year');
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });
});
