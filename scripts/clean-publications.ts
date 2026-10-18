/**
 * Knowledge Hub data clean-up - handoff p. 225 and K04 (p. 155).
 *
 * Three jobs, all idempotent (safe to re-run):
 *
 *  1. Mark the records that are NOT articles. The 2024 archive import brought in
 *     three category separators and one biography page as if they were
 *     publications. They keep their records but stop being published.
 *
 *  2. Restore author bylines recovered from "enerQA's 2024 publication archive.pdf",
 *     where each article carries a "By: ..." line. Titles are matched by slug.
 *
 *  3. Migrate first-party articles that only existed in the retired `insights`
 *     collection into `publications`, so there is ONE canonical library.
 *
 * It does NOT invent publication dates. Every imported record currently shares
 * one placeholder date; the real dates are not in the archive PDF, so they need
 * a human with the original sources. `dateVerified` stays false until then.
 */
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';
import archiveAuthors from './archive-authors.json';

// Not articles (handoff p. 225: "category headings, biographies and archive
// separators are not articles").
type RecordKind = 'article' | 'category-heading' | 'biography';

const NOT_ARTICLES: Record<string, RecordKind> = {
  'authors-biographies': 'biography',
  'frameworks-and-methodologies': 'category-heading',
  'environment-and-society': 'category-heading',
  'energy-technology-and-finance': 'category-heading',
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Insights that already have a publication equivalent. Must stay in step with
// INSIGHT_SLUG_MAP in next.config.ts - these redirect to an existing article and
// must NOT be migrated, or the library ends up with two copies of one piece
// (handoff p. 227: consolidate first-party article duplicates item by item).
const ALREADY_MAPPED = new Set([
  'ghg-emissions-the-burden-on-our-planet',
  'driving-climate-action-through-renewable-energy-finance',
  'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar',
  'smoking-and-climate-change',
  'artisanal-gold-mining-environmental-impacts-of-mercury-use',
]);

async function main() {
  const payload = await getPayload({ config: configPromise });
  // JSON imports widen tuples to string[], so read positionally.
  const authorMap = archiveAuthors as unknown as Record<string, string[]>;

  // --- 1 + 2: classify and attribute existing publications -------------------
  const { docs: pubs } = await payload.find({ collection: 'publications', limit: 500, depth: 0 });

  let marked = 0;
  let attributed = 0;
  const unattributed: string[] = [];

  for (const pub of pubs as any[]) {
    const data: Record<string, unknown> = {};

    const kind: RecordKind = NOT_ARTICLES[pub.slug] ?? 'article';
    if (pub.recordKind !== kind) {
      data.recordKind = kind;
      if (kind !== 'article') marked++;
    }

    if (kind === 'article' && !pub.author) {
      // Match on slug, then fall back to a slugified title comparison.
      const hit =
        authorMap[pub.slug] ??
        Object.entries(authorMap).find(([key]) => {
          const t = norm(pub.title ?? '');
          return key.startsWith(t.slice(0, 40)) || t.startsWith(key.slice(0, 40));
        })?.[1];

      if (hit) {
        data.author = hit[1];
        attributed++;
      } else {
        unattributed.push(pub.slug);
      }
    }

    if (Object.keys(data).length > 0) {
      await payload.update({ collection: 'publications', id: pub.id, data });
    }
  }

  console.log(`Marked as not-an-article : ${marked}`);
  console.log(`Author byline restored   : ${attributed}`);
  if (unattributed.length) {
    console.log(`No author found in archive PDF (${unattributed.length}):`);
    unattributed.forEach((s) => console.log(`   - ${s}`));
  }



  console.log('\nREMAINING MANUAL WORK (handoff p. 225 "recover true dates"):');
  console.log('  Every publication still carries the same placeholder date and');
  console.log('  dateVerified = false. The archive PDF contains no per-article');
  console.log('  dates, so the real ones must come from the original sources.');

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
