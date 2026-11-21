import { siteText, type SiteLanguage } from '@/lib/i18n/site';
import React from 'react';
import Link from '@/components/ui/SiteLink';
import { ArrowRight, Globe, BarChart2, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/ui/PageHero';


// p. 227: unique title and description. The description is A01's opening
// sentence (p. 169) rather than a paraphrase of it. `absolute`, because the
// layout's " | Enerqa" suffix would read "About Enerqa | Enerqa".


export function AboutContent({ language = 'en' }: { language?: SiteLanguage }) {
  const t = (text: string) => siteText(language, text);
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)]">

      {/* A01 About Enerqa */}
      <PageHero
        title={t("About Enerqa")}
        language={language}
        imageUrl="/images/about_banner_people.jpg"
        breadcrumbs={
          <>
            <Link href={language === 'ar' ? '/ar' : '/'} className="text-white/80 hover:text-white transition-colors no-underline">{t("Home")}</Link> / <span className="text-white" aria-current="page">{t("About")}</span>
          </>
        }
      />

      <section id="overview" className="bg-[var(--paper)] pt-12 pb-8 border-b border-[var(--line)] shadow-sm scroll-mt-20">
        <Container>
          <div className="max-w-4xl mb-8">
            <p className="text-[18px] md:text-[22px] leading-[1.6] text-[var(--ink-soft)] font-light m-0 whitespace-pre-line">
              {t("Enerqa is a multidisciplinary project-development and consultancy company working across climate action and carbon management, energy systems and transition, environment, nature and circularity, and sustainable business, ESG and finance. Our role is to connect technical understanding with the commercial, environmental and institutional decisions needed to develop practical initiatives.")}
            </p>
          </div>
        </Container>
      </section>

      {/* A02 Our Approach */}
      <section id="approach" className="py-20 scroll-mt-20">
        <Container>
          {/* p. 169 A02 is two paragraphs and one link. The side panel that
              sat here ("Evidence & Assessment", "Structure & Delivery",
              "Integration") was not in the spec and has been removed. */}
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">{t("Our Approach")}</h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="mb-6 leading-relaxed">
                {t("An idea becomes a viable initiative through evidence, careful assessment and a clear delivery structure. Technical studies, business and financial modelling, environmental and social considerations, and implementation requirements need to inform one another.")}
              </p>
              <p className="mb-8 leading-relaxed">
                {t("Engagement can begin with a new opportunity, an existing concept or a specific question within the project cycle. The scope is shaped around the decisions ahead and the work already completed.")}
              </p>
              <Link href="/project-development" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-6 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
                {t("Project Development and Lifecycle Support")} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* A03 Our Domains */}
      <section id="domains" className="py-20 bg-[var(--color-paper-alt)] border-y border-gray-200 scroll-mt-20">
        <Container>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">{t("Our Domains")}</h2>
            <p className="text-lg text-gray-600">{t("Explore the four interconnected domains that organise Enerqa's work.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/domains/climate-action-carbon-management" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <Globe className="w-10 h-10 text-[var(--color-primary)] mb-6" aria-hidden="true" />
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">{t("Climate Action & Carbon Management")}</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                {t("Explore Domain")} <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </Link>
            <Link href="/domains/energy-systems-transition" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <div className="w-10 h-10 text-[var(--color-primary)] mb-6 flex items-center" aria-hidden="true">⚡</div>
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">{t("Energy Systems & Transition")}</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                {t("Explore Domain")} <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </Link>
            <Link href="/domains/environment-nature-circularity" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <div className="w-10 h-10 text-[var(--color-primary)] mb-6 flex items-center" aria-hidden="true">🌱</div>
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">{t("Environment, Nature & Circularity")}</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                {t("Explore Domain")} <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </Link>
            <Link href="/domains/sustainable-business-esg-finance" className="group bg-white p-8 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <BarChart2 className="w-10 h-10 text-[var(--color-primary)] mb-6" aria-hidden="true" />
              <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-3">{t("Sustainable Business, ESG & Finance")}</h3>
              <div className="flex items-center text-[var(--color-secondary)] text-sm font-medium mt-4">
                {t("Explore Domain")} <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* A04 People and Organisation */}
      <section id="people" className="py-20 scroll-mt-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">{t("People and Organisation")}</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {t("Our multidisciplinary approach brings relevant technical, environmental, climate, energy and business perspectives into the development process.")}
            </p>
            {/* Note: Team member cards omitted until approved profiles are provided per the specification. */}
          </div>
        </Container>
      </section>

      {/* A05 Connect with Enerqa */}
      <section id="connect" className="py-20 bg-[var(--color-dark)] text-white scroll-mt-20">
        <Container>
          <div className="bg-[var(--color-dark-soft)] rounded-2xl p-10 md:p-16 text-center border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">{t("Connect with Enerqa")}</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              {t("Contact us to discuss an idea, a technical question or a project-development need.")}
            </p>
            <div className="flex flex-col items-center gap-6">
              <a href="mailto:info@enerqa.co.uk" className="flex items-center gap-2 text-[var(--color-primary)] hover:text-white transition-colors text-lg font-medium">
                <Mail className="w-5 h-5" aria-hidden="true" /> info@enerqa.co.uk
              </a>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link href={language === 'ar' ? '/ar/contact' : '/contact'} className="bg-[var(--color-primary)] text-[var(--color-dark)] font-bold py-3 px-8 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
                  {t("Contact Enerqa")}
                </Link>
                <Link href={language === 'ar' ? '/ar/contact?intent=project' : '/contact?intent=project'} className="bg-transparent border border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-[var(--color-dark)] transition-colors">
                  {t("Discuss Your Project")}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
