import React, { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { AIResponse } from './AIResponse';
import { Search } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - Enerqa',
  robots: {
    index: false,
    follow: false,
  },
};

const SITE_INDEX = [
  { title: 'Home', url: '/' },
  { title: 'About', url: '/about' },
  { title: 'Data Portal', url: '/data-portal' },
  { title: 'Datasets', url: '/data-portal/datasets' },
  { title: 'Tools', url: '/tools' },
  { title: 'Knowledge Hub', url: '/knowledge-hub' },
  { title: 'Contact', url: '/contact' },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q || '';
  
  const siteResults = q.trim() 
    ? SITE_INDEX.filter(item => item.title.toLowerCase().includes(q.trim().toLowerCase()))
    : [];

  let cmsResults: { title: string; url: string; excerpt?: string; type: string }[] = [];

  if (q.trim()) {
    const payload = await getPayload({ config: configPromise });
    
    // Query collections
    const [publicationsReq, toolsReq, datasetsReq] = await Promise.all([
      payload.find({
        collection: 'publications',
        where: { or: [{ title: { like: q } }, { excerpt: { like: q } }] },
      }),
      payload.find({
        collection: 'tools',
        where: { or: [{ title: { like: q } }, { desc: { like: q } }] },
      }),
      payload.find({
        collection: 'datasets',
        where: { or: [{ title: { like: q } }, { description: { like: q } }] },
      }),
    ]);

    // Format results

    const publications = publicationsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: '/knowledge-hub',
      excerpt: doc.excerpt ? String(doc.excerpt) : undefined,
      type: 'Publication'
    }));

    const tools = toolsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: `/tools/${doc.slug}`,
      excerpt: doc.desc ? String(doc.desc) : undefined,
      type: 'Tool'
    }));

    const datasets = datasetsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: `/data-portal/datasets/${doc.slug}`,
      excerpt: doc.description ? String(doc.description) : undefined,
      type: 'Dataset'
    }));

    cmsResults = [...publications, ...tools, ...datasets];
  }

  // Combine results
  const allResults = [...siteResults.map(s => ({ ...s, excerpt: 'Site Page', type: 'Page' })), ...cmsResults];

  return (
    <div className="bg-[var(--color-paper)] min-h-screen pt-[70px]">
      <section className="bg-[var(--color-dark)] text-white py-20 border-b border-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <Typography variant="h1" className="text-white m-0">
              Ask and Explore
            </Typography>
            
            {/* AI01 Ask and Explore (Editable Query) */}
            <form action="/search" method="GET" className="relative w-full max-w-2xl mt-4">
              <input 
                type="text" 
                name="q" 
                defaultValue={q} 
                placeholder="Ask a question or search for data..."
                className="w-full px-6 py-4 rounded-full text-[var(--color-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg pr-14"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </Container>
      </section>

      <Section theme="light">
        <Container>
          <div className="max-w-4xl mx-auto py-12 flex flex-col gap-12">
            
            {q.trim() !== '' && (
              <>
                {/* AI02 Answer and Sources */}
                <div className="flex flex-col gap-4">
                  <Suspense fallback={
                    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl animate-pulse">
                      <div className="h-6 bg-blue-200 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                    </div>
                  }>
                    <AIResponse query={q} context={allResults} />
                  </Suspense>
                </div>

                {/* AI03 Relevant Enerqa Content */}
                <div className="flex flex-col gap-6">
                  <Typography variant="h2" className="text-[var(--color-dark)] m-0">
                    Relevant Enerqa Content
                  </Typography>

                  {allResults.length === 0 ? (
                    <div className="text-gray-500 bg-gray-50 p-8 rounded-xl border border-gray-200">
                      No matches found for &quot;{q}&quot; — try a different term.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {allResults.map((item, idx) => (
                        <Link 
                          key={item.url + idx} 
                          href={item.url} 
                          className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Typography variant="h4" className="text-[var(--color-dark)] m-0 group-hover:text-[var(--color-primary)] transition-colors">{item.title}</Typography>
                            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                          </div>
                          {item.excerpt && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.excerpt}</p>}
                          <div className="text-[var(--color-secondary)] text-xs font-semibold">Navigate to {item.type}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </Container>
      </Section>
    </div>
  );
}
