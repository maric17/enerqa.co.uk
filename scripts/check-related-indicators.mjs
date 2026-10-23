import { readFile, writeFile } from 'node:fs/promises';

// Check only the explicitly selected catalogue entries, without changing provider data.
const mapping = await readFile('src/lib/data-portal/relatedIndicators.ts', 'utf8');
const selected = new Set(mapping.match(/(?:wdi|fasttrack):[a-z0-9_]+/g));
const catalogue = JSON.parse(await readFile('src/lib/data-portal/gapminder-catalogue.json', 'utf8'));
const records = catalogue.filter(record => selected.has(record.id));
const coverage = {};
const failures = [];
for (let offset = 0; offset < records.length; offset += 4) {
  await Promise.all(records.slice(offset, offset + 4).map(async record => {
    try {
      const years = [];
      for (const url of record.data_urls) {
        const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
        const [header, ...rows] = (await response.text()).trim().split('\n');
        const index = header.split(',').indexOf('time');
        if (index < 0) throw new Error('Observation year column is missing');
        for (const row of rows) {
          const year = row.split(',')[index];
          if (/^\d{4}$/.test(year)) years.push(Number(year));
        }
      }
      if (!years.length) throw new Error('No observations returned');
      coverage[record.id] = { from: Math.min(...years), to: Math.max(...years), commit: record.commit };
    } catch (error) {
      failures.push({ id: record.id, reason: error.message });
    }
  }));
}
if (failures.length || records.length !== selected.size) {
  console.error(JSON.stringify({ failures, selected: selected.size, found: records.length }));
  process.exitCode = 1;
} else {
  const ordered = Object.fromEntries(Object.entries(coverage).sort(([left], [right]) => left.localeCompare(right)));
  await writeFile('src/lib/data-portal/related-indicator-coverage.json', JSON.stringify(ordered, null, 2) + '\n');
  console.log(`Verified all source files and observation periods for ${records.length} recommended indicators.`);
}
