import { getPayload } from 'payload';
import configPromise from '../payload.config';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const gallery = await payload.find({ collection: 'gallery', limit: 100 });
  console.log(`Found ${gallery.totalDocs} gallery items.`);
  process.exit(0);
}

run().catch(console.error);
