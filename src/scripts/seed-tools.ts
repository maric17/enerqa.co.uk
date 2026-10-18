import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

// Payload stores rich text as a Lexical tree. Each block is plain text, a
// [bold label, rest] pair (the company profile's "Label: text" style), or a
// list whose items may carry one nested bullet list (the profile's feature lists).
type ListItem = string | { text: string; items: string[] };
type Block = string | [string, string] | { list: 'number' | 'bullet'; items: ListItem[] };
const base = { version: 1, direction: 'ltr', format: '', indent: 0 };
const textNode = (text: string, bold = false) => ({
  type: 'text', version: 1, text, format: bold ? 1 : 0, detail: 0, mode: 'normal', style: '',
});
const listNode = (listType: 'number' | 'bullet', items: ListItem[]): Record<string, unknown> => ({
  ...base,
  type: 'list',
  listType,
  tag: listType === 'number' ? 'ol' : 'ul',
  start: 1,
  // A nested list sits in its own list item, as the Lexical editor saves it;
  // it repeats its parent's `value` so the visible numbering stays 1, 2, 3.
  children: items.flatMap((item, i) =>
    typeof item === 'string'
      ? [{ ...base, type: 'listitem', value: i + 1, children: [textNode(item)] }]
      : [
          { ...base, type: 'listitem', value: i + 1, children: [textNode(item.text)] },
          { ...base, type: 'listitem', value: i + 1, children: [listNode('bullet', item.items)] },
        ],
  ),
});
const lexical = (...blocks: Block[]) => ({
  root: {
    ...base,
    type: 'root',
    children: blocks.map((b) =>
      typeof b === 'string' || Array.isArray(b)
        ? {
            ...base,
            type: 'paragraph',
            textFormat: 0,
            children: typeof b === 'string' ? [textNode(b)] : [textNode(b[0], true), textNode(b[1])],
          }
        : listNode(b.list, b.items),
    ),
  },
});

// All copy is verbatim: flagship `desc`/`purpose` from handoff p. 165 (T02),
// everything else from the company profile (pp. 15-23). Nothing is invented:
// no versions are on record (p. 191 asks for confirmed ones), so `version` is
// null, and every tool defaults to Request Access (p. 191). Only the three
// flagships are validated for publication (pp. 3, 166); the other four stay
// hidden until the company confirms their names and versions.
const P165_ESG =
  'A structured assessment helps organisations understand how their current practices address environmental, social and governance priorities. The ESG Readiness Tool uses criteria and guiding questions to identify readiness gaps and areas for improvement, providing a starting point for a more focused ESG strategy and action plan.';
const P165_EASYSOLAR =
  'Early solar-energy decisions depend on the relationship between available irradiance, electricity demand, system configuration and costs. easySOLAR brings solar PV and battery-storage sizing together with capital and operating costs, financial performance, expected savings and avoided GHG emissions. Its assumptions and uncertainty need to remain visible so that an initial assessment can inform, rather than replace, detailed project feasibility and design.';
const P165_GREENSCALE =
  'Sustainability and resilience in buildings and infrastructure require a structured view of the factors affecting design and performance. GreenScale Pro provides an assessment framework for examining sustainability and resilience criteria and identifying priorities for further development.';
const GHG365 =
  'GHG365 is a comprehensive carbon footprint assessment tool designed to help organizations measure, manage, and mitigate their greenhouse gas (GHG) emissions.';
const MRV = 'Facilitating robust data management and transparent reporting.';
const ESIA = 'Identifying and mitigating environmental and social impacts.';
const GREEN_SCORING = 'Determining eligibility for "Green Finance" initiatives.';

// Fields a re-run clears, so earlier invented copy cannot survive an update.
const EMPTY = { version: null, inputs: null, outputs: null, method: null, assumptions: null, privacy: null };

