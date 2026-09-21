import { fetchFromProvider } from '../core/fetch';
import { buildProvenance } from '../core/provenance';
import { fail, ok, type ConnectorResult, type ResearchItem } from '../core/types';

/**
 * SEC EDGAR submissions - handoff p. 217 (Provider ID: sec-edgar).
 *
 * p. 217 is emphatic about what this is NOT: "Company submissions API is not
 * general keyword ESG search." There is no way to ask EDGAR "show me climate
 * disclosures"; you ask it "show me what this company filed". So this is a
 * curated issuer watchlist, and the UI labels every result
 * **Corporate disclosure** - never news, never Enerqa analysis, never a
 * market quote.
 *
 * SEC requires a declaring User-Agent with a real contact address, which
 * core/fetch.ts supplies from API_CONTACT_EMAIL.
 */

const BASE = 'https://data.sec.gov/submissions';

/**
 * The watchlist. Deliberately short and editorial: p. 217 warns against
 * implying universal global issuer coverage. Add issuers consciously; do not
 * grow this into a market index.
 */
export const DEFAULT_WATCHLIST: { cik: string; name: string }[] = [
  { cik: '0000034088', name: 'Exxon Mobil Corporation' },
  { cik: '0000093410', name: 'Chevron Corporation' },
  { cik: '0001326160', name: 'Duke Energy Corporation' },
  { cik: '0000753308', name: 'NextEra Energy, Inc.' },
];

/** Forms worth surfacing: annual, interim and material-event disclosures. */
const RELEVANT_FORMS = new Set(['10-K', '10-Q', '8-K', '20-F', '40-F', '6-K']);

type Submissions = {
  cik?: string;
  name?: string;
  filings?: {
    recent?: {
      accessionNumber?: string[];
      filingDate?: string[];
      reportDate?: string[];
      form?: string[];
      primaryDocument?: string[];
      primaryDocDescription?: string[];
    };
  };
};

function filingUrl(cik: string, accession: string, document: string): string {
  // EDGAR paths drop the leading zeros from the CIK and the dashes from the
  // accession number. Getting either wrong produces a 404, not a redirect.
  const bareCik = String(Number.parseInt(cik, 10));
  const bareAccession = accession.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${bareCik}/${bareAccession}/${document}`;
}

export async function fetchIssuerFilings(options: {
  watchlist?: { cik: string; name: string }[];
  perIssuer?: number;
}): Promise<ConnectorResult<ResearchItem[]>> {
  const { watchlist = DEFAULT_WATCHLIST, perIssuer = 3 } = options;

  const responses = await Promise.all(
    watchlist.map(async (issuer) => ({
      issuer,
      res: await fetchFromProvider<Submissions>('sec-edgar', `${BASE}/CIK${issuer.cik}.json`, { timeoutMs: 20000 }),
    })),
  );

  const items: ResearchItem[] = [];

  for (const { issuer, res } of responses) {
    if (!res.ok) continue;
    const recent = res.data.filings?.recent;
    if (!recent?.form) continue;

    const issuerName = res.data.name ?? issuer.name;
    let taken = 0;

    for (let i = 0; i < recent.form.length && taken < perIssuer; i += 1) {
      const form = recent.form[i];
      if (!RELEVANT_FORMS.has(form)) continue;

      const accession = recent.accessionNumber?.[i];
      const document = recent.primaryDocument?.[i];
      const filingDate = recent.filingDate?.[i] ?? null;
      if (!accession || !document) continue;

      const url = filingUrl(issuer.cik, accession, document);

      items.push({
        id: accession,
        title: `${issuerName} — ${form}${recent.reportDate?.[i] ? ` for period ending ${recent.reportDate[i]}` : ''}`,
        summary: recent.primaryDocDescription?.[i] || null,
        authors: [],
        source: issuerName,
        publishedAt: filingDate,
        doi: null,
        readUrl: url,
        // The UI keys off this to label the card "Corporate disclosure".
        kind: 'disclosure',
        peerReviewed: false,
        provenance: buildProvenance('sec-edgar', {
          sourceUrl: url,
          sourceId: accession,
          sourceReleasedAt: filingDate,
          observationPeriod: recent.reportDate?.[i] ?? null,
          accessStatus: 'verified_open',
          accessEvidence: 'EDGAR archive documents are public and require no registration.',
          transformations: [`Filtered to ${[...RELEVANT_FORMS].join(', ')} filings from a curated issuer watchlist`],
        }),
      });
      taken += 1;
    }
  }

  if (items.length === 0) return fail('sec-edgar', 'no_results', 'No recent filings from the issuer watchlist.');
  // Newest first across issuers.
  items.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  return ok('sec-edgar', items);
}
