import { DATASETS } from '../../src/lib/data-portal/connectors';
import { fetchStations, fetchAirQualitySeries } from '../../src/lib/api/data/openaq';
import { loadOccurrenceExtract } from '../../src/lib/api/data/occurrenceExport';
import { retainSeries } from '../../src/lib/api/core/dataRecords';
import { reserveRequest } from '../../src/lib/api/core/storage';
import { LIMITS } from '../../src/lib/api/core/health';
import { Pool } from 'pg';

// Low-volume probes use the same shared ledger as production and never print keys.
for (const [key, query] of [
  ['world-bank-indicator', 'countries=QAT&indicator=adjustedNetSavings&from=2020&to=2023'],
  ['energy-generation', 'from=2020&to=2023'],
  ['municipal-waste', 'from=2020&to=2022'],
  ['solar-resource', 'from=2023&to=2023'],
  ['country-emissions', 'countries=QAT&from=2023&to=2023'],
]) {
  const result = await DATASETS[key].handler(new URLSearchParams(query));
  console.log(JSON.stringify({ dataset: key, ok: result.ok, ...(result.ok ? { series: result.data.length,
    observations: result.data.reduce((n, s) => n + s.observations.length, 0), units: result.data.map(s => s.unit),
    checked: result.data.every(s => Boolean(s.provenance.accessCheckedAt)) } : { reason: result.reason, message: result.message }) }));
}
const occurrences = await loadOccurrenceExtract(new URLSearchParams('country=QA'));
console.log(JSON.stringify({ dataset: 'gbif-occurrences', ok: occurrences.ok, ...(occurrences.ok ? { records: occurrences.data.records.length, citedDatasets: occurrences.data.datasets.filter(d => d.doi).length } : { reason: occurrences.reason }) }));
const stations = await fetchStations({ limit: 100 });
console.log(JSON.stringify({ dataset: 'openaq-stations', ok: stations.ok, ...(stations.ok ? { licensedStations: stations.data.length } : { reason: stations.reason }) }));
const station = stations.ok ? stations.data.find(s => s.parameters.some(p => ['pm25', 'pm10'].includes(p.name)) && s.lastMeasuredAt) : null;
const sensor = station?.parameters.find(p => ['pm25', 'pm10'].includes(p.name));
if (station && sensor) {
  const to = station.lastMeasuredAt!.slice(0, 10);
  const from = new Date(Date.parse(to) - 3 * 86400000).toISOString().slice(0, 10);
  const result = await retainSeries(await fetchAirQualitySeries({ locationId: station.id, sensorId: sensor.sensorId, from, to }));
  console.log(JSON.stringify({ dataset: 'air-quality', location: station.id, sensor: sensor.sensorId, from, to,
    ok: result.ok, ...(result.ok ? { observations: result.data[0].observations.length } : { reason: result.reason, message: result.message }) }));
}

// Concurrent reservations use an isolated fixture provider; clean up only its rows.
const provider = 'part13-accounting-fixture' as keyof typeof LIMITS;
LIMITS[provider] = { daily: 2 };
const db = new Pool({ connectionString: process.env.DATABASE_URI });
try {
  const results = await Promise.all(Array.from({ length: 5 }, () => reserveRequest(provider)));
  const permitted = results.filter(r => r === null).length;
  if (permitted !== 2) throw new Error(`Shared accounting allowed ${permitted} attempts, expected 2.`);
  console.log('Shared accounting: 2 of 5 simultaneous requests allowed; other 3 refused.');
  const { rows } = await db.query('SELECT provider, count(*)::int AS records FROM enerqa_connectors.external_records GROUP BY provider ORDER BY provider');
  console.log(JSON.stringify({ durableRecords: rows }));
} finally {
  await db.query('DELETE FROM enerqa_connectors.provider_requests WHERE provider=$1', [provider]);
  delete LIMITS[provider];
  await db.end();
}
