// Prepare the joint review from source configuration, without changing the CMS.
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const source = await readFile('src/lib/feeds/contextual.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { DOMAIN_FEEDS } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const seed = ts.createSourceFile('industries.ts', await readFile('scripts/seed-industries.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const string = node => node && ts.isStringLiteral(node) ? node.text : '';
const property = (node, key) => node.properties.find(p => p.name?.getText(seed) === key)?.initializer;
let industries = [];
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(seed) === 'industries' && ts.isArrayLiteralExpression(node.initializer)) {
    industries = node.initializer.elements.map(item => ({ title: string(property(item, 'title')), slug: string(property(item, 'slug')),
      providers: property(item, 'dataSources').elements.map(provider => string(property(provider, 'provider'))) }));
  }
  ts.forEachChild(node, visit);
}
visit(seed);
if (Object.keys(DOMAIN_FEEDS).length !== 4 || industries.length !== 13) throw new Error('Expected all four domains and thirteen industry mappings.');
const names = { 'climate-trace': 'Climate TRACE', 'oecd-sdmx': 'OECD', 'eia-open-data': 'U.S. EIA', 'nasa-power': 'NASA POWER',
  'world-bank-indicators': 'World Bank', 'gbif-occurrence': 'GBIF', 'openaq-v3': 'OpenAQ', 'noaa-cdo': 'NOAA', 'un-sdg': 'UN SDG' };
const label = ids => ids.map(id => names[id] ?? id).join(', ');
const lines = ['# Related data — joint review matrix', '', 'Prepared 15 October 2026 for WF-21. This inventories the four domain mappings in `src/lib/feeds/contextual.ts` and the thirteen industry mappings in `scripts/seed-industries.ts`. Industry seed mappings must be compared with the saved CMS settings during the joint review; they are not represented as a fresh database audit.', '',
  'News discovery, market quotes and numerical sustainability datasets are separate inputs. Selecting Exa or another news service does not replace the numerical providers below. Keep working catalogue links and existing verified datasets until an agreed replacement has suitable coverage and rights.', '',
  '## Four domains', '', '| Page | Configured numerical sources | Review decision |', '| --- | --- | --- |'];
for (const [slug, config] of Object.entries(DOMAIN_FEEDS)) lines.push(`| [${slug.replaceAll('-', ' ')}](/domains/${slug}) | ${label(config.dataSources)} | Choose the indicator, geography, period and whether a compact chart adds value. |`);
lines.push('', '## Thirteen industries', '', '| Page | Seeded numerical sources | Review decision |', '| --- | --- | --- |');
for (const industry of industries) lines.push(`| [${industry.title}](/industries/${industry.slug}) | ${label(industry.providers)} | Compare saved CMS mapping; choose a sector-relevant measure and geography. |`);
lines.push('', '## Proposed presentation', '',
  '- One compact, clearly titled dataset preview per page when a relevant verified dataset exists. Show units, observation period, geography, provider, last update and a link to methodology/download.',
  '- Use source-catalogue links when a relevant licensed measure is unavailable. Do not fill gaps with example values or unrelated market quotes.',
  '- Confirm whether Enerqa wants global comparisons, a Qatar/GCC view or another geography for each page. The current EIA fallback is explicitly United States electricity generation; that must not stand in for Qatar without a deliberate editorial choice.',
  '- Select company tickers for Major Markets separately from domain/industry sustainability indicators.', '',
  '## Decisions to record for each row', '',
  'Record: chosen indicator and unit; geography; historical/current period; source and dataset link; update cadence; available licence/attribution; chart versus catalogue link; editorial owner. Apply the agreed choices through the existing dataset and page configuration, then verify all seventeen pages.', '',
  'Dependency: resolve the applicable provider scope in [API-RECOMMENDATIONS.md](API-RECOMMENDATIONS.md), then review this matrix with the client. No provider, dataset, schema or CMS mapping was changed by generating this document.', '');
await mkdir('docs/feedback', { recursive: true });
await writeFile('docs/feedback/RELATED-DATA-REVIEW.md', lines.join('\n'));
console.log('Prepared all 4 domain and 13 industry rows for joint review.');
