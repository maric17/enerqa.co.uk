import React from 'react';
import DataExplorerClient from './DataExplorerClient';

export const metadata = {
  title: 'Data Explorer | Enerqa',
  description: 'Explore Gapminder data and visualize trends.',
};

export default function DataExplorerPage() {
  return (
    <main className="bg-white min-h-screen">
      <DataExplorerClient />
    </main>
  );
}
