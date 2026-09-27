import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';
import fs from 'fs';
import path from 'path';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const media = await payload.find({ collection: 'media', limit: 100 });
  console.log(media.docs.map(d => ({ id: d.id, filename: d.filename })));
  process.exit(0);
}
run();
