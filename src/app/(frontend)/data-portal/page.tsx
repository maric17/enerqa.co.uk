import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import DataPortalClient from './DataPortalClient';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Portal',
  description: 'Explore Enerqa\'s Data Portal for datasets and dashboards covering climate action, energy systems, and sustainability indicators.',
};

export default async function DataPortalPage() {
  const payload = await getPayload({ config: configPromise });
  
  // Fetch dynamic datasets from Payload CMS
  const { docs: datasets } = await payload.find({
    collection: 'datasets',
    limit: 100,
    depth: 1, // Populate media relations if needed
    sort: '-date', // Sort by date descending
  });

  const { docs: dashboards } = await payload.find({
    collection: 'dashboards',
    limit: 50,
  });

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
  });

  return <DataPortalClient datasets={datasets} dashboards={dashboards} categories={categories} />;
}
