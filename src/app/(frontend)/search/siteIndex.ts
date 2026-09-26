import type { IndexEntry } from './searchIndex';

/**
 * Hub pages that are not CMS records. p. 227 asks for the canonical
 * domain/capability, industry, lifecycle, publication, dataset and tool pages;
 * these are the hubs above them. Every route here must exist - the old list
 * pointed at /data-portal/datasets, which 404s. Excerpts are the pages' own
 * approved intro copy from the handoff (page cited on each).
 */
export const SITE_INDEX: IndexEntry[] = [
  {
    title: 'Domains and Industries',
    url: '/domains-and-industries',
    group: 'domains',
    category: 'Overview',
    // p. 19 O01
    excerpt:
      'Enerqa’s work is organised around four interconnected domains. Project development connects them, drawing on data, modelling, digital tools, MRV, research, institutional strengthening and capacity building wherever they add value.',
  },
  {
    title: 'Project Development and Lifecycle Support',
    url: '/project-development',
    group: 'domains',
    category: 'Lifecycle',
    // p. 145 P01
    excerpt:
      'Projects are better positioned for investment and successful delivery when the underlying opportunity is clearly defined, thoroughly tested and properly structured. An initial need or idea must be developed into a coherent concept, assessed for technical, commercial, financial, environmental and social feasibility, and translated into a credible business and delivery model.',
    body:
      'Project development is the common approach that connects Enerqa’s work across climate action, energy transition, environment, nature, circularity, ESG and sustainable finance. It brings the different dimensions of a project together so that technical studies, commercial decisions, environmental responsibilities, financing requirements and implementation arrangements reinforce one another. An engagement may begin with needs assessment, research and opportunity identification before progressing into concept development, pre-feasibility and detailed feasibility studies. Business and financial modelling then clarify how the project could operate, create value, attract finance and remain viable over time. Once viability has been established, the focus moves towards delivery. This may involve structuring finance and partnerships, informing project design, preparing tender and procurement documentation, supporting implementation and establishing systems for performance measurement. Measurement, reporting and verification (MRV) and monitoring and evaluation (M&E) provide the evidence needed to track results, meet reporting obligations and guide improvement.',
  },
  {
    title: 'Knowledge Hub',
    url: '/knowledge-hub',
    group: 'publications',
    category: 'Overview',
    // p. 155 K01
    excerpt: 'Explore original Enerqa analysis alongside open-access news, research and official updates from around the world.',
  },
  {
    title: 'Data Portal',
    url: '/data-portal',
    group: 'data',
    category: 'Overview',
    // p. 160 D01
    excerpt:
      'Explore open-access data relevant to climate, energy, environment, nature, circularity, business and finance. Search datasets supplied through free APIs, compare trends through charts and tables, and download the available data free of charge.',
  },
  {
    title: 'Sources and Methodology',
    url: '/data-portal/sources',
    group: 'data',
    category: 'Overview',
    // p. 161
    excerpt:
      'Review where the data comes from, what it measures and how it can be reused. Source notes explain coverage, units, limitations, update schedules and any transformations made for display.',
  },
  {
    title: 'Enerqa Tools',
    url: '/tools',
    group: 'tools',
    category: 'Overview',
    // p. 165 T01
    excerpt:
      'Explore tools designed to structure assessment, modelling and sustainability decisions. Each tool explains its purpose, inputs, outputs, assumptions and available access route.',
  },
];
