import type { Metadata } from "next";
import "./globals.css";
import "./style.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "enerQA - Engineering Sustainable Decisions",
  description: "Climate, Energy & ESG Advisory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <LanguageProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <Header />
          <main id="main">
            {children}
          </main>
          <ScrollReveal />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