async function run() {
  const payload = await getPayload({ config: configPromise });

  const tools = [
    {
      ...EMPTY,
      title: 'GHG365 / GHG Emissions Calculator',
      slug: 'ghg365',
      category: 'Emissions Management',
      type: 'interactive',
      validated: false,
      access: 'Request Access',
      desc: GHG365,
      purpose: lexical(GHG365),
      inputs: lexical('Built on international standards such as IPCC guidelines and the GHG Protocol, the tool allows users to input various activity data—including fuel consumption, electricity usage, transportation, waste, and more—to generate detailed emissions reports across Scope 1, 2, and 3 categories.'),
    },
    {
      ...EMPTY,
      title: 'MRV Tool',
      slug: 'mrv-tool',
      category: 'Monitoring',
      type: 'interactive',
      validated: false,
      access: 'Request Access',
      desc: MRV,
      purpose: lexical(MRV),
    },
    {
      ...EMPTY,
      title: 'ESIA Risk Assessment Tool',
      slug: 'esia-risk',
      category: 'Risk Management',
      type: 'informational',
      validated: false,
      access: 'Request Access',
      desc: ESIA,
      purpose: lexical('Enerqa has developed a Risk Assessment Tool that integrates qualitative and quantitative methodologies to systematically evaluate environmental and social risks across all project phases. This tool is particularly instrumental in Environmental and Social Impact Assessment (ESIA) studies and other environmental and climate-related projects.'),
    },
    {
      ...EMPTY,
      title: 'Green Project Scoring Tool',
      slug: 'green-project-scoring',
      category: 'Sustainable Finance',
      type: 'interactive',
      validated: false,
      access: 'Request Access',
      desc: GREEN_SCORING,
      purpose: lexical(GREEN_SCORING),
    },
    {
      ...EMPTY,
      // pp. 3, 165: "ESG Readiness Tool" (was "ESG Readiness Diagnostic").
      title: 'ESG Readiness Tool',
      slug: 'esg-readiness',
      category: 'ESG and Reporting',
      type: 'interactive',
      validated: true,
      access: 'Request Access',
      desc: P165_ESG,
      purpose: lexical(P165_ESG),
      inputs: lexical(
        'The tool simplifies the evaluation of Environmental, Social, and Governance pillars through structured criteria and guiding questions, allowing users to input their practices, score their readiness, and receive tailored recommendations for improvement.',
        'The tool’s Excel format makes it accessible and customizable, enabling organizations of all sizes, especially SMEs, to adapt it to their specific needs without requiring additional software or expertise.',
      ),
    },
    {
      ...EMPTY,
      title: 'easySOLAR',
      slug: 'easysolar',
      category: 'Energy Systems',
      type: 'interactive',
      validated: true,
      access: 'Request Access',
      desc: P165_EASYSOLAR,
      purpose: lexical(P165_EASYSOLAR),
      inputs: lexical(['User-Friendly Interface', ': Features drop-down menus for selections, buttons for data pulling (e.g., irradiance), and default values for quick assessments. Includes guides on Monte Carlo analysis for uncertainty (mentioned in "Explanation" sheet).']),
      outputs: lexical(['Outputs and Visualizations', ': Summarizes results in dedicated sheets (e.g., "Summary of Results" for overview, charts for long-term energy/GHG/cash flows).']),
      // Profile p. 23, "easySOLAR tool's Features". The profile's "(CAPEX and
      // OPE)" after Cost Estimation is left out rather than guessing at the typo.
      method: lexical({
        list: 'number',
        items: [
          'User Input and Configuration',
          { text: 'Technical Sizing and Optimization', items: ['Location and Irradiance Data', 'Load and Consumption Profiling', 'Solar PV Array Sizing', 'Inverter Selection and Sizing', 'BESS Sizing', 'Long-Term Energy Assessment'] },
          { text: 'Financial Analysis', items: ['Cost Estimation', 'Economic Metrics', 'Savings Calculation'] },
          'Environmental Impact Assessment and GHG Emissions Avoidance Calculations',
          { text: 'Data Sources and Assumptions', items: ['Regional Databases', 'Uncertainty and Margins', 'Reference Data'] },
        ],
      }),
      assumptions: lexical(
        ['Limitations', ': Assumes 25-year project life; does not handle real-time data or advanced simulations; regional costs are estimates and may require updates.'],
        ['Scope', ': Primarily for residential/commercial applications, with utility-scale considerations via technology choices.'],
      ),
    },
    {
      ...EMPTY,
      title: 'GreenScale Pro',
      slug: 'greenscale-pro',
      // Was 'Decarbonisation'; p. 165 scopes it to sustainability and resilience.
      category: 'Sustainability and Resilience',
      type: 'interactive',
      validated: true,
      access: 'Request Access',
      desc: P165_GREENSCALE,
      purpose: lexical(P165_GREENSCALE),
      // Profile p. 22, the buildings/infrastructure sustainability-and-resilience
      // tool (p. 165's GreenScale Pro). Scoring method only; nothing implies
      // third-party certification (p. 191).
      inputs: lexical('Enter project data and evidence, score each indicator.'),
      outputs: lexical('Instantly generate:', {
        list: 'number',
        items: ['overall ESRQ score', 'category performance', 'confidence-adjusted results', 'a prioritized action roadmap'],
      }),
      method: lexical('This tool quantifies sustainability and climate resilience performance for buildings and infrastructure using Enerqa’s weighted indicator framework.'),
    },
  ];

  for (const t of tools) {
    try {
      // Match on slug so a re-run updates rather than creating duplicates.
      const existing = await payload.find({
        collection: 'tools',
        where: { slug: { equals: t.slug } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        await payload.update({ collection: 'tools', id: existing.docs[0].id, data: t as any });
        console.log(`Updated tool: ${t.title}`);
      } else {
        await payload.create({ collection: 'tools', data: t as any });
        console.log(`Created tool: ${t.title}`);
      }
    } catch (e) {
      console.error(`Error seeding tool ${t.title}:`, e);
    }
  }

  console.log('Seed Tools complete.');
  process.exit(0);
}

run();
