import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { RichText } from '@payloadcms/richtext-lexical/react';

// p. 171: Only these four specific static paths are recognized as policies
const VALID_POLICIES = ['privacy', 'terms', 'cookie-choices', 'accessibility'];

export async function generateStaticParams() {
  return VALID_POLICIES.map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  if (!VALID_POLICIES.includes(resolvedParams.policy)) return {};
  
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'policies',
    where: { slug: { equals: resolvedParams.policy } },
    limit: 1,
  });

  const policy = docs[0];
  if (!policy) return {};

  return {
    title: policy.title,
    alternates: { canonical: `/${resolvedParams.policy}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const resolvedParams = await params;
  
  // A09: Strict checking of policy slugs
  if (!VALID_POLICIES.includes(resolvedParams.policy)) {
    notFound();
  }

  const payload = await getPayload({ config: configPromise });
  
  // A14: Fetch all policies for the right-column navigation
  const { docs: allPolicies } = await payload.find({
    collection: 'policies',
    where: { slug: { in: VALID_POLICIES } },
    sort: 'title',
    limit: 10,
  });

  const currentPolicy = allPolicies.find((p) => p.slug === resolvedParams.policy);

  if (!currentPolicy) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      <section className="bg-white border-b border-gray-200 py-16 md:py-24">
        <Container>
          {/* A10: Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-[var(--color-dark)] transition-colors no-underline">Home</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-[var(--color-dark)]" aria-current="page">{currentPolicy.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            <main className="flex-1 lg:max-w-[720px]">
              {/* A11: Generic title */}
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] mb-6">
                {currentPolicy.title}
              </h1>
              
              {/* A12: Updated At */}
              <p className="text-gray-500 mb-12 text-sm font-medium">
                Last updated:{' '}
                <time dateTime={currentPolicy.updatedAt}>
                  {new Date(currentPolicy.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </p>

              {/* A13: RichText body */}
              <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-dark)] prose-headings:font-bold prose-a:text-[var(--color-secondary)] prose-a:no-underline hover:prose-a:underline">
                {currentPolicy.content && <RichText data={currentPolicy.content} />}
              </div>
            </main>

            {/* A14: Right-column navigation to sibling policies */}
            <aside className="lg:w-[320px] shrink-0">
              <div className="sticky top-[104px] bg-[var(--color-paper-alt)] rounded-2xl p-8 border border-gray-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
                  Legal & Policies
                </h2>
                <nav aria-label="Policies navigation">
                  <ul className="flex flex-col gap-4 m-0 p-0 list-none">
                    {allPolicies.map((policy) => {
                      const isActive = policy.slug === currentPolicy.slug;
                      return (
                        <li key={policy.id}>
                          <Link
                            href={`/${policy.slug}`}
                            className={`block no-underline font-medium transition-colors ${
                              isActive 
                                ? 'text-[var(--color-dark)] font-bold' 
                                : 'text-gray-600 hover:text-[var(--color-dark)]'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {policy.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
