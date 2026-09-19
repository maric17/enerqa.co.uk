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

export const metadata: Metadata = {
  // `template` appends " | Enerqa" to whatever title a child page sets, so each page
  // only declares its own unique part. `default` is used when a page sets no title.
  // Handoff p. 227 requires a unique descriptive title on every substantive page.
  title: {
    default: "enerQA - Engineering Sustainable Decisions",
    template: "%s | Enerqa",
  },
  description: "Climate, Energy & ESG Advisory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${alexandria.variable}`}>
      <body>
        <LanguageProvider>
          <SmoothScroll>
            <a className="skip-link" href="#main">Skip to content</a>
            <Header />
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
