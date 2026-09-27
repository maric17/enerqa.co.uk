import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

async function sync() {
  const payload = await getPayload({
    config: configPromise,
  });
  console.log('Database synced!');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
