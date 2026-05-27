import { getPayload } from 'payload';
import configPromise from './payload.config';

async function getSites() {
  const payload = await getPayload({
    config: configPromise,
  });

  const sites = await payload.find({
    collection: 'sites',
  });
  
  console.log(JSON.stringify(sites.docs.map(s => ({ id: s.id, name: s.name, slug: s.slug })), null, 2));
  process.exit(0);
}

getSites().catch(err => {
  console.error(err);
  process.exit(1);
});
