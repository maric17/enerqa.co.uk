import React from 'react';
import Image from 'next/image';
import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import archive from '@/lib/content/publication-figures.json';

type Figure = { src: string; width: number; height: number; page: number | null; sourceUrl?: string; transcript?: string; caption: string; alt: string; afterText: string };
const figuresBySlug: Record<string, { figures: Figure[]; originalPdf?: string }> = archive;
type Body = React.ComponentProps<typeof RichText>['data'];
const nodeText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return '';
  const value = node as { text?: string; children?: unknown[] };
  return typeof value.text === 'string' ? value.text : (value.children ?? []).map(nodeText).join(' ');
};
const normalise = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim();

// Preserve the CMS body. Only the recovered archive figures are inserted;
// if an editor changes an anchor, that figure is kept in an appendix instead.
export function PublicationBody({ slug, data, converters }: { slug: string; data: Body; converters?: JSXConvertersFunction }) {
  const entry = figuresBySlug[slug];
  const figures = entry?.figures ?? [];
  const original = entry?.originalPdf && <p className="mb-8 text-sm"><a href={entry.originalPdf} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Read the original archive edition (PDF)</a></p>;
  if (!figures.length) return <>{original}<RichText data={data} converters={converters} /></>;
  const bodyText = normalise(nodeText(data.root));
  const placed = new Set<string>();
  const batches: React.ReactNode[] = [];
  const children = data.root.children;
  let start = 0;
  function renderFigure(figure: Figure) {
    return <figure key={figure.src} className="my-10 clear-both" data-archive-figure>
      <a href={figure.src} target="_blank" rel="noopener noreferrer" aria-label={`View full-size image: ${figure.alt}`}>
        <Image src={figure.src} width={figure.width} height={figure.height} alt={figure.alt}
          sizes="(min-width: 1280px) 1200px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)" className="m-0 h-auto w-full rounded-lg object-contain" />
      </a>
      <figcaption className="mt-3 text-xs leading-relaxed text-[var(--color-ink-muted)]">
        {figure.caption && !bodyText.includes(normalise(figure.caption)) && <span className="mb-1 block">{figure.caption}</span>}
        {figure.sourceUrl ? <a href={figure.sourceUrl} target="_blank" rel="noopener noreferrer">Original Enerqa publication</a>
          : <>Enerqa's 2024 Publication Archive · PDF page {figure.page}</>}. Select image to view full size.
      </figcaption>
      {figure.transcript && <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold">Read figure text</summary>
        <p className="whitespace-pre-wrap leading-relaxed">{figure.transcript}</p>
      </details>}
    </figure>;
  }
  children.forEach((node, index) => {
    const matches = figures.filter(figure => !placed.has(figure.src) && normalise(figure.afterText) === normalise(nodeText(node)));
    if (!matches.length) return;
    batches.push(<RichText key={`body-${start}`} data={{ ...data, root: { ...data.root, children: children.slice(start, index + 1) } }} converters={converters} />);
    for (const figure of matches) { batches.push(renderFigure(figure)); placed.add(figure.src); }
    start = index + 1;
  });
  if (start < children.length) batches.push(<RichText key={`body-${start}`} data={{ ...data, root: { ...data.root, children: children.slice(start) } }} converters={converters} />);
  const remaining = figures.filter(figure => !placed.has(figure.src));
  return <>{original}{batches}{remaining.length > 0 && <section aria-label="Figures from the original publication">{remaining.map(renderFigure)}</section>}</>;
}
