import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { Container } from '@/components/ui/Container';
import { getPrivacyHref } from '@/lib/policies';
import { PageHero } from '@/components/ui/PageHero';
import { prefillFromSearchParams, type ContactChoices } from '@/lib/forms/contact';
import { loadContactChoices } from '@/lib/forms/contactChoices';
import { ContactForm } from './ContactForm';

// p. 227: unique title and description. Moved here from the deleted
// pass-through contact/layout.tsx. The description is F01's own copy (p. 198).
// `absolute`: the title already names Enerqa, so the layout's " | Enerqa"
// suffix would double it. The canonical drops ?intent=/?tool= variants.
export const metadata: Metadata = {
  title: { absolute: 'Contact Enerqa' },
  description:
    'Share an idea, a project opportunity or a question about Enerqa’s work. A complete project brief is not required to begin a conversation.',
  alternates: { canonical: '/contact' },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;

  // The optional selects come from the CMS. If it cannot be reached the form
  // still renders (Name, Email, Enquiry Type and Message need no CMS data);
  // submitting then shows the F04 error, which names info@ as the fallback.
  let choices: ContactChoices = { domains: [], industries: [], tools: [] };
  try {
    const { domains, industries, tools } = await loadContactChoices(await getPayload({ config: configPromise }));
    choices = { domains, industries, tools };
  } catch (error) {
    console.error('Contact form choices unavailable:', error);
  }

  // p. 198 F02: `?intent=`, `?tool=`, `?domain=` and `?industry=` preselect
  // the matching fields, which stay editable.
  const prefill = prefillFromSearchParams(params, choices);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)]">
      {/* F01 Contact Enerqa (p. 198) */}
      <PageHero
        title="Contact Enerqa"
        imageUrl="/images/contact_banner_people.jpg"
        breadcrumbs={
          <>
            <Link href="/" className="text-white/80 hover:text-white transition-colors no-underline">Home</Link> / <span className="en text-white" aria-current="page">Contact</span>
          </>
        }
      />

      <section className="bg-[var(--paper)] pt-12 pb-8 border-b border-[var(--line)] shadow-sm">
        <Container>
          <div className="max-w-4xl mb-8">
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light m-0 whitespace-pre-line">
              Share an idea, a project opportunity or a question about Enerqa’s work. A complete project brief is not required to begin a conversation.
            </p>
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light mt-6">
              Email:{' '}
              <a href="mailto:info@enerqa.co.uk" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-dark)] transition-colors">
                info@enerqa.co.uk
              </a>
            </p>
            {/* p. 228: internal links point at the canonical lifecycle page, not the retired /projects. */}
            <Link href="/project-development" className="mt-6 text-[var(--color-primary)] font-bold text-sm hover:underline inline-flex items-center gap-1">
              Learn about our approach <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {/* F02 Tell Us About Your Enquiry, F03 Send Your Enquiry, F04 states (p. 198) */}
      <section className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-dark)] mb-8">Tell Us About Your Enquiry</h2>
            <ContactForm choices={choices} prefill={prefill} privacyHref={await getPrivacyHref()} />
          </div>
        </Container>
      </section>
    </div>
  );
}
