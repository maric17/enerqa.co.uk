import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

const domains = [
  {
    title: 'Climate Action & Carbon Management',
    slug: 'climate-action-carbon-management',
    metaDescription: `Climate strategy, GHG inventories, MRV, decarbonisation pathways, climate risk, carbon markets and climate finance, grounded in reliable emissions data.`,
    // CP / EP / NP / BP - official-updates module (handoff pp. 29, 37, 48, 59)
    policyUpdates: {
      heading: 'Policy and Official Updates',
      narrative: `Follow original-source reports and updates relevant to this domain, with their organisation, document type and publication date clearly identified.`,
      sourceNote: `Sources: ReliefWeb, plus curated verified open-access UNFCCC NDC and BTR submissions, IPCC releases and climate-finance institutions. Submission dates and source links are preserved.`,
    },
    // CT / ET / NT / BT - only the tools the handoff names for this domain.
    // Validate each tool's name, endpoint and access before publishing (p. 29).
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    heroNarrative: `Climate change action becomes credible when commitments are translated into practical programmes, measurable results and investable projects. The starting point may be a national climate target, a corporate decarbonisation ambition, a sectoral challenge or an individual project opportunity. In every case, the pathway must be grounded in reliable emissions data and a clear understanding of climate risks and priorities.

This work brings together greenhouse gas inventories, GHG emissions baselines, climate change mitigation and adaptation planning, climate resilience, decarbonisation pathways, NDC implementation, MRV and climate transparency systems.

Where carbon markets or climate finance form part of the solution, the same pathway can extend into carbon-credit project development, financing, implementation support, verification and reporting. This connects climate policy and carbon management with projects capable of delivering measurable environmental and economic value.`,
    capabilities: [
      {
        heading: 'Climate Strategy, Mitigation & Adaptation',
        slug: 'climate-strategy-mitigation-adaptation',
        narrative: `Climate ambition becomes meaningful when it is translated into priorities, investable projects and a practical route to implementation. Climate strategies can connect emissions reduction with adaptation needs, policy objectives, operational realities and development priorities. Beginning with evidence and stakeholder engagement, the work progresses through baseline assessment, scenario analysis and opportunity identification to mitigation and adaptation plans, sector roadmaps and project pipelines. The result is a coherent framework for directing resources, coordinating action and monitoring progress as climate conditions, technologies and policy requirements evolve.`
      },
      {
        heading: 'GHG Inventories, Carbon Footprints & Baselines',
        slug: 'ghg-inventories-carbon-footprints-baselines',
        narrative: `A reliable emissions baseline provides the foundation for carbon management, climate reporting and credible reduction targets. Greenhouse gas inventories and carbon footprints bring together activity data, emission factors, organisational or project boundaries and transparent calculation methods to show where emissions arise and which sources matter most. Covering relevant Scope 1, Scope 2 and Scope 3 emissions, the process moves from data collection and quality review to hotspot analysis and baseline development, creating a defensible evidence base for decarbonisation projects, disclosures and future performance measurement.`
      },
      {
        heading: 'MRV, Transparency & NDC Tracking',
        slug: 'mrv-transparency-ndc-tracking',
        narrative: `Climate commitments depend on systems that can measure results, document decisions and show whether implementation remains on course. Measurement, reporting and verification frameworks define indicators, data sources, responsibilities, calculation methods and quality controls for policies, programmes and projects. At national and sectoral levels, these systems can connect actions and outcomes with Nationally Determined Contributions, international transparency requirements and wider development objectives. Clear institutional arrangements, data flows, reporting templates and digital dashboards make progress easier to track while strengthening accountability, institutional learning and confidence in reported climate results.`
      },
      {
        heading: 'Decarbonisation & Net-Zero Pathways',
        slug: 'decarbonisation-net-zero-pathways',
        narrative: `A net-zero commitment needs more than a distant target. It requires a sequenced pathway grounded in emissions data, technical options and investment realities. Decarbonisation planning examines how energy efficiency, renewable energy, operational changes, cleaner technologies, fuel switching and value-chain action could reduce emissions over time. Scenario modelling and feasibility assessment compare costs, benefits, dependencies and implementation risks, allowing measures to be organised into near-, medium- and long-term programmes. This turns climate ambition into a practical transition plan with defined milestones, project opportunities and a framework for monitoring progress.`
      },
      {
        heading: 'Climate Risk & Resilience',
        slug: 'climate-risk-resilience',
        narrative: `Climate change creates physical risks for assets, infrastructure, ecosystems, communities and supply chains, while changes in policy, technology and markets introduce transition risks for organisations and investments. Climate risk assessment examines hazards, exposure, vulnerability and adaptive capacity under relevant scenarios, revealing where disruption and financial consequences may emerge. The findings inform resilient design, adaptation measures, business-continuity planning and investment priorities. Considering climate risk from early concept and feasibility through design, implementation and monitoring makes resilience part of project development rather than a response added after major decisions have already been made.`
      },
      {
        heading: 'Carbon Markets & Carbon-Credit Projects',
        slug: 'carbon-markets-carbon-credit-projects',
        narrative: `Carbon markets can mobilise finance for measurable emissions reductions and removals, but credible projects must rest on sound methodologies, additionality, robust baselines and long-term monitoring. Carbon-credit project development begins by identifying and screening opportunities before testing technical feasibility, emissions impact, financial potential and applicable standards. The work may continue through project documentation, stakeholder and safeguard requirements, validation and registration preparation, monitoring systems and verification support. Careful development throughout the carbon-project cycle strengthens environmental integrity while giving project owners a clearer view of costs, risks, responsibilities and potential revenues.`
      },
      {
        heading: 'Climate Finance & Project Preparation',
        slug: 'climate-finance-project-preparation',
        narrative: `Promising climate ideas often struggle to attract finance because they have not yet been developed into clearly defined, technically credible and investment-ready projects. Climate project preparation bridges that gap by shaping early concepts, assessing feasibility, estimating climate and development benefits, examining delivery models and building the financial and economic case. Technical studies, risk analysis, safeguards, implementation arrangements and monitoring frameworks can then be assembled into concept notes, funding proposals or investment documentation. This structured pathway allows climate funds, development-finance institutions, investors and project sponsors to assess opportunities and move viable projects towards financing and delivery.`
      }
    ]
  },
  {
    title: 'Energy Systems & Transition',
    slug: 'energy-systems-transition',
    metaDescription: `Energy audits, ISO 50001, energy modelling and policy analysis, renewable-energy project development, storage and grids, and industrial decarbonisation.`,
    // CP / EP / NP / BP - official-updates module (handoff pp. 29, 37, 48, 59)
    policyUpdates: {
      heading: 'Official Energy Analysis and Research',
      narrative: `Follow original-source reports and updates relevant to this domain, with their organisation, document type and publication date clearly identified.`,
      sourceNote: `Sources: U.S. EIA Today in Energy RSS for official energy analysis and DOE OSTI for energy research metadata, plus source-filtered national energy authorities and regulators. Technical reports are distinguished from market news.`,
    },
    // CT / ET / NT / BT - only the tools the handoff names for this domain.
    // Validate each tool's name, endpoint and access before publishing (p. 29).
    relevantTools: [
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
    ],
    heroNarrative: `The energy transition is reshaping how energy is produced, managed, financed and consumed. Governments, businesses and project developers must identify solutions that lower costs and emissions without compromising reliability, resilience or commercial performance.

An engagement may begin with an energy audit, an ISO 50001 energy-management system or detailed energy and emissions modelling. These foundations reveal where efficiency improvements can be made and where new energy investments may create value.

Renewable energy project development, energy storage, power systems, clean technology and the decarbonisation of facilities or energy-intensive operations can then be assessed against available resources, market conditions and investment priorities. Technical and economic feasibility studies provide the basis for sound investment cases, project financing, implementation and long-term energy-performance monitoring.`,
    capabilities: [
      {
        heading: 'Energy Audits & Performance Assessment',
        slug: 'energy-audits-performance-assessment',
        narrative: `Reliable energy performance begins with a clear understanding of where, when and why energy is used. Energy audits examine facilities, processes and equipment to establish consumption baselines, identify losses and uncover practical energy-efficiency opportunities. The work can extend from initial scoping, data review and site assessment to technical analysis, prioritised energy-conservation measures and investment planning. Each recommendation is considered in relation to operational requirements, costs, savings, emissions reductions and implementation constraints, creating an evidence-based pathway from diagnosis and feasibility through delivery, measurement and ongoing performance improvement.`
      },
      {
        heading: 'Energy Management & ISO 50001',
        slug: 'energy-management-iso-50001',
        narrative: `Effective energy management turns one-off savings into a system of continual improvement. An ISO 50001-aligned energy management system connects organisational priorities with energy reviews, significant energy uses, baselines, energy performance indicators, targets and action plans. Governance, operational controls, procurement, staff engagement, documentation and performance monitoring are designed to work together. From readiness assessment and system design to implementation, internal review and corrective action, the approach gives industrial facilities, commercial portfolios and public institutions a practical structure for managing energy consumption, operating costs and emissions over time.`
      },
      {
        heading: 'Energy Modelling & Policy Analysis',
        slug: 'energy-modelling-policy-analysis',
        narrative: `Energy decisions frequently involve competing technical, economic and policy choices. Energy modelling makes those trade-offs visible by testing demand, supply, technologies, costs and emissions under different assumptions and future scenarios. Policy analysis adds the regulatory, institutional and market context needed to interpret the results, whether the question concerns national energy-transition pathways, utility planning, tariffs, incentives or investment priorities. The work moves from defining the decision and assembling credible data to scenario development, sensitivity analysis and clear recommendations, providing a defensible basis for policy formulation, project feasibility, financing and subsequent performance tracking.`
      },
      {
        heading: 'Renewable-Energy Project Development',
        slug: 'renewable-energy-project-development',
        narrative: `Renewable-energy opportunities become investable projects through disciplined development. The journey may begin with resource, market, technology and site screening, followed by concept design, pre-feasibility and detailed feasibility studies. Energy-yield assessment, grid connection, permitting, environmental and social considerations, capital and operating costs, revenue models, risks and financing requirements are brought into a coherent business case. The work can continue through procurement, partner selection, implementation planning, commissioning and performance monitoring, enabling solar, wind, hybrid and distributed-energy projects to progress from an initial idea to an operational asset.`
      },
      {
        heading: 'Energy Storage, Grids & Power Systems',
        slug: 'energy-storage-grids-power-systems',
        narrative: `Modern power systems need greater flexibility as electricity demand changes and variable renewable generation expands. Energy storage and grid planning bring together technical performance, system reliability and commercial value. Depending on the project, this may include battery energy storage systems, hybrid generation, microgrids, behind-the-meter solutions, grid integration and transmission or distribution requirements. Needs assessment leads into technology selection, sizing, dispatch modelling, interconnection studies and techno-economic analysis. Procurement and implementation planning can then establish a pathway towards commissioning, operational optimisation and long-term performance monitoring.`
      },
      {
        heading: 'Clean Technology & Industrial Decarbonisation',
        slug: 'clean-technology-industrial-decarbonisation',
        narrative: `Industrial decarbonisation is rarely achieved through a single technology. It requires a practical sequence of measures matched to production processes, energy needs, asset cycles and investment capacity. Starting with energy and emissions baselines, potential pathways can combine efficiency, process optimisation, electrification, renewable energy, fuel switching, waste-heat recovery and other clean technologies. Technical and commercial screening identifies which options merit feasibility studies, pilots or full project development. Abatement potential, cost, operational risk, financing and implementation timing are assessed together, creating a phased roadmap with measurable outcomes.`
      }
    ]
  },
  {
    title: 'Environment, Nature & Circularity',
    slug: 'environment-nature-circularity',
    metaDescription: `ESIA and safeguards, environmental permitting, pollution control, biodiversity and natural capital, nature-based solutions, circular economy, and closure.`,
    // CP / EP / NP / BP - official-updates module (handoff pp. 29, 37, 48, 59)
    policyUpdates: {
      heading: 'Environment and Nature Updates',
      narrative: `Follow original-source reports and updates relevant to this domain, with their organisation, document type and publication date clearly identified.`,
      sourceNote: `Sources: EEA RSS for environment, nature, pollution and circularity, and GBIF literature for biodiversity research, plus curated CBD, UNEP and national environment-authority links.`,
    },
    // CT / ET / NT / BT - only the tools the handoff names for this domain.
    // Validate each tool's name, endpoint and access before publishing (p. 29).
    relevantTools: [
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    heroNarrative: `Projects and operations depend on healthy environmental, social and natural systems. Understanding that relationship early makes it possible to manage impacts, meet regulatory and safeguard requirements, reduce liabilities and improve project design.

Environmental and social impact assessment, strategic environmental assessment, permitting, due diligence and environmental management planning provide the evidence needed to identify risks. That evidence can then be translated into practical design requirements, compliance measures, monitoring systems and operational improvements.

Nature forms part of this project context rather than sitting outside it. Biodiversity, ecosystems, habitats, land, freshwater, coastal and marine systems can determine where and how projects should proceed. Biodiversity assessment and ecosystem analysis help identify dependencies, risks and opportunities, while nature-based solutions can strengthen climate resilience, restore degraded environments and create benefits for communities.

Integrating habitat protection, rehabilitation, ecological restoration and closure planning into project decisions helps avoid or minimise environmental harm. It can also reveal opportunities for nature-positive development and projects that combine environmental restoration with social and economic value.

Circularity extends the same thinking to the movement of materials, water, waste and other resources through an operation or economy. Circular economy strategies look beyond disposal towards waste prevention, resource efficiency, reuse, recycling, resource recovery and energy recovery.

Technology assessment, feasibility studies, circular business models and investment planning can turn waste and resource constraints into viable circular-economy projects. The result is a more efficient use of materials, lower pollution, reduced pressure on natural resources and new opportunities to retain economic value.`,
    capabilities: [
      {
        heading: 'ESIA, Strategic Assessment & Safeguards',
        slug: 'esia-strategic-assessment-safeguards',
        narrative: `Strong projects consider their environmental and social consequences before major decisions are fixed. Environmental and Social Impact Assessment, Strategic Environmental Assessment and safeguards provide the evidence required to compare alternatives, select suitable sites and design proportionate mitigation measures. The process brings together screening, scoping, baseline studies, stakeholder engagement, impact assessment, environmental and social management plans, and monitoring frameworks. Applied from early concept and feasibility through approval, financing, construction and operation, these tools help projects meet regulatory and lender expectations while protecting communities, ecosystems and long-term project value.`
      },
      {
        heading: 'Environmental Permitting & Due Diligence',
        slug: 'environmental-permitting-due-diligence',
        narrative: `Environmental approvals are most effective when they shape a project rather than delay it near the end of development. Permitting work begins by mapping applicable environmental requirements, approval pathways and evidence needs, then incorporating them into a realistic project programme. Environmental due diligence examines compliance status, historical impacts, site constraints, liabilities and material risks before an acquisition, investment or development decision. Permit applications, regulator engagement, compliance reviews, gap assessments and corrective-action planning contribute to clearer decisions, fewer unexpected liabilities and projects that remain compliant throughout their lifecycle.`
      },
      {
        heading: 'Environmental Management & Pollution Control',
        slug: 'environmental-management-pollution-control',
        narrative: `Environmental commitments only have value when they become part of everyday operating practice. Environmental management systems translate approval conditions, assessment findings and corporate policies into responsibilities, procedures, performance indicators and auditable controls. Pollution prevention forms part of the same framework, addressing air emissions, wastewater, noise, soil contamination, hazardous materials and waste at their source wherever practical. Environmental management plans, monitoring programmes, compliance audits and corrective action create a practical system for controlling risk, demonstrating regulatory compliance and improving environmental performance throughout construction, operation and eventual closure.`
      },
      {
        heading: 'Biodiversity, Ecosystems & Natural Capital',
        slug: 'biodiversity-ecosystems-natural-capital',
        narrative: `Biodiversity forms part of the natural infrastructure on which economies, communities and projects depend. Understanding species, habitats, ecological connectivity and ecosystem services early can reveal constraints and opportunities before a site or design is fixed. Biodiversity assessment and natural-capital analysis inform critical-habitat screening, the mitigation hierarchy, biodiversity action plans, nature-related risk assessment and long-term monitoring. This evidence connects project development with conservation priorities and emerging nature-positive ambitions, guiding decisions from feasibility and investment appraisal through construction and operation while accounting for dependencies and impacts on ecosystems.`
      },
      {
        heading: 'Nature-Based Solutions & Restoration',
        slug: 'nature-based-solutions-restoration',
        narrative: `Nature-based solutions use the functions of ecosystems to address practical challenges such as flooding, coastal erosion, extreme heat, declining water quality and climate vulnerability. When restoration is treated as a developed project rather than an isolated planting exercise, ecological objectives can be connected to technical feasibility, community needs, finance and measurable outcomes. Opportunities may include restoring wetlands, mangroves, watersheds, degraded land or urban green systems. Work can progress from site screening and baseline assessment to concept design, feasibility, implementation planning and monitoring, creating solutions that strengthen biodiversity, climate resilience and ecosystem services.`
      },
      {
        heading: 'Water, Coastal & Marine Systems',
        slug: 'water-coastal-marine-systems',
        narrative: `Water connects landscapes, communities, industry and ecosystems, so project decisions rarely stop at a site boundary. Freshwater, coastal and marine assessments consider water availability, quality, catchment pressures, wastewater discharges, sensitive habitats and the cumulative effects of development. These considerations inform water balances, resource-efficiency measures, coastal and marine impact assessments, pollution controls and climate-resilient infrastructure. Bringing them into site selection, feasibility studies, design, permitting and operational monitoring encourages responsible water use while reducing risks to communities, aquatic ecosystems and long-term project performance.`
      },
      {
        heading: 'Circular Economy, Waste & Resource Recovery',
        slug: 'circular-economy-waste-resource-recovery',
        narrative: `The circular economy begins by treating materials, products and waste as resources with continuing value. Mapping material flows and waste streams can reveal opportunities to prevent waste, reduce demand for virgin resources and create value through reuse, repair, remanufacturing, recycling and recovery. These opportunities can then be tested as practical projects through technical feasibility, market assessment, business modelling, partner identification and investment planning. Whether applied to an industrial facility, city, supply chain or product system, circular economy strategies connect resource efficiency and waste management with lower environmental impacts, stronger resilience and new commercial possibilities.`
      },
      {
        heading: 'Rehabilitation, Closure & Monitoring',
        slug: 'rehabilitation-closure-monitoring',
        narrative: `Responsible closure is planned long before the final day of operation. Early preparation allows rehabilitation requirements, decommissioning options, environmental liabilities, costs and future land uses to influence project design and financial decisions. As a facility, mine, industrial site or infrastructure asset approaches closure, the plan can be refined through contamination assessment, remediation studies, stakeholder engagement and implementation scheduling. Clear completion criteria, biodiversity or land-restoration measures, post-closure monitoring and adaptive management create a defensible path towards a safe, stable and productive site legacy while reducing long-term risk and uncertainty.`
      }
    ]
  },
  {
    title: 'Sustainable Business, ESG & Finance',
    slug: 'sustainable-business-esg-finance',
    metaDescription: `ESG strategy and reporting, materiality, climate and ESG risk, responsible supply chains, sustainable finance, taxonomies and feasibility studies.`,
    // CP / EP / NP / BP - official-updates module (handoff pp. 29, 37, 48, 59)
    policyUpdates: {
      heading: 'Corporate Disclosures and Finance Updates',
      narrative: `Follow original-source reports and updates relevant to this domain, with their organisation, document type and publication date clearly identified.`,
      sourceNote: `Sources: SEC EDGAR filings for selected issuers, identified by issuer, form and filing date, plus curated verified open-access finance-regulator and taxonomy sources.`,
    },
    // CT / ET / NT / BT - only the tools the handoff names for this domain.
    // Validate each tool's name, endpoint and access before publishing (p. 29).
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
    ],
    heroNarrative: `Sustainability creates lasting value when it influences strategy, governance, investment and daily operations. ESG strategy and reporting therefore begin with understanding what is material to an organisation, where climate and ESG risks arise, how responsible supply chains are managed, and whether internal systems are ready to deliver and measure improvement.

Once those priorities are clear, they can be connected to capital. Green credit lines, sustainable-finance mechanisms, taxonomies and project-eligibility criteria help financial institutions, businesses and project sponsors direct funding towards credible opportunities.

Project screening, feasibility studies, business models, financial analysis and investment cases bridge the gap between sustainability ambitions and projects that can be financed, implemented and monitored. This creates a direct connection between ESG performance, sustainable business strategy and investment decisions.`,
    capabilities: [
      {
        heading: 'ESG Strategy, Readiness & Reporting',
        slug: 'esg-strategy-readiness-reporting',
        narrative: `ESG becomes useful when it influences decisions, responsibilities and operating practices rather than existing only as a reporting exercise. The process begins by understanding an organisation’s activities, governance, stakeholder expectations and regulatory exposure. ESG readiness and gap assessments identify existing evidence, capabilities and data gaps before material priorities are translated into policies, targets, performance indicators and reporting arrangements. This foundation can guide implementation, internal controls and sustainability reporting while allowing the organisation to align with the frameworks most relevant to its sector, markets and stakeholders.`
      },
      {
        heading: 'Materiality & Sustainability Performance',
        slug: 'materiality-sustainability-performance',
        narrative: `Sustainability priorities differ between industries, organisations and locations. A materiality assessment identifies the environmental, social and governance issues that matter most to business performance and affected stakeholders, creating a focused basis for strategy and reporting. The work may combine stakeholder engagement, peer and regulatory review, value-chain analysis and an assessment of impacts, risks and opportunities. Material topics can then be connected to indicators, responsibilities, targets and data requirements. This allows sustainability performance to be measured consistently and directs management attention towards issues with the greatest strategic and practical significance.`
      },
      {
        heading: 'Climate & ESG Risk',
        slug: 'climate-esg-risk',
        narrative: `Climate and ESG risks become actionable when they are connected to assets, operations, investments and strategic decisions. Assessment may consider physical climate hazards, policy and market transition, environmental liabilities, social impacts, governance weaknesses and emerging disclosure requirements. Scenarios and risk analysis help determine exposure, potential consequences and the effectiveness of existing controls. The findings can strengthen risk registers, due diligence, resilience planning, investment appraisal and public disclosure, while identifying practical measures that reduce vulnerability and improve preparedness across the organisation or project lifecycle.`
      },
      {
        heading: 'Responsible Supply Chains',
        slug: 'responsible-supply-chains',
        narrative: `A large share of an organisation’s environmental and social impact may sit outside its direct operations. Responsible supply-chain work maps suppliers, materials, logistics and business relationships to identify emissions hotspots, environmental pressures, labour concerns, climate exposure and continuity risks. These findings can inform supplier requirements, sustainable-procurement policies, due-diligence procedures and Scope 3 emissions programmes. Engagement and performance monitoring then provide a practical route for working with suppliers on improvement, helping organisations strengthen resilience, respond to stakeholder expectations and reduce risk throughout their value chains.`
      },
      {
        heading: 'Sustainable Finance & Green Credit Lines',
        slug: 'sustainable-finance-green-credit-lines',
        narrative: `Sustainable finance requires a credible connection between capital and measurable environmental or social outcomes. Green credit lines and other sustainable-finance mechanisms begin with a clear market need, defined objectives and an understanding of the institutions and projects involved. Eligibility rules, financial-product structures, environmental and social safeguards, pipeline development and impact-reporting requirements can then be designed as one coherent system. This enables banks, investors and development-finance institutions to identify suitable projects, manage risk and direct funding towards renewable energy, efficiency, climate resilience, circularity and other eligible investments.`
      },
      {
        heading: 'Taxonomies, Eligibility & Project Screening',
        slug: 'taxonomies-eligibility-project-screening',
        narrative: `Investors and financial institutions need consistent methods for distinguishing genuinely sustainable projects from unsupported environmental claims. Taxonomies and eligibility frameworks translate broad sustainability objectives into defined sectors, technologies, thresholds, exclusions and evidence requirements. Project-screening and scoring tools apply these rules to individual proposals or investment pipelines, considering technical merit, environmental benefits, social safeguards and implementation readiness. Used early in project development, the framework reveals information gaps and improvement needs before financing decisions are made, while creating a transparent basis for portfolio classification, approval and impact reporting.`
      },
      {
        heading: 'Feasibility Studies & Business Models',
        slug: 'feasibility-studies-business-models',
        narrative: `A promising sustainability idea needs a credible technical, commercial and financial foundation before it can attract investment or move into implementation. Feasibility studies examine market demand, technology options, operational requirements, environmental and social considerations, capital and operating costs, revenues, risks and delivery arrangements. Business-model development determines how value will be created, delivered and sustained among the parties involved. By combining scenario analysis with financial modelling and implementation planning, the process turns an early concept into a structured investment case and clarifies whether the project should proceed, change direction or be developed further.`
      },
      {
        heading: 'Monitoring, Evaluation & Impact Frameworks',
        slug: 'monitoring-evaluation-impact-frameworks',
        narrative: `Projects demonstrate their value through credible evidence of what changed, why it changed and whether the benefits can be sustained. Monitoring and evaluation frameworks connect objectives with baselines, indicators, data sources, responsibilities, reporting schedules and evaluation questions. A costed M&E plan ensures that the system is practical and properly resourced, while dashboards and reporting tools make results easier to interpret. For emissions-related activities, the framework can connect with MRV requirements. Regular evaluation and learning then allow project teams and funders to improve delivery, respond to emerging risks and communicate impact with greater confidence.`
      }
    ]
  }
];

