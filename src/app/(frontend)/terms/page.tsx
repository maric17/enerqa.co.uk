import React from 'react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use - Enerqa',
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              Terms of Use
            </Typography>
            <p className="text-gray-500 mt-4">Last Updated: September 2026</p>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, including our Data Portal, Knowledge Hub, and proprietary Tools, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
            
            <h2>2. Intellectual Property Rights</h2>
            <p>
              The Site and its original content, features, datasets, analysis, and functionality are owned by Enerqa and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p>
              Data procured from third parties and published on our platform remains the property of the original provider, and must be attributed appropriately as outlined in our <Link href="/data-portal/sources">Sources and Methodology</Link> guidelines.
            </p>

            <h2>3. Use of Data and Tools</h2>
            <p>
              Unless otherwise explicitly stated under a separate Master Services Agreement (MSA) or specific licensing tier:
            </p>
            <ul>
              <li>You may not reproduce, distribute, or publicly display our datasets for commercial gain without explicit written permission.</li>
              <li>You may not attempt to reverse engineer, scrape, or extract source code, algorithms, or bulk data from our interactive tools.</li>
              <li>You must cite Enerqa when referencing insights or visualizations derived from our platform in public reports or presentations.</li>
            </ul>

            <h2>4. Disclaimer of Warranties</h2>
            <p>
              The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
              Enerqa reserves the right, in its sole discretion, to change the Terms under which this website is offered. The most current version of the Terms will supersede all previous versions.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
