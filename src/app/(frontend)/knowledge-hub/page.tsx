import React from 'react';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import KnowledgeHubClient from './KnowledgeHubClient';

// Handoff p. 227: unique descriptive title and meta description.
export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description:
    'Original Enerqa analysis alongside open-access news, research and official updates. Two collections: Enerqa Publication and Global Intelligence.',
  alternates: { canonical: '/knowledge-hub' },
};

export default async function KnowledgeHubPage() {
  const payload = await getPayload({ config: configPromise });

  // Enerqa Publication is the default view of /knowledge-hub (p. 155).
  //
  // recordKind filters out the category separators and biography pages that came
  // in with the 2024 archive import. Handoff p. 225 and K04 are explicit that
  // these are not articles and must be excluded from the publication collection.
  // They stay in the CMS - nothing is deleted - they just do not publish.
  const { docs: publications } = await payload.find({
    collection: 'publications',
    where: { recordKind: { equals: 'article' } },
    limit: 200,
    depth: 1,
    sort: '-date',
  });

  return <KnowledgeHubClient publications={publications} />;
}
