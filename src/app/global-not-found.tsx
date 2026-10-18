import type { Metadata } from 'next';
import { Inter, Alexandria } from 'next/font/google';
import './(frontend)/globals.css';
import './(frontend)/style.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageProvider } from '@/components/LanguageProvider';
import NotFound from './(frontend)/not-found';

// A URL that matches no route at all. The app has two root layouts
// ((frontend) and (payload)), so there is no shared layout for Next to wrap a
// 404 in and it served its bare default page. This file renders the same 404
// as `notFound()` does inside (frontend), with the site header and footer, so
// a mistyped address still offers search and the main sections (p. 4, p. 208).
//
// It bypasses every layout, so it brings its own <html>, fonts and styles.
// Requires `experimental.globalNotFound: true` in next.config.ts.

const inter = Inter({ subsets: ['latin'], variable: '--font-en', display: 'swap' });
const alexandria = Alexandria({ subsets: ['arabic', 'latin'], variable: '--font-ar', display: 'swap' });

export const metadata: Metadata = {
  // p. 208 U01: "A 404 page uses Page Not Found". The root layout's title
  // template does not apply here, so the suffix is written out.
  title: 'Page Not Found | Enerqa',
  description: 'We could not find this page. Search the site or explore one of the main sections.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${alexandria.variable}`}>
      <body data-lang="en">
        <LanguageProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <Header />
          <main id="main">
            <NotFound />
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
