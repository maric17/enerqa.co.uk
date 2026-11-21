import copy from '@/lib/i18n/public-page-copy.json';
import { publicCopy, type SiteLanguage } from '@/lib/i18n/publicCopy';
import React from 'react';
import type { Metadata } from 'next';

// Handoff p. 227: this stays the ONE canonical lifecycle page - every
// contextual lifecycle module elsewhere on the site points back here, so the
// canonical URL matters more than usual.
export const metadata: Metadata = {
  title: 'Project Development and Lifecycle Support',
  description:
    'From needs assessment and feasibility to finance, delivery and MRV - the ten-stage lifecycle Enerqa applies across climate, energy, environment and ESG projects.',
  alternates: { canonical: '/project-development' },
};
import Link from '@/components/ui/SiteLink';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProjectLifecycle } from '@/components/shared/ProjectLifecycle';

export function ProjectDevelopmentContent({ language = 'en' }: { language?: SiteLanguage } = {}) {
  const t = (text: string) => publicCopy(language, copy, text);
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-paper)] pt-[70px]">

      {/* P01 Project Development and Lifecycle Support */}
      <section className="py-20 bg-[var(--color-dark)] text-white border-b border-gray-800">
        <Container>
          {/* Keep title, lifecycle and narrative in this order on every screen. */}
          <div className="mx-auto flex max-w-4xl flex-col gap-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white text-center">{t("Project Development and Lifecycle Support")}</h1>
            <nav
              aria-label={t("Project lifecycle stages")}
              className="w-full rounded-2xl bg-paper-alt p-6 text-ink lg:p-0"
            >
              <ProjectLifecycle language={language} />
            </nav>
            <div className="prose prose-lg prose-invert max-w-none text-gray-300">
              <p className="mb-6 leading-relaxed">
                {t("Projects are better positioned for investment and successful delivery when the underlying opportunity is clearly defined, thoroughly tested and properly structured. An initial need or idea must be developed into a coherent concept, assessed for technical, commercial, financial, environmental and social feasibility, and translated into a credible business and delivery model.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("Project development is the common approach that connects Enerqa's work across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance. It brings the different dimensions of a project together so that technical studies, commercial decisions, environmental responsibilities, financing requirements and implementation arrangements reinforce one another.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("An engagement may begin with needs assessment, research and opportunity identification before progressing into concept development, pre-feasibility and detailed feasibility studies. Business and financial modelling then clarify how the project could operate, create value, attract finance and remain viable over time.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("Once viability has been established, the focus moves towards delivery. This may involve structuring finance and partnerships, informing project design, preparing tender and procurement documentation, supporting implementation and establishing systems for performance measurement. Measurement, reporting and verification (MRV) and monitoring and evaluation (M&E) provide the evidence needed to track results, meet reporting obligations and guide improvement.")}
              </p>
              <p className="leading-relaxed">
                {t("This lifecycle approach allows clients to engage Enerqa at any stage. We may develop a project from its earliest idea, strengthen an existing concept, address gaps in a feasibility study, prepare an opportunity for investment, support delivery or improve an operating project. Evaluation, valuation, transition and exit planning can also form part of the engagement when a project reaches a new phase.")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* P02 The Project Lifecycle */}
      <section className="py-20 bg-white">
        <Container>
          <div className="max-w-4xl mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">{t("The Project Lifecycle")}</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {t("Every project follows a different route, but effective development depends on a clear progression from need to implementation and long-term value. Enerqa's adaptable project lifecycle brings technical, commercial, financial, environmental, social and institutional considerations into the process at the stage when they can influence decisions.")}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {t("Clients may engage Enerqa throughout the complete project cycle or at a specific point where further evidence, structure or delivery support is required.")}
            </p>
          </div>

          <div className="space-y-16 max-w-4xl relative border-s-2 border-gray-100 ps-8 ms-4">

            {/* Step 1 */}
            <div id="needs-opportunity" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">01</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Needs and Opportunity Assessment")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Project development begins by understanding the underlying need, the people or organisations affected and the conditions in which a solution must operate. Research, data analysis and stakeholder engagement help identify challenges, policy priorities, market gaps and underused assets or resources.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("This work establishes whether a meaningful opportunity exists and how it relates to wider commercial, environmental, social or development objectives. The outcome is a clearly defined need supported by evidence, together with an initial understanding of potential value, constraints, stakeholders and possible routes forward.")}</p>
            </div>

            {/* Step 2 */}
            <div id="idea-concept" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">02</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Idea and Concept Development")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("An identified opportunity is shaped into a coherent project concept with a clear purpose, intended users or beneficiaries, proposed activities and expected results. Alternative approaches are considered before defining the preliminary scope, delivery logic, resource requirements and criteria for success.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("This stage provides enough structure to communicate the project to decision-makers, prospective partners, investors and funders. It also identifies the technical, commercial, financial, environmental and institutional questions that must be investigated before the concept can progress.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Depending on the intended audience, the resulting material may take the form of an initial project brief, concept note, funding concept, preliminary scope of work or terms of reference for further studies.")}</p>
            </div>

            {/* Step 3 */}
            <div id="feasibility" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">03</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Pre-Feasibility and Feasibility Studies")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("A pre-feasibility study determines whether a project concept has sufficient potential to justify more detailed investigation. It reviews the principal technical options, market conditions, likely costs, environmental and social considerations, implementation constraints and material risks.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Promising concepts can then progress to a comprehensive feasibility study. This examines technical performance, market demand, legal and regulatory requirements, institutional capacity, financial viability, environmental and social impacts, delivery arrangements and implementation risks in greater depth.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("By comparing alternatives and testing critical assumptions, the feasibility process establishes whether the project is viable, how it should be configured and what must be resolved before an investment or implementation decision.")}</p>
            </div>

            {/* Step 4 */}
            <div id="business-financial" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">04</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Business and Financial Modelling")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("A technically viable solution also needs a sustainable economic and operational foundation. Business-model development examines how the project will create, deliver and retain value, including its customers or beneficiaries, activities, partners, resources, delivery channels and revenue or funding mechanisms.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Financial modelling translates these assumptions into projected capital expenditure, operating costs, revenues, cash flows, financing requirements and investment returns. It can also examine affordability, funding gaps, repayment structures and the distribution of costs and benefits among participating stakeholders.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Scenario and sensitivity analysis show how changes in key assumptions could affect the project's profitability, affordability and long-term viability. This gives project sponsors and investors a clearer basis for deciding whether to proceed, modify the concept or undertake further development.")}</p>
            </div>

            {/* Step 5 */}
            <div id="finance-partnership" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">05</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Finance and Partnership Structuring")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Many projects depend on a combination of sponsors, public institutions, financiers, technology providers, operators, communities and specialist partners. Partnership structuring clarifies their respective roles, responsibilities, incentives, contributions and allocation of risk.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Potential funding routes may include commercial finance, concessional finance, grants, equity, climate finance, blended-finance arrangements or combinations suited to the project's characteristics. Each option must be assessed against the project's revenue model, development impact, risk profile and implementation requirements.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("The resulting structure provides a clearer basis for engaging potential partners and funders, preparing investment documentation and moving a sufficiently developed project towards financing and delivery.")}</p>
            </div>

            {/* Step 6 */}
            <div id="design-tendering" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">06</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Design, Tendering and Procurement Support")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Once the preferred project configuration has been established, its requirements must be translated into clear designs, technical specifications and procurement documentation. Technical, environmental, social, operational and performance requirements should be incorporated early so that bidders respond to a consistent and complete project brief.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Tender preparation may include defining the required scope, deliverables, qualification criteria, performance standards and evaluation methodology. Bid evaluation and procurement support then allow clients to compare proposals in terms of technical suitability, whole-life value, implementation capacity and risk rather than initial price alone.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("This stage connects the conclusions of the feasibility studies with the contracts, suppliers and delivery arrangements needed for implementation.")}</p>
            </div>

            {/* Step 7 */}
            <div id="implementation-management" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">07</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Implementation and Project-Management Support")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Implementation turns the developed concept into functioning assets, systems or programmes. Effective project management coordinates scope, schedules, budgets, contractors, partners, approvals and stakeholder responsibilities while maintaining oversight of quality, risk and agreed outcomes.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Progress reviews, issue tracking, change control and structured reporting allow emerging challenges to be addressed before they undermine delivery. Environmental, social, technical and financial commitments established during project preparation should remain visible throughout implementation.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Support may continue through construction, system deployment, commissioning, operational readiness, handover and the transition into routine operation.")}</p>
            </div>

            {/* Step 8 */}
            <div id="mrv-monitoring" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">08</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("MRV, Monitoring and Evaluation")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Credible results depend on knowing what should be measured, how evidence will be collected and how findings will inform decisions. Measurement, reporting and verification systems establish baselines, indicators, calculation methodologies, data responsibilities and quality controls for greenhouse gas emissions and other quantifiable outcomes.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Monitoring and evaluation frameworks examine whether planned activities have been delivered, whether the intended results are being achieved and what wider effects the project is creating. They can also include a theory of change, costed M&E plan, evaluation questions, reporting schedules and learning arrangements.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Together, MRV and M&E strengthen accountability, meet reporting requirements and provide evidence for project owners, funders, regulators, investors and other stakeholders.")}</p>
            </div>

            {/* Step 9 */}
            <div id="operational-improvement" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">09</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Operational Improvement")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Project development does not end when an asset or programme becomes operational. Performance data, operational experience and user feedback may reveal opportunities to improve efficiency, reduce costs, strengthen environmental and social outcomes or respond to changes in technology, regulation and market conditions.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Comparing actual results with the original business case, design assumptions and performance targets helps identify gaps and priorities. Targeted improvement plans can then address processes, equipment, management systems, resource use, emissions, reporting or other areas affecting performance.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Continual review can protect project value, extend asset life and help an operating project respond to new risks and opportunities.")}</p>
            </div>

            {/* Step 10 */}
            <div id="evaluation-transition" className="scroll-mt-24 relative">
              <div className="absolute -start-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-dark)] font-bold flex items-center justify-center text-sm z-10">10</div>
              <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-4">{t("Evaluation, Valuation, Transition and Exit")}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("At key milestones or near the end of an investment or operating period, a project may require independent evaluation, updated valuation or preparation for transfer, scaling, refinancing or exit.")}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{t("Reviewing financial, operational, environmental and social performance provides a clearer picture of the value created, results achieved, remaining liabilities and future potential. Valuation can incorporate the condition and performance of physical assets as well as relevant commercial, environmental and operational considerations.")}</p>
              <p className="text-gray-600 leading-relaxed">{t("Transition and exit planning addresses responsibilities, documentation, knowledge transfer, outstanding commitments and continuity arrangements. This helps preserve project outcomes as ownership, financing, management or delivery arrangements change.")}</p>
            </div>

          </div>
        </Container>
      </section>

      {/* P03 How the Approach Applies Across Enerqa's Domains */}
      <section className="py-20 bg-[var(--color-paper-alt)] border-t border-gray-200">
        <Container>
          <div className="max-w-4xl mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">{t("How the Approach Applies Across Enerqa's Domains")}</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t("The same development discipline applies across Enerqa's four domains, but the questions, evidence and implementation pathways vary with each project. Technical analysis is integrated with commercial, financial, environmental, social and institutional considerations so that an opportunity can be developed as a coherent whole rather than as a collection of disconnected studies.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">{t("Climate Action & Carbon Management")}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{t("Climate priorities can be translated into implementable programmes and finance-ready projects through a lifecycle that begins with emissions, vulnerability or policy evidence. Greenhouse gas inventories, carbon baselines and climate-risk assessments help define the opportunity, while feasibility studies examine mitigation, adaptation, resilience and carbon-market options. Viable concepts can then be developed through climate-finance proposals, delivery arrangements, stakeholder engagement and implementation planning. MRV systems provide the basis for tracking emissions reductions, adaptation outcomes and progress against climate strategies, Nationally Determined Contributions and other climate commitments. For carbon-credit projects, development may extend from opportunity identification and additionality assessment to methodology selection, project documentation, validation preparation, monitoring and verification support.")}</p>
              <Link href="/domains/climate-action-carbon-management" className="text-[var(--color-secondary)] font-medium hover:underline inline-flex items-center gap-1 mt-auto">
                {t("Explore Climate Action & Carbon Management")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">{t("Energy Systems & Transition")}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{t("Energy-transition projects begin by establishing how energy is generated, supplied and consumed and where technical or commercial opportunities exist. Energy audits, resource assessments, demand analysis and energy modelling can inform concepts involving energy efficiency, renewable energy, storage, grids or industrial decarbonisation. Feasibility studies then examine technology selection, system design, costs, revenues, regulatory requirements, environmental considerations and investment performance. As a project advances, support may extend to financial structuring, procurement, implementation and commissioning. Energy-performance monitoring subsequently allows clients to compare actual results with projected savings, reliability improvements and emissions reductions, identify performance gaps and guide operational improvement.")}</p>
              <Link href="/domains/energy-systems-transition" className="text-[var(--color-secondary)] font-medium hover:underline inline-flex items-center gap-1 mt-auto">
                {t("Explore Energy Systems & Transition")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">{t("Environment, Nature & Circularity")}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{t("Environmental and nature-related projects require early attention to ecological conditions, resource flows, regulatory obligations and affected stakeholders. Baseline studies, environmental and social impact assessment, biodiversity assessment and material-flow analysis can reveal risks as well as opportunities for nature-based solutions, ecosystem restoration, pollution prevention, waste reduction and resource recovery. These findings shape project alternatives, permitting strategies, safeguards, circular business models and implementation plans. Technical and commercial feasibility can then determine which environmental opportunities have the potential to become practical and investable projects. During implementation and operation, environmental management, compliance monitoring and performance evaluation help protect ecosystems and communities, demonstrate results and inform adaptive management, rehabilitation or responsible closure.")}</p>
              <Link href="/domains/environment-nature-circularity" className="text-[var(--color-secondary)] font-medium hover:underline inline-flex items-center gap-1 mt-auto">
                {t("Explore Environment, Nature & Circularity")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-4">{t("Sustainable Business, ESG & Finance")}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{t("Sustainability objectives become actionable when they are connected to governance, investment decisions and measurable performance. ESG readiness assessments, materiality analysis and climate-risk reviews can identify priorities, data gaps and opportunities before they are developed into strategies, operating plans or sustainable-finance mechanisms. For green credit lines and investment programmes, the lifecycle may include taxonomy alignment, eligibility criteria, project screening, financial-product design, risk assessment and environmental and social safeguards. Individual opportunities may also require feasibility studies, business models, financial analysis and investment preparation. Implementation is strengthened through defined responsibilities, reporting systems and stakeholder engagement, while monitoring and evaluation frameworks track environmental, social and financial outcomes and provide evidence for future decisions.")}</p>
              <Link href="/domains/sustainable-business-esg-finance" className="text-[var(--color-secondary)] font-medium hover:underline inline-flex items-center gap-1 mt-auto">
                {t("Explore Sustainable Business, ESG & Finance")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* P04 Where Clients Can Engage Enerqa */}
      <section className="py-20 bg-white">
        <Container>
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-6">{t("Where Clients Can Engage Enerqa")}</h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="mb-6 leading-relaxed">
                {t("Clients do not need to begin at the earliest stage or appoint Enerqa for the entire project lifecycle. Some approach us with an initial need that has not yet been shaped into a project. Others already have a concept, feasibility study, financing proposal, design or operating asset that requires further development.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("At an early stage, the priority may be to define the opportunity, examine alternative concepts and determine what evidence is needed. A more developed project may require detailed feasibility work, business and financial modelling, environmental studies, climate-finance preparation or a clearer implementation structure.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("As a project moves towards delivery, the required support may shift to partnership development, procurement, project management, monitoring systems or operational readiness. Once the project is operating, engagement may focus on performance assessment, emissions or impact reporting, operational improvement, evaluation, valuation, scaling, transition or exit.")}
              </p>
              <p className="mb-6 leading-relaxed">
                {t("Each assignment begins with a review of the project's current stage, the work already completed and the decisions that remain unresolved. The scope can then concentrate on genuine development gaps without unnecessarily repeating existing work.")}
              </p>
              <p className="leading-relaxed">
                {t("This flexible approach allows Enerqa to lead a complete development process, contribute a specialist workstream or strengthen a project at a critical decision point.")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* P05 Start a Project */}
      <section className="py-20 bg-[var(--color-dark)] text-white">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t("Define the next step for your project")}</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t("Whether you are exploring an early idea, assessing project feasibility, preparing for investment, moving towards implementation or seeking to improve an existing operation, the starting point is a clear understanding of the opportunity and the decisions ahead.")}
            </p>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-3xl mx-auto">
              {t("Share the project's purpose, location, current stage and principal challenges with Enerqa. An initial discussion can identify the technical, commercial, financial, environmental, social or implementation questions that need to be resolved and establish an appropriate scope of support.")}
              <br/><br/>
              {t("A complete project brief is not required. Where available, provide the sector or industry, intended outcome, work already completed, stakeholders involved and the type of assistance being considered.")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact?intent=project" className="bg-[var(--color-primary)] text-[var(--color-dark)] font-bold py-4 px-8 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors">
                {t("Discuss Your Project")}
              </Link>
              <Link href="/domains-and-industries#domains" className="bg-transparent border border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-[var(--color-dark)] transition-colors">
                {t("Explore Our Domains")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </div>
  );
}
