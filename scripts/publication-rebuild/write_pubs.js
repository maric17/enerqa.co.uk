// Knowledge-hub agent: re-import publication bodies and metadata (L683 L685 L696 L700 L702 L718 L813).
// 1. Saves every publications row (all columns) to ./backup-publications.json first (gitignore it).
// 2. In one transaction, updates by slug: content, excerpt, meta_description, archive_category,
//    and where recovered, author and date + date_verified. Rows already holding the new values are skipped,
//    so running it twice changes nothing.
// Usage (from the repo root): node --env-file=.env scripts/publication-rebuild/write_pubs.js --dry
// Review the dry-run output before running it without --dry. Bodies come from ./out (built by
// build_lex.py from the 2024 archive PDF on 25 Sep 2026; build_lex.py itself needs the original
// extraction workspace and is kept for reference only).
const pg = require('pg'), fs = require('fs');
const DRY = process.argv.includes('--dry');
const meta = JSON.parse(fs.readFileSync(`${__dirname}/out/meta.json`, 'utf8'));

// Archive PDF section separators (pp. 7, 25, 71, 96).
const CATEGORY = {
  'climate-science-and-impacts': ['the-evolution-of-climate-change-understanding-and-response', 'climate-forcers-the-hidden-drivers-of-global-warming',
    'weathering-the-storm-climate-resilience-in-supply-chains', 'climate-change-and-war-a-complex-interplay', 'greenhouse-gases-and-climate-change-an-overview',
    'breathing-vs-burning-the-carbon-footprint-contrast', 'ghg-emissions-the-burden-on-our-planet'],
  'energy-technology-and-finance': ['exploring-the-rainbow-of-hydrogen-technology-a-path-to-sustainable-energy-and-climate-resilience',
    'green-credit-lines-in-the-gulf-cooperation-council-evaluating-opportunities-overcoming-challenges-and-assessing-the-impact-on-energy-transition-in',
    'supercritical-water-technology-scwt-a-sustainable-solution-for-waste-management-in-qatar', 'driving-climate-action-through-renewable-energy-finance-insights-from-an-expert',
    'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar', 'the-role-of-artificial-intelligence-in-environmental-sustainability'],
  'environment-and-society': ['the-hidden-costs-of-your-burger-and-pizza-whats-really-at-stake', 'practical-tips-for-reducing-food-waste-at-home-a-step-towards-sustainability',
    'sustainable-tourism', 'the-hidden-link-between-cigarette-smoking-and-climate-change', 'empowering-communities-through-social-sustainability-a-call-to-action',
    'the-origins-of-urban-greening', 'environmental-impacts-of-mercury-use-in-artisanal-gold-mining-in-africa-sudan-case-the-amplifying-effect-of-torrential-rains-and-floods'],
  'frameworks-and-methodologies': ['understanding-the-dpsir-dpcer-dpswr-and-dpser-frameworks-in-analyzing-the-interactions-between-human-activities-and-the-environment',
    'dpsir-framework-for-sustainable-aquaculture-in-the-red-sea-region-ksa-a-climate-adaptation-and-mitigation-perspective',
    'the-imperative-for-esg-readiness-tools-unlocking-benefits-for-companies-institutions-and-society', 'scope-4-emissions-the-concept-of-avoided-emissions'],
};

// Bylines: 3 recovered, 2 obvious typos corrected against the same author's other archive bylines.
const AUTHOR = {
  'ghg-emissions-the-burden-on-our-planet': 'Mohamed M. Ahmed',                       // archive p. 24 "BY: Mohamed M. Ahmed"
  'supercritical-water-technology-scwt-a-sustainable-solution-for-waste-management-in-qatar': 'Dr. Muzamil Abdella', // archive p. 56
  'the-imperative-for-esg-readiness-tools-unlocking-benefits-for-companies-institutions-and-society': 'enerQA’s development team', // p. 105 "By enerQA’s development team"
  'green-credit-lines-in-the-gulf-cooperation-council-evaluating-opportunities-overcoming-challenges-and-assessing-the-impact-on-energy-transition-in':
    'Dr. Islam M. Awad and Dr. Quosay A. Ahmed',                                        // archive typo "Isalm"
  'exploring-the-rainbow-of-hydrogen-technology-a-path-to-sustainable-energy-and-climate-resilience':
    'Quosay A. Ahmed and Reem Almalik',                                                 // archive typo "Almlik"
};

