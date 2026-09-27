import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { publishedToolsWhere } from '@/collections/Tools';
import { usableText, type IndexEntry } from './searchIndex';
import { SITE_INDEX } from './siteIndex';

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ');

/**
 * Builds the public search index from the CMS.
 *
 * p. 227: "Keep unapproved drafts, confidential briefs, internal CMS records
 * and restricted tool inputs out of the public index." So: Enquiries are never
 * read; publications are Article records only (not category headings or
 * biographies); datasets must be `free` (the Data Portal's own gate); tools
 * must be validated. The Local API skips access rules, so each filter is
 * explicit here rather than left to the collection's `read` access.
 *
 * Throws when the CMS is unreachable; the page shows the AI04 failure state.
 */
export async function loadSearchIndex(): Promise<IndexEntry[]> {
  const payload = await getPayload({ config: configPromise });

  const [domains, industries, capabilities, publications, datasets, tools] = await Promise.all([
    payload.find({
      collection: 'domains',
      limit: 100,
      depth: 0,
      select: { slug: true, title: true, heroNarrative: true, metaDescription: true, lifecycleNarrative: true, topicPhrase: true },
    }),
    payload.find({
      collection: 'industries',
      limit: 100,
      depth: 0,
      select: { slug: true, title: true, heroNarrative: true, metaDescription: true, lifecycleNarrative: true },
    }),
    payload.find({
      collection: 'capabilities',
      limit: 500,
      depth: 0,
      select: { slug: true, heading: true, narrative: true, domain: true },
    }),
    payload.find({
      collection: 'publications',
      where: { recordKind: { equals: 'article' } },
      limit: 500,
      depth: 0,
      // Not `content`: some bodies are several hundred KB each.
      select: { slug: true, title: true, heading: true, excerpt: true, metaDescription: true, metaKeywords: true, type: true, date: true, dateVerified: true },
    }),
    payload.find({
      collection: 'datasets',
      where: { status: { equals: 'verified_open' } },
      limit: 500,
      depth: 0,
      select: { slug: true, title: true, description: true, provider: true },
    }),
    payload.find({
      collection: 'tools',
      where: publishedToolsWhere,
      limit: 100,
      depth: 0,
      select: { slug: true, title: true, desc: true, category: true },
    }),
  ]);

  const domainSlugById = new Map(domains.docs.map((d) => [d.id, d.slug]));

  const entries: IndexEntry[] = [...SITE_INDEX];

  for (const d of domains.docs) {
    entries.push({
      title: d.title,
      url: `/domains/${d.slug}`,
      group: 'domains',
      category: 'Domain',
      excerpt: usableText(d.heroNarrative),
      body: join(d.metaDescription, d.lifecycleNarrative, d.topicPhrase),
    });
  }

  for (const c of capabilities.docs) {
    const domainId = typeof c.domain === 'object' && c.domain ? c.domain.id : c.domain;
    const domainSlug = domainId != null ? domainSlugById.get(domainId) : undefined;
    if (!domainSlug) continue; // no parent page, so no canonical destination
    entries.push({
      title: c.heading,
      // Capabilities are anchored H2/H3 sections of their domain page (p. 4).
      url: `/domains/${domainSlug}#${c.slug}`,
      group: 'domains',
      category: 'Capability',
      excerpt: usableText(c.narrative),
    });
  }

  for (const i of industries.docs) {
    entries.push({
      title: i.title,
      url: `/industries/${i.slug}`,
      group: 'domains',
      category: 'Industry',
      excerpt: usableText(i.heroNarrative),
      body: join(i.metaDescription, i.lifecycleNarrative),
    });
  }

  for (const p of publications.docs) {
    entries.push({
      title: p.title,
      // The article itself, not the Knowledge Hub landing page.
      url: `/knowledge-hub/${p.slug}`,
      group: 'publications',
      // p. 229: first-party work is labelled as Enerqa's own on every surface.
      category: `Enerqa Publication · ${p.type || 'Publication'}`,
      excerpt: usableText(p.excerpt) ?? usableText(p.metaDescription),
      body: join(p.heading, p.metaKeywords),
      date: p.date ?? null,
      dateVerified: Boolean(p.dateVerified),
    });
  }

  for (const ds of datasets.docs) {
    entries.push({
      title: ds.title,
      url: `/data-portal/datasets/${ds.slug}`,
      group: 'data',
      category: 'Dataset',
      excerpt: usableText(ds.description),
      body: ds.provider ?? undefined,
    });
  }

  for (const t of tools.docs) {
    entries.push({
      title: t.title,
      url: `/tools/${t.slug}`,
      group: 'tools',
      category: 'Tool',
      excerpt: usableText(t.desc),
      body: t.category ?? undefined,
    });
  }

  return entries;
}

/**
 * The index changes only when an editor publishes, but every search used to
 * run six CMS queries. Keep the built index for a few minutes per server
 * process; a failed build is not kept, so the next search retries.
 */
const INDEX_TTL_MS = 5 * 60 * 1000;
let cachedIndex: { builtAt: number; entries: Promise<IndexEntry[]> } | undefined;

export function getSearchIndex(now: number = Date.now()): Promise<IndexEntry[]> {
  if (!cachedIndex || now - cachedIndex.builtAt > INDEX_TTL_MS) {
    const entries = loadSearchIndex();
    cachedIndex = { builtAt: now, entries };
    entries.catch(() => {
      if (cachedIndex?.entries === entries) cachedIndex = undefined;
    });
  }
  return cachedIndex.entries;
}
