import React from 'react';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PublicationBody } from './PublicationBody';
import manifest from '@/lib/content/publication-figures.json';

const nodeText = (node: { text?: string; children?: unknown[] }): string => typeof node.text === 'string' ? node.text : (node.children ?? []).map(child => nodeText(child as typeof node)).join(' ');
const bodyFor = (slug: string) => JSON.parse(readFileSync(path.join(process.cwd(), 'scripts/publication-rebuild/out', slug + '.json'), 'utf8'));

describe('recovered publication figures', () => {
  it('has a real asset, useful description and existing text anchor for every recovered image', () => {
    let total = 0;
    for (const [slug, entry] of Object.entries(manifest)) {
      const body = bodyFor(slug);
      const anchors = body.root.children.map(nodeText);
      for (const figure of entry.figures) {
        expect(existsSync(path.join(process.cwd(), 'public', figure.src))).toBe(true);
        expect(figure.alt.length).toBeGreaterThan(20);
        expect(anchors).toContain(figure.afterText);
        total++;
      }
    }
    expect(total).toBe(80);
  });

  it('renders the original body and an accessible full-size figure link', () => {
    const slug = 'climate-forcers-the-hidden-drivers-of-global-warming';
    const { container } = render(<PublicationBody slug={slug} data={bodyFor(slug)} />);
    expect(container.textContent).toContain('variety of substances');
    const figure = manifest[slug].figures[0];
    expect(screen.getByRole('img', { name: figure.alt })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `View full-size image: ${figure.alt}` })).toHaveAttribute('href', figure.src);
    expect(container.querySelectorAll('[data-archive-figure]')).toHaveLength(1);
  });

  it('retains recovered artwork if an editor changes the surrounding paragraphs', () => {
    const slug = 'climate-forcers-the-hidden-drivers-of-global-warming';
    const body = bodyFor(slug);
    body.root.children = [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Edited introduction.', format: 0, detail: 0, mode: 'normal', style: '' }], direction: 'ltr', format: '', indent: 0 }];
    render(<PublicationBody slug={slug} data={body} />);
    expect(screen.getByText('Edited introduction.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Figures from the original publication' })).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
