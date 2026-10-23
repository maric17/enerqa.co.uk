import React from 'react';
import DataExplorerClient from './DataExplorerClient';

export const metadata = {
  title: 'Data Explorer | Enerqa',
  description: 'Explore Gapminder data and visualize trends.',
};

export default async function DataExplorerPage({ searchParams }: {
  searchParams: Promise<{ indicator?: string | string[]; country?: string | string[] }>;
}) {
  // Next.js resolves query parameters asynchronously; repeated values are ignored.
  const query = await searchParams;
  const indicator = typeof query.indicator === 'string' ? query.indicator.slice(0, 200) : '';
  const country = typeof query.country === 'string' && /^[a-z]{3}$/i.test(query.country) ? query.country.toLowerCase() : '';
  return (
    <div className="bg-white min-h-screen">
      <DataExplorerClient key={`${indicator}:${country}`} initialIndicatorId={indicator} initialCountry={country} />
    </div>
  );
}
