import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

// Payload stores rich text as a Lexical tree. These seeds only ever need a
// single paragraph, so wrap the plain string once instead of repeating the
// nine lines of boilerplate for every field.
const lexical = (text: string) => ({
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text, version: 1 }] }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
});

async function run() {
  const payload = await getPayload({ config: configPromise });

  const tools = [
    {
      title: 'GHG365 / GHG Emissions Calculator',
      slug: 'ghg365',
      category: 'Emissions Management',
      type: 'interactive',
      desc: 'A comprehensive greenhouse gas (GHG) calculator for Scope 1, 2, and 3 emissions tracking.',
      version: 'v2.1',
      access: 'Request Access',
      purpose: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'GHG365 is designed to help organisations systematically measure, report, and manage their carbon footprint across all three scopes in alignment with the GHG Protocol.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      },
      inputs: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Fuel consumption, electricity usage, value chain data (purchased goods, business travel).', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      },
      outputs: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Carbon equivalent (CO2e) emissions by scope and category, baseline comparisons, and projected reduction pathways.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      },
      method: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Uses IPCC assessment report global warming potentials and local grid emission factors.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      },
      privacy: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'All data is stored in isolated tenant environments.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      }
    },
    {
      title: 'MRV Tool',
      slug: 'mrv-tool',
      category: 'Monitoring',
      type: 'interactive',
      desc: 'Monitoring, Reporting and Verification tool for carbon credit projects.',
      version: '1.0',
      access: 'Enterprise',
      purpose: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'To digitize the MRV lifecycle for nature-based and technological carbon removal projects.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      }
    },
    {
      title: 'ESIA Risk Assessment Tool',
      slug: 'esia-risk',
      category: 'Risk Management',
      type: 'informational',
      desc: 'Toolkit for screening Environmental and Social Impact Assessment risks for infrastructure projects.',
      version: '2024 Release',
      access: 'Public',
      purpose: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Helps developers identify red-flag ESG risks early in the site-selection phase.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      }
    },
    {
      title: 'Green Project Scoring Tool',
      slug: 'green-project-scoring',
      category: 'Sustainable Finance',
      type: 'interactive',
      desc: 'Aligns projects with green taxonomy criteria for sustainable finance eligibility.',
      version: '1.2',
      access: 'Request Access',
      purpose: {
        root: {
          type: 'root',
          children: [{
            type: 'paragraph',
            children: [{ type: 'text', text: 'Evaluates capital projects against the EU Taxonomy and other regional green finance frameworks.', version: 1 }]
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      }
    },
    {
      // Copy below is taken verbatim from the approved marketing sections on
      // /tools (T02, T03, T04). `version` is deliberately left unset: the
      // handoff (p. 166) requires validated versions, and these three have
      // none yet. `access` defaults to Request Access per p. 188 (TD01).
      title: 'ESG Readiness Diagnostic',
      slug: 'esg-readiness',
      category: 'ESG and Reporting',
      type: 'interactive',
      desc: 'A structured assessment of reporting maturity, governance and data availability against the principal international sustainability standards.',
      access: 'Request Access',
      purpose: lexical('Navigating the expanding landscape of mandatory sustainability reporting (including CSRD, IFRS S1/S2 and regional taxonomies) requires a clear understanding of current capabilities and data gaps. The ESG Readiness Diagnostic provides a structured assessment of your organisation\'s reporting maturity, governance structures and data availability against principal international standards.'),
      outputs: lexical('A maturity rating across Governance & Strategy, Metrics & Targets (GHG) and Value Chain Assessment, with a prioritised action list to work through before formal assurance or compliance exercises.'),
    },
    {
      title: 'easySOLAR',
      slug: 'easysolar',
      category: 'Energy Systems',
      type: 'interactive',
      desc: 'Preliminary sizing and financial calculator for commercial and industrial rooftop solar and battery energy storage systems.',
      access: 'Request Access',
      purpose: lexical('Assessing the commercial and technical viability of commercial and industrial (C&I) rooftop solar requires rapid processing of load profiles, solar resource data and local tariff structures. easySOLAR helps facility owners and developers establish an initial business case, optimise system sizing for self-consumption, and compare financing options before committing to detailed engineering design.'),
      inputs: lexical('Site load profile, local solar resource data and applicable electricity tariff structure.'),
      outputs: lexical('Estimated system size, annual generation, payback period and 20-year IRR.'),
    },
    {
      title: 'GreenScale Pro',
      slug: 'greenscale-pro',
      category: 'Decarbonisation',
      type: 'interactive',
      desc: 'Scenario-modelling platform for industrial facility operators and project developers comparing decarbonisation pathways.',
      access: 'Request Access',
      purpose: lexical('Industrial decarbonisation often involves complex trade-offs between energy efficiency, electrification, alternative fuels (such as green hydrogen) and carbon capture. GreenScale Pro allows users to compare abatement pathways based on their marginal abatement cost, technology readiness, and impact on production economics over a defined transition period.'),
      outputs: lexical('Comparative pathways across energy efficiency, electrification (heat pumps) and green hydrogen substitution, ranked by marginal abatement cost and technology readiness.'),
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
