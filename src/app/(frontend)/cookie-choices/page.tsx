import React from 'react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Section } from '@/components/ui/Section';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Choices - Enerqa',
};

export default function CookiesPage() {
  return (
    <div className="bg-white min-h-screen pt-[70px]">
      <section className="bg-gray-50 border-b border-gray-200 py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Typography variant="h1" className="text-[var(--color-dark)] m-0">
              Cookie Choices
            </Typography>
            <p className="text-gray-500 mt-4">Manage how Enerqa uses cookies on your device.</p>
          </div>
        </Container>
      </section>

      <Section theme="light" className="py-20">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">
            <h2>What are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            </p>

            <h2>How We Use Cookies</h2>
            <p>Enerqa uses cookies for the following purposes:</p>
            <ul>
              <li><strong>Strictly Necessary Cookies:</strong> These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site (e.g., Payload CMS admin panels or protected data portals).</li>
              <li><strong>Performance & Analytics Cookies:</strong> These cookies collect information about how you use our website, like which pages you visited and which links you clicked on. None of this information can be used to identify you. It is all aggregated and, therefore, anonymized.</li>
              <li><strong>Functionality Cookies:</strong> These cookies allow our website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features.</li>
            </ul>

            <h2>Managing Your Preferences</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager that appears upon your first visit to our site.
            </p>
            <p>
              In addition, most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
