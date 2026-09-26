import type { Metadata } from "next";
import { Inter, Alexandria } from 'next/font/google';
import "./globals.css";
import "./style.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SmoothScroll } from "@/components/animations/SmoothScroll";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-en',
  display: 'swap',
});

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-ar',
  display: 'swap',
});

// Production origin - the same source robots.ts and sitemap.ts use.
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://enerqa.co.uk';

export const metadata: Metadata = {
  // Without this every relative canonical (`alternates.canonical: '/about'`)
  // rendered as a relative URL.
  metadataBase: new URL(SITE_URL),
  // `template` appends " | Enerqa" to whatever title a child page sets, so each page
  // only declares its own unique part. `default` is used when a page sets no title.
  // Handoff p. 227 requires a unique descriptive title on every substantive page.
  title: {
    default: "Enerqa",
    template: "%s | Enerqa",
  },
  // The homepage H01 narrative (p. 13) - the handoff's own summary of the site.
  // Replaces the legacy "Climate, Energy & ESG Advisory".
  description:
    "From an initial idea to feasibility, finance and implementation, Enerqa develops projects across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance.",
  // No `alternates.languages` here: it sent hreflang en AND ar (both to the
  // homepage) on every page without its own metadata, but no Arabic page exists.
  // p. 227: reciprocal hreflang only for real corresponding pages.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${alexandria.variable}`}>
      {/* data-lang must be present on the FIRST paint: style.css hides the
          inactive language with `body[data-lang="en"] .ar`. */}
      <body data-lang="en">
        <LanguageProvider>
          <SmoothScroll>
            <a className="skip-link" href="#main">Skip to content</a>
            <Header />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Enerqa',
                  url: SITE_URL,
                  // Was /images/logo.png, which does not exist (404).
                  logo: `${SITE_URL}/images/color-logo.png`,
                  // p. 227: verified fields only. LinkedIn is the one account the
                  // current enerqa.co.uk site links to; the twitter.com handle
                  // was unverified.
                  sameAs: ['https://www.linkedin.com/company/enerqa'],
                }),
              }}
            />
            <main id="main">
              {children}
            </main>
            <Footer />
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
