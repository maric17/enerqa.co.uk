import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * Conditional careers template (handoff pp. 4, 203-205): "Publish only with
 * actual approved recruitment content."
 *
 * The page used to carry invented copy (a "remote-first, globally distributed
 * team" of data scientists, a culture statement, an "Open Positions" box) and
 * an unapproved careers@ mailbox (p. 8 allows only approved contact details).
 * All of that has been removed. The route returns 404 until approved content is
 * supplied below; nothing on the site links here.
 */


export const metadata: Metadata = {
  title: 'Careers',
  alternates: { canonical: '/about/careers' },
};

export default async function CareersPage() {
  const payload = await getPayload({ config: configPromise });
  const content = await payload.findGlobal({
    slug: 'careers-config',
  });

  if (!content || !content.isApproved) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pt-[70px]">
      {/* Q01 Purpose and Scope - subordinate to About (p. 205) */}
      <section className="bg-[var(--color-dark)] text-white pt-32 pb-24 border-b border-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/60 mb-2">
              <Link href="/" className="hover:text-white transition-colors no-underline">Home</Link> /{' '}
              <Link href="/about" className="hover:text-white transition-colors no-underline">About</Link> /{' '}
              <span className="text-white" aria-current="page">Careers</span>
            </nav>
            <Typography variant="h1" className="text-white m-0">{content.heading}</Typography>
            <Typography variant="body" className="text-gray-300 text-xl leading-relaxed max-w-3xl mt-2">
              {content.intro}
            </Typography>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-16">
            {/* Q02 Main Content */}
            {content.sections?.map((s) => (
              <div key={s.heading} className="flex flex-col gap-6">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">{s.heading}</Typography>
                <p className="text-lg text-gray-700 m-0">{s.body}</p>
              </div>
            ))}

            {/* Q03 Next Action */}
            {content.nextAction && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 flex flex-col gap-4">
                <Typography variant="h2" className="text-[var(--color-dark)] m-0">{content.nextAction.heading}</Typography>
                <Link
                  href={content.nextAction.href}
                  className="self-start bg-[var(--color-secondary)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors"
                >
                  {content.nextAction.label}
                </Link>
                <p className="text-sm text-gray-600 m-0">{content.nextAction.privacyLine}</p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
