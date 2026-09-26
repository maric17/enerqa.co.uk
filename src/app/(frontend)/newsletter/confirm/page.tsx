import React from 'react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { Metadata } from 'next';

// p. 4: a transactional state (reached after a successful signup), not a menu
// page, so it is kept out of search results. The layout appends " | Enerqa".
export const metadata: Metadata = {
  title: 'Subscription Confirmed',
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmPage() {
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              Subscription Confirmed
            </Typography>
            <p className="text-gray-500 mt-4">Thank you for subscribing to the Enerqa newsletter.</p>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-700 text-center">
            {/* p. 228: no delivery promise. The signup is saved for staff; no
                newsletter is sent automatically (there is no email adapter). */}
            <p className="text-sm mt-4 text-gray-500">
              Changed your mind? You can <Link href="/newsletter/unsubscribe" className="underline">unsubscribe at any time</Link>.
            </p>
            <div className="mt-8">
              <Link href="/" className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded hover:bg-opacity-90 transition-colors">
                Return to Homepage
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
