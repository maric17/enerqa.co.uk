import { fetchFromProvider, providerKey } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';

/**
 * ReliefWeb API v2 - handoff pp. 213-214 (Provider ID: reliefweb).
 *
 * ⚠️ CURRENTLY DISABLED in the registry, and it will stay disabled until
 * somebody registers an appname.
 *
 * p. 213: "Pre-approved appname required since 1 November 2025; not a secret
 * API key." Verified on 2026-09-19 - an unregistered appname returns HTTP 403
 * with AccessDeniedHttpException. The connector is complete and the query is
 * correct; only the registration is missing.
 *
 * To switch it on:
 *   1. Register at https://reliefweb.int/help/api
 *   2. Set RELIEFWEB_APPNAME in .env
 *   3. Flip `enabled` to true for 'reliefweb' in core/registry.ts
 *
 * p. 214 also warns this is humanitarian coverage, not a climate-policy or
 * climate-finance feed, so it is placed as adaptation and resilience context.
 */

const BASE = 'https://api.reliefweb.int/v2/reports';

type ReliefWebFields = {
  title?: string;
  url?: string;
  date?: { created?: string; original?: string };
  source?: { name?: string }[];
  theme?: { name?: string }[];
  country?: { name?: string }[];
  body?: string;
};

type ReliefWebEntry = { id?: string; fields?: ReliefWebFields };

/** p. 214: adaptation, resilience, water and food security - not all crisis coverage. */
const DEFAULT_THEMES = ['Climate Change and Environment', 'Water Sanitation Hygiene', 'Food and Nutrition'];

export async function fetchReliefWebReports(options: {
  query?: string;
  themes?: string[];
  limit?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const appname = providerKey('reliefweb');
  if (!appname) {
    return fail(
      'reliefweb',
      'not_configured',
      'RELIEFWEB_APPNAME is not set. Register an appname at https://reliefweb.int/help/api - it is required since 1 November 2025 and is not a secret key.',
    );
  }

  const { query, themes = DEFAULT_THEMES, limit = 6 } = options;

  const params = new URLSearchParams({ appname, limit: String(Math.min(limit, 50)), profile: 'list' });
  params.set('fields[include][]', 'title');
  params.append('fields[include][]', 'url');
  params.append('fields[include][]', 'date.created');
  params.append('fields[include][]', 'source.name');
  params.append('fields[include][]', 'theme.name');
  params.append('fields[include][]', 'country.name');
  params.set('sort[]', 'date.created:desc');
  for (const theme of themes) params.append('filter[conditions][0][value][]', theme);
  params.set('filter[conditions][0][field]', 'theme.name');
  if (query) params.set('query[value]', query);

  const res = await fetchFromProvider<{ data?: ReliefWebEntry[] }>('reliefweb', `${BASE}?${params.toString()}`, {
    timeoutMs: 20000,
  });
  if (!res.ok) return res;

  const items: ResearchItem[] = [];

  for (const entry of res.data.data ?? []) {
    const f = entry.fields;
    const title = f?.title?.trim();
    const url = f?.url;
    if (!title || !url) continue;

    items.push({
      id: entry.id ?? url,
      title,
      summary: null,
      authors: [],
      source: f?.source?.[0]?.name ?? 'ReliefWeb',
      publishedAt: f?.date?.created ?? null,
      doi: null,
      readUrl: url,
      kind: 'report',
      peerReviewed: false,
      provenance: buildProvenance('reliefweb', {
        sourceUrl: url,
        sourceId: entry.id ?? null,
        sourceReleasedAt: f?.date?.created ?? null,
        attribution: `ReliefWeb / ${f?.source?.[0]?.name ?? 'publishing organisation'}`,
        accessStatus: 'verified_open',
        accessEvidence: 'ReliefWeb hosts the full report without registration.',
        transformations: ['Restricted to adaptation, resilience, water and food-security themes'],
      }),
    });
  }

  if (items.length === 0) return fail('reliefweb', 'no_results', 'No matching ReliefWeb reports.');
  return ok('reliefweb', items);
}