// datePublished of the same article on the live www.enerqa.co.uk (the original publisher).
// Stored at 12:00 UTC so the calendar day is the same in every time zone.
const DATE = {
  'breathing-vs-burning-the-carbon-footprint-contrast': '2024-07-25',
  'climate-change-and-war-a-complex-interplay': '2024-09-05',
  'climate-forcers-the-hidden-drivers-of-global-warming': '2024-09-05',
  'driving-climate-action-through-renewable-energy-finance-insights-from-an-expert': '2024-08-01',
  'ghg-emissions-the-burden-on-our-planet': '2024-07-30',
  'i-recs-a-catalyst-for-renewable-energy-investment-in-qatar': '2024-08-24',
  'the-hidden-link-between-cigarette-smoking-and-climate-change': '2024-08-29',     // live /smoking-and-climate-change
  'weathering-the-storm-climate-resilience-in-supply-chains': '2024-10-10',
};

(async () => {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URI });
  await c.connect();
  const rows = (await c.query('select * from publications order by id')).rows;
  const bk = `${__dirname}/backup-publications.json`;
  if (!fs.existsSync(bk)) { fs.writeFileSync(bk, JSON.stringify(rows)); console.log('backup ->', bk, rows.length, 'rows'); }
  else console.log('backup exists, kept:', bk);

  const catOf = {}; for (const [k, v] of Object.entries(CATEGORY)) v.forEach((s) => (catOf[s] = k));
  let changed = 0;
  await c.query('begin');
  try {
    for (const r of rows) {
      const m = meta[r.slug];
      if (!m) { console.log('SKIP (no rebuilt body):', r.slug); continue; }
      const content = JSON.parse(fs.readFileSync(`${__dirname}/out/${r.slug}.json`, 'utf8'));
      const next = {
        content, excerpt: m.excerpt, meta_description: m.metaDescription,
        archive_category: catOf[r.slug] ?? r.archive_category,
        author: AUTHOR[r.slug] ?? r.author,
        date: DATE[r.slug] ? new Date(`${DATE[r.slug]}T12:00:00.000Z`) : r.date,
        date_verified: DATE[r.slug] ? true : r.date_verified,
      };
      const same = JSON.stringify(r.content) === JSON.stringify(content) && r.excerpt === next.excerpt && r.meta_description === next.meta_description &&
        r.archive_category === next.archive_category && r.author === next.author && +new Date(r.date) === +next.date && r.date_verified === next.date_verified;
      if (same) { console.log('unchanged', r.slug.slice(0, 50)); continue; }
      changed++;
      console.log('update', String(r.id).padStart(2), r.slug.slice(0, 50).padEnd(50), next.archive_category, '|', next.author, '|', next.date.toISOString().slice(0, 10), next.date_verified);
      if (!DRY) await c.query(
        `update publications set content=$1::jsonb, excerpt=$2, meta_description=$3, archive_category=$4, author=$5, date=$6, date_verified=$7, updated_at=now() where id=$8`,
        [JSON.stringify(content), next.excerpt, next.meta_description, next.archive_category, next.author, next.date, next.date_verified, r.id]);
    }
    await c.query(DRY ? 'rollback' : 'commit');
    console.log(DRY ? 'DRY RUN, rolled back.' : 'committed.', 'rows changed:', changed);
  } catch (e) { await c.query('rollback'); throw e; }
  await c.end();
})().catch((e) => { console.error(e); process.exit(1); });
