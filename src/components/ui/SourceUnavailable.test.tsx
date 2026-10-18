import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SourceUnavailable } from './SourceUnavailable';

it('keeps a source failure inline and offers search plus the relevant section', () => {
  // A failed provider must not turn the whole page into a 404 or invent results.
  render(<SourceUnavailable sourcesFailed nearest={{ href: '/data-portal', label: 'Data Portal' }} />);
  expect(screen.getByRole('status')).toHaveTextContent('This source is temporarily unavailable.');
  expect(screen.getByRole('link', { name: 'Search the site' })).toHaveAttribute('href', '/search');
  expect(screen.getByRole('link', { name: 'Data Portal' })).toHaveAttribute('href', '/data-portal');
});

it('distinguishes a successful empty response from a provider failure', () => {
  // Empty data is a valid state and should not imply that a source is broken.
  render(<SourceUnavailable sourcesFailed={false} />);
  expect(screen.getByRole('status')).toHaveTextContent('No relevant updates are available.');
  expect(screen.queryByRole('link')).toBeNull();
});
