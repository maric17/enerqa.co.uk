import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockReset());

describe('hero search', () => {
  it('shows the title above an explicitly labelled search field', () => {
    render(<Hero><div>Saved news</div></Hero>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Project Development for a Sustainable Future');
    expect(screen.getByRole('textbox', { name: 'Ask a question or explore a topic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask' })).toBeDisabled();
  });

  it('trims and encodes a search, then prevents duplicate submissions', () => {
    render(<Hero />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  climate & finance  ' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(push).toHaveBeenCalledWith('/search?q=climate%20%26%20finance');
    expect(screen.getByRole('button', { name: 'Searching…' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('search'));
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('submits a suggestion through the same search route', () => {
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: 'Explore renewable-energy feasibility' }));
    expect(push).toHaveBeenCalledWith('/search?q=Explore%20renewable-energy%20feasibility');
  });
});
