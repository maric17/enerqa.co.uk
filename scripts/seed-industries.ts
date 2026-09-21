import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

const industries = [
  {
    title: 'Government, Regulators & Public Institutions',
    slug: 'government-regulators-public-institutions',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'world-bank-indicators', note: 'National development/energy/environment comparisons for policy context.' },
      { provider: 'oecd-sdmx', note: 'Reported climate-related development finance by provider/recipient/objective.' },
    ],
    metaDescription: 'Climate and energy policy, GHG inventories, NDC implementation and MRV for ministries, regulators, municipalities and state-owned entities.',
    heroNarrative: 'Public climate action begins with credible data and becomes durable when institutions are equipped to act on it. For ministries, regulators, municipalities, public authorities and state-owned entities, climate and energy policy, GHG inventories, NDC implementation and MRV systems are connected with environmental governance, data platforms and investable project pipelines.\n\nInstitutional arrangements, capacity building, climate-finance mobilisation and programme evaluation help carry these ambitions into sustained delivery.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Public projects develop from a clearly defined policy or service need, supported by data and stakeholder engagement. Concept development and feasibility studies establish the appropriate scope, funding requirements and institutional arrangements. Procurement and implementation planning then provide a route to delivery, while monitoring and evaluation track public-investment outcomes and inform future programmes.',
    workAreas: [
      {
        title: 'MRV, Transparency & NDC Tracking',
        url: '/domains/climate-action-carbon-management#mrv-transparency-ndc-tracking'
      },
      {
        title: 'Climate Strategy, Mitigation & Adaptation',
        url: '/domains/climate-action-carbon-management#climate-strategy-mitigation-adaptation'
      },
      {
        title: 'Energy Modelling & Policy Analysis',
        url: '/domains/energy-systems-transition#energy-modelling-policy-analysis'
      },
      {
        title: 'ESIA, Strategic Assessment & Safeguards',
        url: '/domains/environment-nature-circularity#esia-strategic-assessment-safeguards'
      }
    ]
  },
  {
    title: 'Financial Institutions, Investors & Development Finance',
    slug: 'financial-institutions-investors-development-finance',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'oecd-sdmx', note: 'Reported climate-related development-finance flows, not all private climate finance.' },
      { provider: 'world-bank-indicators', note: 'Country investment and macroeconomic context; not live quotes.' },
    ],
    metaDescription: 'Green credit lines, taxonomy and eligibility criteria, environmental and social risk assessment, and impact monitoring for banks and climate funds.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Sustainable Finance & Green Credit Lines', url: '/domains/sustainable-business-esg-finance#sustainable-finance-green-credit-lines' },
      { title: 'Taxonomies, Eligibility & Project Screening', url: '/domains/sustainable-business-esg-finance#taxonomies-eligibility-project-screening' },
      { title: 'Climate & ESG Risk', url: '/domains/sustainable-business-esg-finance#climate-esg-risk' },
      { title: 'Monitoring, Evaluation & Impact Frameworks', url: '/domains/sustainable-business-esg-finance#monitoring-evaluation-impact-frameworks' },
    ],
    heroNarrative: 'Green finance succeeds when sustainability ambitions are translated into clear investment rules and credible project opportunities. For banks, investors, climate funds and development-finance institutions, this means shaping green credit lines and sustainable-finance products around robust taxonomy and eligibility criteria, environmental and social risk assessment, and well-screened project pipelines.\n\nBankable investments can then be paired with impact-monitoring frameworks that demonstrate where capital is going and what it achieves.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Investment opportunities need to be tested against technical, commercial, financial, environmental and social requirements before capital is committed. Project screening, feasibility assessment and financial modelling clarify viability and risk, while financing and partnership arrangements define a route to delivery. Monitoring, valuation and impact assessment can continue through operation, refinancing, transition or exit.'
  },
  {
    title: 'Energy & Utilities',
    slug: 'energy-utilities',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'eia-open-data', note: 'Generation/consumption/selected prices with country and frequency labels.' },
      { provider: 'nasa-power', note: 'Solar resource for location-based early feasibility.' },
    ],
    metaDescription: 'Energy-system modelling, market analysis, feasibility, renewable project development and performance monitoring for generation, grids and storage.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Renewable-Energy Project Development', url: '/domains/energy-systems-transition#renewable-energy-project-development' },
      { title: 'Energy Storage, Grids & Power Systems', url: '/domains/energy-systems-transition#energy-storage-grids-power-systems' },
      { title: 'Energy Modelling & Policy Analysis', url: '/domains/energy-systems-transition#energy-modelling-policy-analysis' },
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
    ],
    heroNarrative: 'The energy transition is transforming how power is generated, distributed, stored and consumed. Across electricity generation, renewable energy, grids, energy storage, distributed energy and end-use efficiency, energy-system modelling and market analysis reveal where change is technically possible and commercially sound.\n\nThose insights can guide project feasibility, energy management, investment planning, renewable energy project development and long-term performance monitoring.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Energy investments develop around demand, reliability, resource availability and affordability. Resource assessment, system modelling and feasibility studies help compare generation, grid, storage and efficiency options before financing and procurement decisions. Implementation support and performance monitoring then connect the investment case with operational results and future upgrades.'
  },
  {
    title: 'Oil, Gas & Petrochemicals',
    slug: 'oil-gas-petrochemicals',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'climate-trace', note: 'O&G/refining sector/source emissions estimates, not verified corporate inventories.' },
      { provider: 'eia-open-data', note: 'Selected production/consumption/fuel-price context, coverage labelled.' },
    ],
    metaDescription: 'Emissions baselines, decarbonisation pathways, clean technology and pollution control for oil, gas and petrochemical operations.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Clean Technology & Industrial Decarbonisation', url: '/domains/energy-systems-transition#clean-technology-industrial-decarbonisation' },
      { title: 'GHG Inventories, Carbon Footprints & Baselines', url: '/domains/climate-action-carbon-management#ghg-inventories-carbon-footprints-baselines' },
      { title: 'Decarbonisation & Net-Zero Pathways', url: '/domains/climate-action-carbon-management#decarbonisation-net-zero-pathways' },
      { title: 'Environmental Management & Pollution Control', url: '/domains/environment-nature-circularity#environmental-management-pollution-control' },
    ],
    heroNarrative: 'Upstream, midstream, LNG, refining and petrochemical operations face the dual challenge of managing current environmental impacts while preparing for a lower-carbon future.\n\nMethane and flaring assessments, GHG inventories and energy-efficiency analysis establish a credible foundation for decarbonisation pathways. Environmental studies, asset evaluation, clean-technology feasibility and transition-finance planning then translate those pathways into practical operational and investment decisions.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Operational constraints, emissions sources and environmental obligations help define opportunities for efficiency, methane reduction, flaring management and cleaner technology. Feasibility and financial analysis test how proposed improvements can integrate with existing assets. Delivery planning and monitoring address operational performance, while valuation, transition and decommissioning considerations become relevant as assets enter a new phase.'
  },
  {
    title: 'Industry, Manufacturing & Materials',
    slug: 'industry-manufacturing-materials',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'climate-trace', note: 'Relevant industrial sector/source emissions estimates.' },
      { provider: 'eia-open-data', note: 'Energy production/price/consumption context for feasibility, not plant audit data.' },
    ],
    metaDescription: 'Energy audits, industrial decarbonisation, circular economy and resource recovery, and feasibility studies for manufacturing and materials.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Clean Technology & Industrial Decarbonisation', url: '/domains/energy-systems-transition#clean-technology-industrial-decarbonisation' },
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
      { title: 'Circular Economy, Waste & Resource Recovery', url: '/domains/environment-nature-circularity#circular-economy-waste-resource-recovery' },
      { title: 'Feasibility Studies & Business Models', url: '/domains/sustainable-business-esg-finance#feasibility-studies-business-models' },
    ],
    heroNarrative: 'Industrial decarbonisation must work on the factory floor as well as on the balance sheet. In cement, metals, chemicals, industrial gases, recycling, food processing and other manufacturing activities, energy use, resource efficiency, process emissions and cleaner production are closely connected.\n\nCircular-economy assessments, feasibility studies, environmental reviews, ESG performance and investment planning bring these elements together in practical industrial improvement and project-development programmes.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Industrial opportunities emerge from understanding production processes, energy demand, material flows and commercial constraints. Cleaner-production and circular-economy concepts can then be tested through feasibility studies and investment models. Procurement, implementation and monitoring connect those decisions with changes in operating costs, resource use, emissions and manufacturing performance.'
  },
  {
    title: 'Infrastructure, Real Estate & Industrial Zones',
    slug: 'infrastructure-real-estate-industrial-zones',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'nasa-power', note: 'Historical solar/meteorological context for early site assessment.' },
      { provider: 'world-bank-indicators', note: 'Country infrastructure/development/water context, not site-level design.' },
    ],
    metaDescription: 'Climate risk and resilience, energy performance, ESIA and environmental permitting for infrastructure, real estate and industrial zones.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Climate Risk & Resilience', url: '/domains/climate-action-carbon-management#climate-risk-resilience' },
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
      { title: 'ESIA, Strategic Assessment & Safeguards', url: '/domains/environment-nature-circularity#esia-strategic-assessment-safeguards' },
      { title: 'Environmental Permitting & Due Diligence', url: '/domains/environment-nature-circularity#environmental-permitting-due-diligence' },
    ],
    heroNarrative: 'Buildings and infrastructure designed today will shape energy demand, emissions and climate resilience for decades. For real estate, industrial parks, free zones, roads and other infrastructure assets, low-carbon and climate-resilient design can be informed by energy and water efficiency, environmental and social assessment, lifecycle emissions and sustainability scoring.\n\nDue diligence and implementation monitoring help ensure these priorities remain embedded as projects move from concept and design to construction and operation.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Infrastructure development begins with the site, intended use, market requirements and environmental context. Concept options and feasibility studies establish capacity, phasing and investment requirements before design and procurement. Implementation monitoring and operational assessment help retain energy, water, climate-resilience and sustainability priorities throughout the asset lifecycle, including future renewal or redevelopment.'
  },
  {
    title: 'Transport, Logistics & Mobility',
    slug: 'transport-logistics-mobility',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'climate-trace', note: 'Transport-sector/source emissions estimates, not local fleet data.' },
      { provider: 'eia-open-data', note: 'Selected transport-fuel supply/price context, coverage labelled.' },
    ],
    metaDescription: 'GHG inventories, MRV, clean technology and responsible supply chains across transport, logistics and mobility networks.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'GHG Inventories, Carbon Footprints & Baselines', url: '/domains/climate-action-carbon-management#ghg-inventories-carbon-footprints-baselines' },
      { title: 'MRV, Transparency & NDC Tracking', url: '/domains/climate-action-carbon-management#mrv-transparency-ndc-tracking' },
      { title: 'Clean Technology & Industrial Decarbonisation', url: '/domains/energy-systems-transition#clean-technology-industrial-decarbonisation' },
      { title: 'Responsible Supply Chains', url: '/domains/sustainable-business-esg-finance#responsible-supply-chains' },
    ],
    heroNarrative: 'Every movement of people and goods generates data that can inform a more efficient, lower-carbon transport system. Across road transport, aviation, maritime operations, ports, rail and logistics networks, emissions accounting, activity-data analysis and MRV create a reliable picture of performance.\n\nThat evidence can guide fuel and technology assessments, fleet efficiency, low-carbon transport infrastructure, climate-resilience planning and more sustainable supply chains.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Transport projects need to connect service requirements with assets, technology, energy supply and viable business models. Activity and emissions data inform concepts that can be assessed through feasibility and financial analysis before procurement and deployment. Monitoring then examines fleet, infrastructure and service performance, providing evidence for operational improvement and subsequent investment.'
  },
  {
    title: 'Water, Waste & Circular Economy',
    slug: 'water-waste-circular-economy',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'oecd-sdmx', note: 'Municipal waste generation/treatment country comparisons.' },
      { provider: 'world-bank-indicators', note: 'Country water-stress indicators; not local supply forecast.' },
    ],
    metaDescription: 'Circular economy and resource recovery, water and marine systems, pollution control and feasibility studies for water and waste operations.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Circular Economy, Waste & Resource Recovery', url: '/domains/environment-nature-circularity#circular-economy-waste-resource-recovery' },
      { title: 'Water, Coastal & Marine Systems', url: '/domains/environment-nature-circularity#water-coastal-marine-systems' },
      { title: 'Environmental Management & Pollution Control', url: '/domains/environment-nature-circularity#environmental-management-pollution-control' },
      { title: 'Feasibility Studies & Business Models', url: '/domains/sustainable-business-esg-finance#feasibility-studies-business-models' },
    ],
    heroNarrative: 'Water scarcity, growing waste streams and rising resource costs are making circular solutions increasingly important. Across water, wastewater and municipal, industrial, hazardous and medical waste, technology assessment and project feasibility can identify opportunities for treatment, reuse, resource recovery and energy recovery.\n\nCircular business models, environmental compliance, finance structuring and operational monitoring help turn those opportunities into viable water, waste and circular-economy projects.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Water and waste projects begin with resource characteristics, service needs and potential markets for recovered products. Technology assessment and feasibility studies test treatment, reuse and recovery options alongside circular business models. Financing and implementation arrangements provide a route to operation, while monitoring examines service quality, environmental compliance and opportunities for renewal or improvement.'
  },
  {
    title: 'Agriculture, Food & Aquaculture',
    slug: 'agriculture-food-aquaculture',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'nasa-power', note: 'Historical solar/meteorological context for farming/irrigation feasibility.' },
      { provider: 'world-bank-indicators', note: 'National agriculture/water/development context after series selection.' },
    ],
    metaDescription: 'Climate risk and resilience, renewable energy, biodiversity and natural capital, and water systems for agriculture, food and aquaculture.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Climate Risk & Resilience', url: '/domains/climate-action-carbon-management#climate-risk-resilience' },
      { title: 'Renewable-Energy Project Development', url: '/domains/energy-systems-transition#renewable-energy-project-development' },
      { title: 'Biodiversity, Ecosystems & Natural Capital', url: '/domains/environment-nature-circularity#biodiversity-ecosystems-natural-capital' },
      { title: 'Water, Coastal & Marine Systems', url: '/domains/environment-nature-circularity#water-coastal-marine-systems' },
    ],
    heroNarrative: 'Food systems sit at the intersection of climate, energy, water, land and biodiversity. Farms, irrigation systems, food processors, fisheries and aquaculture projects can become more resilient through renewable-energy applications, carbon-footprint and lifecycle assessment, sustainable production practices and better management of natural resources.\n\nClimate finance, ESG frameworks and MRV systems can provide the structure needed to fund improvements and demonstrate their environmental, social and commercial results.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Agricultural and food-system investments need to reflect production requirements, market conditions and the availability of water, energy and natural resources. Climate and environmental assessment inform concepts that can be tested through feasibility and financial modelling. Implementation and monitoring then connect investment decisions with productivity, resource efficiency, resilience and environmental performance.'
  },
  {
    title: 'Mining & Natural Resources',
    slug: 'mining-natural-resources',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'gbif-occurrence', note: 'Licence-compatible occurrence context; requires surveys, not evidence of no impact.' },
      { provider: 'climate-trace', note: 'Relevant extraction/source greenhouse gas estimates if coverage exists.' },
    ],
    metaDescription: 'ESIA and safeguards, biodiversity and natural capital, rehabilitation and closure, and responsible supply chains for mining operations.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'ESIA, Strategic Assessment & Safeguards', url: '/domains/environment-nature-circularity#esia-strategic-assessment-safeguards' },
      { title: 'Biodiversity, Ecosystems & Natural Capital', url: '/domains/environment-nature-circularity#biodiversity-ecosystems-natural-capital' },
      { title: 'Rehabilitation, Closure & Monitoring', url: '/domains/environment-nature-circularity#rehabilitation-closure-monitoring' },
      { title: 'Responsible Supply Chains', url: '/domains/sustainable-business-esg-finance#responsible-supply-chains' },
    ],
    heroNarrative: 'Responsible resource development requires environmental and social considerations to remain visible throughout the asset lifecycle. For mining, quarrying and other natural-resource activities, this includes environmental and social assessment, pollution management, energy and emissions reduction, water stewardship, and land and biodiversity management.\n\nRehabilitation and closure liabilities, responsible sourcing and community impacts complete the picture, helping decision-makers understand both immediate operational priorities and long-term obligations.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Resource projects need to account for environmental and community responsibilities as well as operational requirements. Water, energy, pollution-control and rehabilitation opportunities can be developed through assessment, feasibility studies and investment planning. Monitoring, valuation and closure planning help keep remaining liabilities and future land use visible throughout operation and transition.'
  },
  {
    title: 'Tourism, Hospitality & Destinations',
    slug: 'tourism-hospitality-destinations',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'nasa-power', note: 'Historical solar/meteorological context for destinations/hotel feasibility.' },
      { provider: 'gbif-occurrence', note: 'Licence-compatible biodiversity occurrence context for nature-linked destinations.' },
    ],
    metaDescription: 'Energy performance, climate resilience, biodiversity and ESG readiness for tourism operators, hospitality groups and destination managers.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
      { title: 'Climate Risk & Resilience', url: '/domains/climate-action-carbon-management#climate-risk-resilience' },
      { title: 'Biodiversity, Ecosystems & Natural Capital', url: '/domains/environment-nature-circularity#biodiversity-ecosystems-natural-capital' },
      { title: 'ESG Strategy, Readiness & Reporting', url: '/domains/sustainable-business-esg-finance#esg-strategy-readiness-reporting' },
    ],
    heroNarrative: 'Hotels, resorts, destinations and major events increasingly compete on how efficiently and responsibly they operate. Energy, water, waste and carbon baselines provide a clear picture of environmental performance, while climate-resilience assessments reveal how changing conditions may affect assets, operations and visitor destinations.\n\nBiodiversity, community impacts, ESG reporting, certification readiness and sustainable investment planning can then become part of a wider strategy for responsible tourism and hospitality.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Tourism investments can begin with an assessment of energy, water, waste, carbon and climate exposure across an asset or destination. Renewable-energy, efficiency and resilience concepts can then be tested against technical requirements and the business case. Implementation and performance monitoring connect improvements with operating costs, environmental outcomes and the long-term quality of the destination.'
  },
  {
    title: 'Technology, Telecoms & Data Infrastructure',
    slug: 'technology-telecoms-data-infrastructure',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'eia-open-data', note: 'Power-market/generation/selected-price context, geographic coverage labelled.' },
      { provider: 'nasa-power', note: 'Solar and historical meteorological context for early site-energy assessment.' },
    ],
    metaDescription: 'Energy audits, renewable procurement, storage and grid connection, and climate and ESG risk for data centres and telecoms infrastructure.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
      { title: 'Renewable-Energy Project Development', url: '/domains/energy-systems-transition#renewable-energy-project-development' },
      { title: 'Energy Storage, Grids & Power Systems', url: '/domains/energy-systems-transition#energy-storage-grids-power-systems' },
      { title: 'Climate & ESG Risk', url: '/domains/sustainable-business-esg-finance#climate-esg-risk' },
    ],
    heroNarrative: 'The growth of data centres, telecommunications networks and digital infrastructure is bringing energy consumption, water demand and climate exposure into sharper focus.\n\nEnergy efficiency, renewable-energy and storage feasibility, climate-risk assessment, supply-chain emissions, ESG data systems and digital MRV can help digital infrastructure expand with a clearer understanding of its environmental footprint and long-term resource requirements.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Digital-infrastructure projects develop around energy demand, cooling, water use and service reliability. Renewable-energy, storage and resource-efficiency options can be examined through feasibility studies, financial models and risk assessment. Phased delivery and performance monitoring then help manage costs, emissions and capacity as infrastructure expands.'
  },
  {
    title: 'Healthcare, Education & Institutional Estates',
    slug: 'healthcare-education-institutional-estates',
    // I{nn}T tool mapping from the handoff
    relevantTools: [
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
    ],
    // I{nn}D recommended numerical sources from the handoff
    dataSources: [
      { provider: 'nasa-power', note: 'Historical solar/meteorological context for campus/hospital energy feasibility.' },
      { provider: 'world-bank-indicators', note: 'National development/energy/water context, not estate performance data.' },
    ],
    metaDescription: 'Energy performance, decarbonisation pathways, circular economy and ESG readiness for hospitals, campuses and institutional estates.',
    // I{nn}02 offering links - exact capability anchors from the handoff
    workAreas: [
      { title: 'Energy Audits & Performance Assessment', url: '/domains/energy-systems-transition#energy-audits-performance-assessment' },
      { title: 'Decarbonisation & Net-Zero Pathways', url: '/domains/climate-action-carbon-management#decarbonisation-net-zero-pathways' },
      { title: 'Circular Economy, Waste & Resource Recovery', url: '/domains/environment-nature-circularity#circular-economy-waste-resource-recovery' },
      { title: 'ESG Strategy, Readiness & Reporting', url: '/domains/sustainable-business-esg-finance#esg-strategy-readiness-reporting' },
    ],
    heroNarrative: 'Hospitals, universities, schools and other institutional campuses operate complex estates with significant energy, water, waste and climate-resilience needs.\n\nEnergy auditing, decarbonisation planning, renewable-energy feasibility, water and waste management, climate resilience and ESG reporting can provide a pathway from initial assessment and feasibility through financing, implementation support and long-term performance improvement.',
    ctaText: 'Discuss Your Project',
    lifecycleNarrative: 'Institutional projects must improve environmental performance while maintaining essential services. Energy audits and water, waste and carbon assessments identify opportunities that can be developed through feasibility and investment planning. Phased procurement, implementation and monitoring help coordinate improvements with operational continuity, estate renewal and long-term performance.'
  }
];

