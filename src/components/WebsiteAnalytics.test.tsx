import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import { saveConsent } from '@/lib/consent';
import { WebsiteAnalytics } from './WebsiteAnalytics';

vi.mock('next/navigation', () => ({ usePathname: () => '/data-portal' }));
vi.mock('next/script', () => ({ default: ({ onReady }: { onReady: () => void }) => <button onClick={onReady}>Test tracker loaded</button> }));
beforeEach(() => { localStorage.clear(); window.umami = { track: vi.fn() }; });
afterEach(() => { delete window.umami; delete window.enerqaBeforeAnalytics; });

it('loads no tracker before opt-in, then blocks every send immediately after withdrawal', () => {
  render(<WebsiteAnalytics scriptUrl="https://analytics.enerqa.co.uk/script.js" websiteId="website-id" />);
  expect(screen.queryByText('Test tracker loaded')).toBeNull();
  act(() => saveConsent({ analytics: true }));
  fireEvent.click(screen.getByText('Test tracker loaded'));
  expect(window.umami!.track).toHaveBeenCalledTimes(1);
  expect(window.enerqaBeforeAnalytics!('event', { data: { email: 'private' } })).not.toHaveProperty('data');
  expect(window.enerqaBeforeAnalytics!('identify', {})).toBe(false);
  act(() => saveConsent({ analytics: false }));
  expect(window.enerqaBeforeAnalytics!('event', {})).toBe(false);
  expect(screen.queryByText('Test tracker loaded')).toBeNull();
});
it('keeps analytics off when hosting configuration is absent, even with saved consent', () => {
  saveConsent({ analytics: true });
  render(<WebsiteAnalytics />);
  expect(screen.queryByText('Test tracker loaded')).toBeNull();
  expect(window.umami!.track).not.toHaveBeenCalled();
});
