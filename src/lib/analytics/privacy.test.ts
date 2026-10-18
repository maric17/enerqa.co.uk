import { it, expect } from 'vitest';
import { analyticsPath, safeAnalyticsPayload } from './privacy';

it('excludes forms, prompts, admin routes and unsafe path data', () => {
  for (const path of ['/contact', '/search?q=private', '/newsletter/confirm', '/admin', '/knowledge-hub/person@example.org']) expect(analyticsPath(path)).toBeNull();
  expect(analyticsPath('/data-portal?email=private#secret')).toBe('/data-portal');
});
it('drops identifiers, referrers, titles and arbitrary event properties', () => {
  const payload = safeAnalyticsPayload({ name: 'dataset_download', id: 'user', data: { email: 'private' }, title: 'private', referrer: 'https://example.org/?email=private' }, '/data-portal?email=private', 'website-id');
  expect(payload).toEqual({ website: 'website-id', hostname: window.location.hostname, url: '/data-portal', title: '/data-portal', referrer: '', name: 'dataset_download' });
  expect(safeAnalyticsPayload({ name: 'arbitrary-private-text' }, '/', 'website-id')).toBeNull();
});
