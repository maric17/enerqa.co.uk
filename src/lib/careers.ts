import { cache } from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

// One approval gate feeds the page, footer and sitemap; avoid links to an unpublished draft.
export const getPublishedCareers = cache(async () => {
  const content = await (await getPayload({ config: configPromise })).findGlobal({ slug: 'careers-config' });
  return content.isApproved ? content : null;
});
