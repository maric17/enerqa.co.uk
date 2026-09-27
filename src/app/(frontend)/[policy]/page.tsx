import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { CookieChoicesControl } from '@/components/CookieChoicesControl';
import { POLICY_PAGES } from '@/collections/Policies';
import { getPublishedPolicies, getPublishedPolicyLinks } from '@/lib/policies';

type Props = { params: Promise<{ policy: string }> };

// p. 208 U03: "Privacy and accessibility provide a working contact route."
// info@enerqa.co.uk is the approved address named on p. 8.
const CONTACT_LINE: Partial<Record<string, string>> = {
  privacy: 'To ask about your personal data or this notice',
  accessibility: 'To report an accessibility problem',
};

// p. 208 U02: only approved text is published. An unapproved policy has no
// page (404) and no footer link, rather than a placeholder (p. 4, 225).
async function findApproved(slug: string) {
  const page = POLICY_PAGES.find((p) => p.slug === slug);
  if (!page) return null;
  const doc = (await getPublishedPolicies()).find((d) => d.slug === slug);
  return doc ? { title: page.title, doc } : null;
}

export async function generateStaticParams() {
  return (await getPublishedPolicies()).map((d) => ({ policy: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { policy } = await params;
  const found = await findApproved(policy);
  if (!found) return {};
  return {
    title: found.title,
    alternates: { canonical: `/${policy}` },
  };
}

export default async function PolicyPage({ params }: Props) {
  const { policy } = await params;
  const found = await findApproved(policy);
  if (!found) notFound();

  const { title, doc } = found;
  const siblings = await getPublishedPolicyLinks();
  // The approval date is when this text took effect; later admin saves (a
  // typo fix, a re-tick) must not look like a new version.
  const updated = doc.approvedOn ?? doc.updatedAt;
  const contactLine = CONTACT_LINE[policy];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">
      <section className="bg-white border-b border-gray-200 py-16 md:py-24">
        <Container>
          {/* The page's only breadcrumb: FooterBreadcrumbs steps aside here (OWN_TRAIL_ROUTES). */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium text-gray-500">
            <ol className="flex flex-wrap items-center gap-2 list-none p-0 m-0">
              <li>
                <Link href="/" className="hover:text-[var(--color-dark)] transition-colors no-underline">Home</Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <span className="text-[var(--color-dark)]" aria-current="page">{title}</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            <div className="flex-1 lg:max-w-[720px]">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] mb-6">{title}</h1>

              <p className="text-gray-500 mb-12 text-sm font-medium">
                Last updated:{' '}
                <time dateTime={updated}>
                  {new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </p>

              <div className="prose prose-lg max-w-none prose-headings:text-[var(--color-dark)] prose-headings:font-bold prose-a:text-[var(--color-secondary)] prose-a:no-underline hover:prose-a:underline">
                {doc.content && <RichText data={doc.content} />}
              </div>

              {/* p. 208 U03: the control changes the consent every embed reads. */}
              {policy === 'cookie-choices' && (
                <div className="mt-12">
                  <CookieChoicesControl />
                </div>
              )}

              {contactLine && (
                <section aria-labelledby="policy-contact" className="mt-12 p-6 md:p-8 rounded-2xl border border-gray-200 bg-white">
                  <h2 id="policy-contact" className="text-xl font-bold text-[var(--color-dark)] m-0 mb-2">Contact</h2>
                  <p className="m-0 text-gray-700">
                    {contactLine}, email{' '}
                    <a href={`mailto:info@enerqa.co.uk?subject=${encodeURIComponent(title)}`} className="font-semibold text-ink underline">
                      info@enerqa.co.uk
                    </a>{' '}
                    or use the{' '}
                    <Link href="/contact" className="font-semibold text-ink underline">contact form</Link>.
                  </p>
                </section>
              )}
            </div>

            {/* Sibling policies, approved ones only - never a link to a 404. */}
            {siblings.length > 1 && (
              <aside className="lg:w-[320px] shrink-0">
                <div className="sticky top-[104px] bg-[var(--color-paper-alt)] rounded-2xl p-8 border border-gray-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Legal & Policies</h2>
                  <nav aria-label="Policies">
                    <ul className="flex flex-col gap-4 m-0 p-0 list-none">
                      {siblings.map((link) => {
                        const isActive = link.href === `/${policy}`;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={`block no-underline font-medium transition-colors ${
                                isActive ? 'text-[var(--color-dark)] font-bold' : 'text-gray-600 hover:text-[var(--color-dark)]'
                              }`}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
