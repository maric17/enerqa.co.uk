import fs from 'fs';
import path from 'path';

const sourceFile = path.resolve('./docs/reenerqawebsitedeveloperhandoff/Enerqa Gapminder commercial-use candidates.json');
const outputFile = path.resolve('./src/lib/data-portal/gapminder-catalogue.json');

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const rawData = fs.readFileSync(sourceFile, 'utf8');
const parsed = JSON.parse(rawData);

const snapshots = parsed.snapshots;
const validCommits = new Set(Object.values(snapshots).map((s: any) => s.sha));

const candidates = parsed.candidates;
const supported = candidates.filter((c: any) => c.status === 'Supported');

const catalogue: any[] = [];
const seenIds = new Set<string>();

let validationErrors = 0;

for (const c of supported) {
  // Validate ID
  if (!c.record_id) {
    console.error('Missing record_id', c);
    validationErrors++;
    continue;
  }
  
  // Unique entries
  if (seenIds.has(c.record_id)) {
    console.error('Duplicate record_id:', c.record_id);
    validationErrors++;
    continue;
  }
  seenIds.add(c.record_id);

  // Validate Commit
  if (!validCommits.has(c.commit)) {
    console.error(`Invalid commit ${c.commit} for record_id ${c.record_id}`);
    validationErrors++;
    continue;
  }

  // Validate HTTPS URLs
  let hasBadUrl = false;
  for (const url of c.data_urls) {
    if (!url.startsWith('https://')) {
      console.error(`Non-HTTPS URL ${url} for record_id ${c.record_id}`);
      hasBadUrl = true;
      break;
    }
  }
  if (hasBadUrl) {
    validationErrors++;
    continue;
  }

  // Add to staging catalogue
  catalogue.push({
    id: c.record_id,
    concept: c.concept,
    name: c.name,
    collection: c.collection,
    topic: c.topic,
    source: c.source,
    licence: c.current_source_licence,
    data_urls: c.data_urls,
    commit: c.commit,
    attribution: c.attribution_template,
  });
}

if (validationErrors > 0) {
  console.error(`Validation failed with ${validationErrors} errors.`);
  process.exit(1);
}

console.log(`Successfully validated ${catalogue.length} supported candidates.`);
fs.writeFileSync(outputFile, JSON.stringify(catalogue, null, 2));
console.log(`Written to ${outputFile}`);