async function seed() {
  console.log('Seeding domains...');
  const payload = await getPayload({ config: configPromise });

  // Handoff p. 4 forbids empty or fake links, and p. 29 forbids labelling a tool
  // public before its name, endpoint and access are tested. /tools/[slug] calls
  // notFound() for an unknown slug, so publishing a link to a tool that has no
  // CMS record would put a 404 on a live domain page.
  //
  // So: look up which tool slugs actually exist, and publish only those links.
  // Once the real tool records are created, re-run this script and the remaining
  // links appear on their own - no code change needed.
  const existingTools = await payload.find({ collection: 'tools', limit: 200, depth: 0 });
  const liveToolSlugs = new Set(
    (existingTools.docs as { slug?: string | null }[])
      .map((t) => t.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  console.log(`Tool slugs found in CMS: ${[...liveToolSlugs].join(', ') || '(none)'}`);

  const skippedTools = new Set<string>();

  for (const domain of domains) {
    console.log(`Processing domain: ${domain.title}`);

    // Drop any tool whose /tools/{slug} page would 404.
    const resolvableTools = (domain.relevantTools ?? []).filter((tool) => {
      const slug = tool.href.replace(/^\/tools\//, '');
      if (liveToolSlugs.has(slug)) return true;
      skippedTools.add(`${tool.label} (${tool.href})`);
      return false;
    });

    const data = { ...domain, relevantTools: resolvableTools };

    // Check if domain exists
    const existing = await payload.find({
      collection: 'domains',
      where: {
        slug: { equals: domain.slug }
      }
    });

    if (existing.docs.length > 0) {
      console.log(`Updating ${domain.title}...`);
      await payload.update({
        collection: 'domains',
        id: existing.docs[0].id,
        data,
      });
    } else {
      console.log(`Creating ${domain.title}...`);
      await payload.create({
        collection: 'domains',
        data,
      });
    }
  }

  console.log('Done seeding domains!');

  if (skippedTools.size > 0) {
    console.log('\nSKIPPED TOOL LINKS - no matching record in the tools collection:');
    for (const t of skippedTools) console.log(`  - ${t}`);
    console.log('The Relevant Enerqa Tools section stays hidden on those domain pages.');
    console.log('Create the tool records, then re-run this script to publish the links.');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
