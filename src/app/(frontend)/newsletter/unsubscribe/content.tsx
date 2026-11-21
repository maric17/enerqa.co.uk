import React from 'react';
import { siteText, type SiteLanguage } from '@/lib/i18n/site';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Metadata } from 'next';
import { UnsubscribeForm } from './UnsubscribeForm';

// p. 4: a transactional state, not a primary menu page - so it stays out of
// search results. The root layout's template appends " | Enerqa".
export const metadata: Metadata = {
  title: 'Unsubscribe from the Newsletter',
  robots: { index: false, follow: false },
};

export function NewsletterUnsubscribeContent({ language = 'en' }: { language?: SiteLanguage } = {}) {
  const t = (key: string) => siteText(language, key);
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              {t("Unsubscribe")}
            </Typography>
            <p className="text-gray-500 mt-4">{t("Stop receiving the Enerqa newsletter.")}</p>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <UnsubscribeForm language={language} />
          </div>
        </Container>
      </Section>
    </div>
  );
}
