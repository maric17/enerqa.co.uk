import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import DataPortalClient from './DataPortalClient';

export default async function DataPortalPage() {
  const payload = await getPayload({ config: configPromise });
  
  // Fetch dynamic datasets from Payload CMS
  const { docs: datasets } = await payload.find({
    collection: 'datasets',
    limit: 50,
    depth: 1, // Populate media relations if needed
    sort: '-date', // Sort by date descending
  });

  return <DataPortalClient datasets={datasets} />;
}
