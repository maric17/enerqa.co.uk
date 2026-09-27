import { getPayload } from 'payload';
import configPromise from './src/payload.config.ts';

async function main() {
  const payload = await getPayload({ config: configPromise });
  const ds = await payload.find({ collection: 'datasets' });
  console.log(JSON.stringify(ds.docs.map(d => ({
    id: d.id, 
    slug: d.slug, 
    title: d.title, 
    provider: d.provider, 
    identifier: d.identifier,
    coverage: d.geographicLevel,
    frequency: d.frequency,
    refreshSchedule: d.refreshSchedule // Wait, does refreshSchedule exist?
  })), null, 2));
  process.exit(0);
}
main();
