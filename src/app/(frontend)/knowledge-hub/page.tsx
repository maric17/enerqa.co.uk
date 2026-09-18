import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import KnowledgeHubClient from './KnowledgeHubClient';

export default async function KnowledgeHubPage() {
  const payload = await getPayload({ config: configPromise });
  
  // Fetch dynamic publications from Payload CMS
  const { docs: publications } = await payload.find({
    collection: 'publications',
    limit: 50,
    depth: 1, // Populate media relations if needed
    sort: '-date', // Sort by date descending
  });

  return <KnowledgeHubClient publications={publications} />;
}
