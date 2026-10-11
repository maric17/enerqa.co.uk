import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('@/lib/feeds/official', () => ({ fetchOfficialUpdates: vi.fn() }));

import { fetchOfficialUpdates, type OfficialResult } from '@/lib/feeds/official';
import { DOMAIN_FEEDS } from '@/lib/feeds/contextual';
import { OfficialFeed } from './OfficialFeed';

const empty: OfficialResult = {
  items: [], sources: [], sourcesFailed: false, notEnabled: false, retrievedAt: null, stale: false,
};
const props = {
  feed: DOMAIN_FEEDS['climate-action-carbon-management'],
  nearest: { href: '/knowledge-hub/global-intelligence', label: 'browse Global Intelligence' },
};

beforeEach(() => vi.mocked(fetchOfficialUpdates).mockResolvedValue(empty));

it('explains a disabled automatic feed and keeps official sources discoverable', async () => {
  vi.mocked(fetchOfficialUpdates).mockResolvedValue({ ...empty, notEnabled: true });
  render(await OfficialFeed(props));
  expect(screen.getByRole('status')).toHaveTextContent('Automatic updates from this source are not yet enabled.');
  expect(screen.getByRole('status')).toHaveTextContent('Browse the official source links below');
  expect(screen.queryByText('No relevant updates are available.')).toBeNull();
});

it('keeps a successful empty search separate from a disabled provider', async () => {
  render(await OfficialFeed(props));
  expect(screen.getByRole('status')).toHaveTextContent('No relevant updates are available.');
});

it('provides search links when enabled providers fail', async () => {
  vi.mocked(fetchOfficialUpdates).mockResolvedValue({ ...empty, sourcesFailed: true });
  render(await OfficialFeed(props));
  expect(screen.getByRole('status')).toHaveTextContent('This source is temporarily unavailable.');
  expect(screen.getByRole('link', { name: 'browse Global Intelligence' })).toHaveAttribute('href', props.nearest.href);
});
