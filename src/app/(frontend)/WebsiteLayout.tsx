import { Inter, Alexandria } from 'next/font/google';
import "./globals.css";
import "./style.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { WebsiteAnalytics } from '@/components/WebsiteAnalytics';
import { COMPANY } from '@/lib/content/company';
import { siteText, type SiteLanguage } from '@/lib/i18n/site';

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

export function WebsiteLayout({
  children, language = 'en',
}: Readonly<{
  children: React.ReactNode;
  language?: SiteLanguage;
}>) {
  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} className={`${inter.variable} ${alexandria.variable}`}>
      {/* data-lang must be present on the FIRST paint: style.css hides the
          inactive language with `body[data-lang="en"] .ar`. */}
      <body data-lang={language}>
        <LanguageProvider>
          <SmoothScroll>
            <a className={language === 'ar' ? 'sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2' : 'skip-link'} href="#main">{siteText(language, 'Skip to content')}</a>
            <Header language={language} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'Enerqa',
                  legalName: COMPANY.name,
                  identifier: COMPANY.number,
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
            <Footer language={language} />
            {/* Q10: activation also needs approved policy text and a deployed self-hosted instance. */}
            {process.env.ANALYTICS_RELEASE_READY === 'true' && <WebsiteAnalytics scriptUrl={process.env.UMAMI_SCRIPT_URL} websiteId={process.env.UMAMI_WEBSITE_ID} />}
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
