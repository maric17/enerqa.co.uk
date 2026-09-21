import React from 'react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement - Enerqa',
};

export default function AccessibilityPage() {
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              Accessibility Statement
            </Typography>
            <p className="text-gray-500 mt-4">Our commitment to digital inclusion.</p>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">
            <h2>Our Commitment</h2>
            <p>
              Enerqa is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to our website, Data Portal, and interactive tools.
            </p>

            <h2>Conformance Status</h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. 
            </p>
            <p>
              Enerqa is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard. Specifically, some of our complex, third-party data visualization embeds (such as interactive Tableau or PowerBI dashboards) may lack full screen-reader support natively. We are actively working with our vendors to improve this.
            </p>

            <h2>Feedback and Contact</h2>
            <p>
              We welcome your feedback on the accessibility of the Enerqa platform. Please let us know if you encounter accessibility barriers:
            </p>
            <ul>
              <li>E-mail: accessibility@enerqa.co.uk</li>
              <li>Or use our <Link href="/contact">Contact Form</Link> to reach out directly.</li>
            </ul>
            <p>
              We try to respond to feedback within 5 business days.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
