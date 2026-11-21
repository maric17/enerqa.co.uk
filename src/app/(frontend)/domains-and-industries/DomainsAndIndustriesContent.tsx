import React from 'react';
import Link from '@/components/ui/SiteLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Container } from '@/components/ui/Container';
import { getArabicDomain } from '@/lib/i18n/domains';
import { siteText, type SiteLanguage } from '@/lib/i18n/site';

export function DomainsAndIndustriesContent({ language = 'en' }: { language?: SiteLanguage }) {
  const t = (text: string) => siteText(language, text);
  const climate = language === 'ar' ? getArabicDomain('climate-action-carbon-management') : undefined;
  const energy = language === 'ar' ? getArabicDomain('energy-systems-transition') : undefined;
  const environment = language === 'ar' ? getArabicDomain('environment-nature-circularity') : undefined;
  const business = language === 'ar' ? getArabicDomain('sustainable-business-esg-finance') : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">

      {/* O01 Domains and Industries */}
      <section className="py-20 bg-[var(--color-paper-alt)] border-b border-gray-200">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] mb-6">{t("Domains and Industries")}</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t("Enerqa's work is organised around four interconnected domains. Project development connects them, drawing on data, modelling, digital tools, MRV, research, institutional strengthening and capacity building wherever they add value.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#domains" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-6 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
                {t("Explore Domains")} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-4 h-4 rtl:rotate-180" />
              </a>
              <a href="#industries" className="inline-flex items-center gap-2 bg-white text-[var(--color-dark)] font-bold py-3 px-6 rounded-full border border-gray-300 hover:border-[var(--color-dark)] transition-colors">
                {t("Explore Industries")} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-4 h-4 rtl:rotate-180" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* O02 Our Domains */}
      <section id="domains" className="py-20 scroll-mt-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">{t("Our Domains")}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("Each domain brings together a distinct set of technical, environmental, commercial and investment questions. Select a domain to explore its full narrative, specific work areas and related knowledge, data and tools.")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* O02 1 */}
            <div className="bg-white p-8 md:p-10 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all flex flex-col h-full group">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">{t("01 / Climate")}</p>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-4">{climate?.title ?? "Climate Action & Carbon Management"}</h3>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed">{climate?.introduction.split("\n\n", 1)[0] ?? "Climate change action becomes credible when commitments are translated into practical programmes, measurable results and investable projects. The starting point may be a national climate target, a corporate decarbonisation ambition, a sectoral challenge or an individual project opportunity. In every case, the pathway must be grounded in reliable emissions data and a clear understanding of climate risks and priorities."}</p>
              <Link href="/domains/climate-action-carbon-management" className="text-[var(--color-secondary)] font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                {climate ? `استكشف مجال ${climate.title}` : "Explore Climate Action & Carbon Management"} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>

            {/* O02 2 */}
            <div className="bg-white p-8 md:p-10 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all flex flex-col h-full group">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">{t("02 / Energy")}</p>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-4">{energy?.title ?? "Energy Systems & Transition"}</h3>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed">{energy?.introduction.split("\n\n", 1)[0] ?? "The energy transition is reshaping how energy is produced, managed, financed and consumed. Governments, businesses and project developers must identify solutions that lower costs and emissions without compromising reliability, resilience or commercial performance."}</p>
              <Link href="/domains/energy-systems-transition" className="text-[var(--color-secondary)] font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                {energy ? `استكشف مجال ${energy.title}` : "Explore Energy Systems & Transition"} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>

            {/* O02 3 */}
            <div className="bg-white p-8 md:p-10 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all flex flex-col h-full group">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">{t("03 / Environment")}</p>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-4">{environment?.title ?? "Environment, Nature & Circularity"}</h3>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed">{environment?.introduction.split("\n\n", 1)[0] ?? "Projects and operations depend on healthy environmental, social and natural systems. Understanding that relationship early makes it possible to manage impacts, meet regulatory and safeguard requirements, reduce liabilities and improve project design."}</p>
              <Link href="/domains/environment-nature-circularity" className="text-[var(--color-secondary)] font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                {environment ? `استكشف مجال ${environment.title}` : "Explore Environment, Nature & Circularity"} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>

            {/* O02 4 */}
            <div className="bg-white p-8 md:p-10 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] hover:shadow-lg transition-all flex flex-col h-full group">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">{t("04 / Business")}</p>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors mb-4">{business?.title ?? "Sustainable Business, ESG & Finance"}</h3>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed">{business?.introduction.split("\n\n", 1)[0] ?? "Sustainability creates lasting value when it influences strategy, governance, investment and daily operations. ESG strategy and reporting therefore begin with understanding what is material to an organisation, where climate and ESG risks arise, how responsible supply chains are managed, and whether internal systems are ready to deliver and measure improvement."}</p>
              <Link href="/domains/sustainable-business-esg-finance" className="text-[var(--color-secondary)] font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                {business ? `استكشف مجال ${business.title}` : "Explore Sustainable Business, ESG & Finance"} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* O03 Industries We Work In */}
      <section id="industries" className="py-20 bg-[var(--color-paper-alt)] border-t border-gray-200 scroll-mt-20">
        <Container>
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">{t("Industries")}</h2>
            <p className="text-lg text-gray-600 max-w-3xl">{t("The same development discipline can be applied across different sectors, with the evidence, risks and delivery requirements adapted to the industry. Select an industry to explore the relevant domains and forms of support.")}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            {[
              { name: "Government, Regulators & Public Institutions", slug: "government-regulators-public-institutions" },
              { name: "Financial Institutions, Investors & Development Finance", slug: "financial-institutions-investors-development-finance" },
              { name: "Energy & Utilities", slug: "energy-utilities" },
              { name: "Oil, Gas & Petrochemicals", slug: "oil-gas-petrochemicals" },
              { name: "Industry, Manufacturing & Materials", slug: "industry-manufacturing-materials" },
              { name: "Infrastructure, Real Estate & Industrial Zones", slug: "infrastructure-real-estate-industrial-zones" },
              { name: "Transport, Logistics & Mobility", slug: "transport-logistics-mobility" },
              { name: "Water, Waste & Circular Economy", slug: "water-waste-circular-economy" },
              { name: "Agriculture, Food & Aquaculture", slug: "agriculture-food-aquaculture" },
              { name: "Mining & Natural Resources", slug: "mining-natural-resources" },
              { name: "Tourism, Hospitality & Destinations", slug: "tourism-hospitality-destinations" },
              { name: "Technology, Telecoms & Data Infrastructure", slug: "technology-telecoms-data-infrastructure" },
              { name: "Healthcare, Education & Institutional Estates", slug: "healthcare-education-institutional-estates" }
            ].map((industry) => (
              <Link
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group flex justify-between items-center p-6 md:p-8 hover:bg-[var(--color-paper-alt)] transition-colors"
              >
                <span className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-secondary)] transition-colors">{t(industry.name)}</span>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-secondary)] group-hover:text-white transition-all text-gray-500">
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* O04 Project Development and Lifecycle Support */}
      <section className="py-24 bg-[var(--color-dark)] text-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t("Project Development and Lifecycle Support")}</h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              {t("A project can begin with a need, an idea, an existing study or an operating asset. Concept development, feasibility, financing, delivery and performance measurement connect technical analysis with the decisions required at each stage.")}
            </p>
            <Link href="/project-development" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-dark)] font-bold py-4 px-8 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
              {t("Explore Our Project Development Approach")} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </section>

      {/* O05 Discuss Your Project */}
      <section className="py-20 bg-white">
        <Container>
          <div className="bg-[var(--color-paper-alt)] rounded-2xl p-10 md:p-16 text-center border border-gray-200">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">{t("Discuss Your Project")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t("Explore how the relevant domain and industry perspective can help move your opportunity forward.")}
            </p>
            <Link href="/contact?intent=project" className="inline-block bg-[var(--color-secondary)] text-white font-bold py-4 px-10 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors shadow-md">
              {t("Discuss Your Project")}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
