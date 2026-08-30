import { resolveMediaUrl } from "@/lib/utils";
import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

const SITE_INDEX = [
  { title:'Home', url:'/' },
  { title:'About', url:'/about' },
  { title:'Domains & Services', url:'/services' },
  { title:'Projects', url:'/projects' },
  { title:'Knowledge Hub', url:'/knowledge-hub' },
  { title:'Insights', url:'/insights' },
  { title:'Team', url:'/team' },
  { title:'Contact', url:'/contact' },
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
    const [insightsReq, publicationsReq, toolsReq, projectsReq] = await Promise.all([
      payload.find({
        collection: 'insights',
        where: { or: [{ title: { like: q } }, { excerpt: { like: q } }] },
      }),
      payload.find({
        collection: 'publications',
        where: { or: [{ title: { like: q } }, { excerpt: { like: q } }] },
      }),
      payload.find({
        collection: 'tools',
        where: { or: [{ title: { like: q } }, { desc: { like: q } }] },
      }),
      payload.find({
        collection: 'projects',
        where: { or: [{ title: { like: q } }, { description: { like: q } }] },
      }),
    ]);

    // Format results
    const insights = insightsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: '/insights',
      excerpt: doc.excerpt ? String(doc.excerpt) : undefined,
      type: 'Insight'
    }));

    const publications = publicationsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: '/knowledge-hub',
      excerpt: doc.excerpt ? String(doc.excerpt) : undefined,
      type: 'Publication'
    }));

    const tools = toolsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: '/knowledge-hub',
      excerpt: doc.desc ? String(doc.desc) : undefined,
      type: 'Tool'
    }));

    const projects = projectsReq.docs.map((doc) => ({
      title: String(doc.title),
      url: '/projects',
      excerpt: doc.description ? String(doc.description) : undefined,
      type: 'Project'
    }));

    cmsResults = [...insights, ...publications, ...tools, ...projects];
  }

  // Combine results
  const allResults = [...siteResults.map(s => ({ ...s, excerpt: 'Site Page', type: 'Page' })), ...cmsResults];

  return (
    <>
      <section className="relative w-full h-[45vh] min-h-[300px] flex items-center justify-center bg-ink text-white overflow-hidden py-[100px]">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-[url('/assets/images/hero-bg.jpg')]"></div>
        <div className="hero-insights-overlay z-10 opacity-80"></div>
        
        <Container className="w-full relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12 h-full justify-center">
          <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
            <Link href="/" className="text-white/60 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white">Search</span>
          </div>
          <Typography variant="h1" className="text-white m-0 max-w-[900px]">
            <span className="en block">Search Results</span>
          </Typography>
        </Container>
      </section>

      <Section theme="light">
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <Typography variant="h3" className="mb-8">
              {q ? `Showing results for "${q}"` : "Enter a search term to find what you are looking for."}
            </Typography>

            {q.trim() !== '' && allResults.length === 0 ? (
              <div className="text-ink-soft text-lg bg-black/5 p-8 rounded-2xl">
                No matches found for &quot;{q}&quot; — try a different term.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allResults.map((item, idx) => (
                  <Link 
                    key={item.url + idx} 
                    href={item.url} 
                    className="block p-6 bg-white border border-black/5 rounded-xl hover:shadow-md hover:border-black/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Typography variant="h4" className="text-ink m-0 group-hover:text-primary transition-colors">{item.title}</Typography>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-ink-soft bg-black/5 px-2 py-1 rounded">{item.type}</span>
                    </div>
                    {item.excerpt && <p className="text-ink-soft text-sm mb-3 line-clamp-2">{item.excerpt}</p>}
                    <div className="text-ink-soft text-xs font-semibold">Navigate to {item.type}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
