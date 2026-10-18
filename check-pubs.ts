import { getPayload } from 'payload';
import configPromise from './src/payload.config';
async function run() {
  const payload = await getPayload({ config: configPromise });
  const pubs = await payload.find({ collection: 'publications', depth: 0, limit: 100 });
  console.log(`Found ${pubs.docs.length} publications`);
  if (pubs.docs.length > 0) {
    const unlinked = pubs.docs.filter(p => (!p.industries || p.industries.length === 0) && (!p.domains || p.domains.length === 0));
    console.log(`Of those, ${unlinked.length} have no domains or industries linked.`);
    console.log(pubs.docs.slice(0, 3).map(p => ({ title: p.title, industries: p.industries })));
  }
  process.exit(0);
}
run().catch(console.error);