async function seed() {
  console.log('Seeding industries with real PDF content...');
  const payload = await getPayload({ config: configPromise });

  // Same guard as the domain seed: /tools/[slug] calls notFound() for an unknown
  // slug, so publishing a link to a tool with no CMS record would put a 404 on a
  // live industry page. Handoff p. 4 forbids empty or fake links, and p. 66 says
  // not to assume every tool is publicly launched.
  // Create the real tool records and re-run - the links then publish themselves.
  const existingTools = await payload.find({ collection: 'tools', limit: 200, depth: 0 });
  const liveToolSlugs = new Set(
    (existingTools.docs as { slug?: string | null }[])
      .map((t) => t.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  console.log(`Tool slugs found in CMS: ${[...liveToolSlugs].join(', ') || '(none)'}`);

  const skippedTools = new Set<string>();

  for (const industry of industries) {
    console.log(`Processing industry: ${industry.title}`);

    const resolvableTools = (industry.relevantTools ?? []).filter((tool) => {
      const slug = tool.href.replace(/^\/tools\//, '');
      if (liveToolSlugs.has(slug)) return true;
      skippedTools.add(`${tool.label} (${tool.href})`);
      return false;
    });

    const data = { ...industry, relevantTools: resolvableTools };

    const existing = await payload.find({
      collection: 'industries',
      where: {
        slug: { equals: industry.slug }
      }
    });

    if (existing.docs.length > 0) {
      console.log(`Updating ${industry.title}...`);
      await payload.update({
        collection: 'industries',
        id: existing.docs[0].id,
        data,
      });
    } else {
      console.log(`Creating ${industry.title}...`);
      await payload.create({
        collection: 'industries',
        data,
      });
    }
  }

  console.log('Done seeding industries!');

  if (skippedTools.size > 0) {
    console.log('\nSKIPPED TOOL LINKS - no matching record in the tools collection:');
    for (const t of skippedTools) console.log(`  - ${t}`);
    console.log('Create the tool records, then re-run this script to publish the links.');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
