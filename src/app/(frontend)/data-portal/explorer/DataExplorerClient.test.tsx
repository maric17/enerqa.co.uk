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

const chart = () => JSON.parse(screen.getByTestId('chart').textContent!);
const ready = async () => { render(<DataExplorerClient />); await screen.findByTestId('chart'); };

describe('Explorer selections and data', () => {
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
    fireEvent.change(screen.getByRole('combobox', { name: 'Y-axis indicator' }), { target: { value: 'daily' } });
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
    fireEvent.change(screen.getByRole('combobox', { name: 'X-axis indicator' }), { target: { value: 'daily' } });
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

  it('searches dataset topics while preserving the current selection', async () => {
    await ready();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search datasets' }), { target: { value: 'economy' } });
    const selector = screen.getByRole('combobox', { name: 'Y-axis indicator' });
    expect(selector).toHaveValue('life');
    expect(within(selector).getAllByRole('option').map(o => o.textContent)).toEqual(['Income per person']);
    fireEvent.change(selector, { target: { value: 'income' } });
    await waitFor(() => expect(chart().yAxis.name).toBe('Income per person'));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search datasets' }), { target: { value: 'unmatched phrase' } });
    expect(screen.getByText('No indicators match your search.')).toBeInTheDocument();
    expect(selector).toHaveValue('income');
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
    const selector = screen.getByRole('combobox', { name: 'X-axis indicator' });
    fireEvent.change(selector, { target: { value: 'income' } });
    await waitFor(() => expect(chart().series.find((s: any) => s.name === 'Afghanistan').data).toEqual([[100, 0, 2000]]));
    expect(chart().xAxis.type).toBe('value');
    expect(chart().series[0].type).toBe('scatter');
    expect(screen.getByText('X-axis source: Income per person')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Data Table' }));
    expect(within(screen.getByRole('table')).getByRole('columnheader', { name: 'Income per person (X)' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
    fireEvent.change(selector, { target: { value: 'year' } });
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
    expect(screen.queryByText('X-axis source: Income per person')).toBeNull();
  });

  it('explains datasets with no overlapping years and prevents empty downloads', async () => {
    await ready();
    fireEvent.change(screen.getByRole('combobox', { name: 'X-axis indicator' }), { target: { value: 'empty' } });
    await screen.findByText(/No matching country and observation date pairs/);
    expect(screen.queryByTestId('chart')).toBeNull();
    expect(screen.getByRole('button', { name: 'Filtered CSV' })).toBeDisabled();
  });

  it('can use the same indicator on both axes without fetching it again', async () => {
    await ready();
    const calls = vi.mocked(fetch).mock.calls.length;
    fireEvent.change(screen.getByRole('combobox', { name: 'X-axis indicator' }), { target: { value: 'life' } });
    expect(chart().series.find((s: any) => s.name === 'Afghanistan').data).toEqual([[0, 0, 2000], [60, 60, 2001]]);
    expect(new Set(chart().series[0].dimensions.map((d: any) => d.name)).size).toBe(3);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
  });

  it('shows an upstream error and recovers when the x-axis changes back to Year', async () => {
    await ready();
    vi.mocked(fetch).mockImplementation(async () => ({ ok: false, json: async () => ({ error: 'Upstream unavailable' }) }) as Response);
    fireEvent.change(screen.getByRole('combobox', { name: 'X-axis indicator' }), { target: { value: 'income' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Upstream unavailable');
    fireEvent.change(screen.getByRole('combobox', { name: 'X-axis indicator' }), { target: { value: 'year' } });
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });
});
