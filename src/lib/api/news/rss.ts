import { XMLParser } from 'fast-xml-parser';
import type { NewsItem, NewsProvider } from './types';
import { hostnameOf, normaliseUrl } from './types';
import { extractRegions } from './geography';

/**
 * Shared RSS reader for the keyless official feeds (EIA p. 214, EEA pp. 215-216).
 *
 * Why RSS at all: a feed's <description> is written by the publisher precisely
 * so other sites can republish it. That is the one thing GDELT cannot give us -
 * it licenses a headline and a link, no teaser. RSS is what lets H03 show the
 * "permitted short description" p. 13 asks for.
 */

export type RssSource = {
  url: string;
  provider: NewsProvider;
  /** Attribution label shown on the card. */
  providerLabel: string;
  /** Publisher name, e.g. "U.S. Energy Information Administration". */
  publisher: string;
  /** Rights note stored with each record (p. 226 provenance). */
  rights: string;
  language: string;
  /** Seconds between refreshes. Both feeds suggest 6 hours. */
  revalidate: number;
};

// fast-xml-parser returns a string for simple nodes, but an object with a
// "#text" key when the node also has attributes. This flattens both.
function text(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '#text' in value) {
    return String((value as Record<string, unknown>)['#text'] ?? '').trim();
  }
  return '';
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/**
 * Feed summaries often contain markup. We display them as plain text, so the
 * tags come out here rather than being rendered - never with
 * dangerouslySetInnerHTML, which would let a third-party feed inject scripts
 * into our page.
 */
function toPlainText(html: string, maxLength = 220): string {
  const stripped = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length <= maxLength) return stripped;
  // Cut on a word boundary so the summary does not end mid-word.
  const cut = stripped.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function toIso(pubDate: string): string | null {
  if (!pubDate) return null;
  // EIA emits "Fri, 18 Sep 2026  09:00:00 EST" - note the double space.
  const t = Date.parse(pubDate.replace(/\s+/g, ' ').trim());
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

/**
 * Read one RSS feed and map it to NewsItems.
 *
 * Returns [] on any failure. p. 226: a failed call becomes an honest empty
 * state, never invented content and never a thrown error that takes the
 * homepage down with it.
 */
export async function fetchRssFeed(source: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: {
        // p. 215 asks for a descriptive User-Agent so the publisher can see
        // who is polling them and contact us instead of silently blocking.
        'User-Agent': 'enerqa.co.uk/1.0 (+https://enerqa.co.uk)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: source.revalidate, tags: ['news', source.provider] },
    });

    if (!res.ok) {
      console.warn(`[${source.provider}] HTTP ${res.status} for ${source.url}`);
      return [];
    }

    const xml = await res.text();
    const doc = parser.parse(xml) as {
      rss?: { channel?: { item?: unknown } };
    };

    const raw = doc?.rss?.channel?.item;
    // A feed with exactly one entry parses to an object, not an array.
    const entries: unknown[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const retrievedAt = new Date().toISOString();

    return entries.flatMap((entry) => {
      const node = entry as Record<string, unknown>;
      const url = text(node.link);
      const title = toPlainText(text(node.title), 300);
      if (!url || !title) return [];

      const summary = toPlainText(text(node.description));

      return [
        {
          id: normaliseUrl(url),
          title,
          summary: summary || null,
          url,
          domain: hostnameOf(url),
          publisher: source.publisher,
          publishedAt: toIso(text(node.pubDate)),
          language: source.language,
          provider: source.provider,
          providerLabel: source.providerLabel,
          retrievedAt,
          rights: source.rights,
          regions: extractRegions(title, summary || null),
        } satisfies NewsItem,
      ];
    });
  } catch (error) {
    console.warn(`[${source.provider}] feed failed:`, error);
    return [];
  }
}
