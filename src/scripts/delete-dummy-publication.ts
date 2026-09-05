import { getPayload } from 'payload';
import configPromise from '/Users/maric/Documents/Work/Repos/enerqa.co.uk/src/payload.config.ts';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const pubs = await payload.find({
    collection: 'publications',
    limit: 100,
  });
  
  const dummyPubs = pubs.docs.filter(p => p.title.toLowerCase().includes('dummy') || p.title.toLowerCase().includes('test'));
  
  if (dummyPubs.length === 0) {
    console.log("No dummy publications found by name. Here are the first 5 publications:");
    pubs.docs.slice(0, 5).forEach(p => console.log(`- [${p.id}] ${p.title}`));
    
    // Check if there are more than 24 publications (since we added 24)
    if (pubs.docs.length > 24) {
      console.log(`\nThere are ${pubs.docs.length} total publications. Deleting any that we didn't just add...`);
      // Our added publications all start with the titles from the PDF, or have date '2024-12-01'
      const originalPubs = pubs.docs.filter(p => new Date(p.date).toISOString() !== '2024-12-01T00:00:00.000Z');
      for (const p of originalPubs) {
        console.log(`Deleting: [${p.id}] ${p.title}`);
        await payload.delete({
          collection: 'publications',
          id: p.id,
        });
      }
    }
  } else {
    for (const p of dummyPubs) {
      console.log(`Deleting: [${p.id}] ${p.title}`);
      await payload.delete({
        collection: 'publications',
        id: p.id,
      });
    }
  }

  process.exit(0);
}

run();
