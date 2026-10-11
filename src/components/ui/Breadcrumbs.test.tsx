import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

it('identifies the current record and links only genuine parent pages', () => {
  // Keep the title intact, including punctuation; it is not reconstructed from a slug.
  const title = 'Energy & Transition: Research / Evidence';
  render(<Breadcrumbs parents={[{ label: 'Home', href: '/' }, { label: 'Knowledge Hub', href: '/knowledge-hub' }]} current={title} />);
  const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
  expect(within(nav).getByRole('list')).toBeInTheDocument();
  expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
  expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  expect(within(nav).getByRole('link', { name: 'Knowledge Hub' })).toHaveAttribute('href', '/knowledge-hub');
  expect(within(nav).getAllByRole('link')).toHaveLength(2);
  expect(within(nav).getByText(title)).toHaveAttribute('aria-current', 'page');
  // Decoration should not add spoken list entries or link to non-existent collection routes.
  for (const separator of within(nav).getAllByText('/')) expect(separator).toHaveAttribute('aria-hidden', 'true');
});
