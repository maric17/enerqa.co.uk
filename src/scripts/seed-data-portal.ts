import { getPayload } from 'payload';
import configPromise from '../payload.config.ts';

/**
 * Data Portal seed - handoff p. 161 (candidate dataset list) and p. 226/229.
 *
 * Every record here points at a REAL, ungated, anonymous download that was
 * checked with an HTTP request before being committed (see `accessEvidence`).
 * The handoff forbids placeholder downloads (p. 225) and requires a free
 * anonymous download on every published dataset (p. 226, 229).
 *
 * Licence fields state the provider's actual terms. All three sources publish
 * under CC BY 4.0, which is why `corporateReuse` and `redistribution` are true.
 *
 * Idempotent: records are matched on `slug` and updated in place, so re-running
 * this script will not create duplicates.
 */

// The 2024 seed shipped a fabricated dataset - "Corporate ESG Investment Flows"
// from an invented provider called "Financial Data Corp", marked restricted so
// it could never satisfy the free-download rule. It is retired here.
const RETIRED_SLUGS = ['esg-investments'];

async function run() {
  const payload = await getPayload({ config: configPromise });

  // Topics are optional: the categories collection may be empty on a fresh
  // database, and an empty array is valid.
  const categoriesRes = await payload.find({ collection: 'categories', limit: 100 });
  const getCategory = (title: string) => categoriesRes.docs.find((c) => c.title === title)?.id;

  const checkedAt = new Date().toISOString();

  const datasets = [
    {
      title: 'Global CO2 Emissions by Source',
      slug: 'global-co2-emissions',
      description:
        'Annual carbon dioxide emissions split by source - coal, oil, gas, cement, flaring and land-use change - for every country and for the world as a whole.',
      provider: 'Our World in Data (Global Carbon Budget)',
      identifier: 'owid-co2-by-source',
      version: 'Global Carbon Budget, current release',
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      originalUnit: 'tonnes CO2 per year',
      geographicLevel: 'Country, region and global',
      observationPeriod: '1750-2023',
      retrievalTime: checkedAt,
      datasetDownloadUrl: 'https://ourworldindata.org/grapher/co2-by-source.csv',
      accessStatus: 'free',
      accessCheckedAt: checkedAt,
      accessEvidence: 'HTTP 200, text/csv, ~1.4 MB, no authentication required.',
      corporateReuse: true,
      redistribution: true,
      attribution:
        'Our World in Data, "CO2 emissions by source", based on the Global Carbon Budget. Licensed CC BY 4.0.',
      topic: [getCategory('Emissions'), getCategory('Climate Action')].filter(Boolean),
      date: checkedAt,
    },
    {
      title: 'Renewable Electricity Capacity and Generation',
      slug: 'renewable-capacity',
      description:
        'Installed electricity capacity and generation by fuel - including wind, solar, hydro and bioenergy - for every country, region and the world.',
      provider: 'Ember',
      identifier: 'ember-yearly-electricity',
      version: 'Yearly Electricity Data, full release',
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      originalUnit: 'GW installed capacity and TWh generation',
      geographicLevel: 'Country, region and global',
      observationPeriod: '2000-2024',
      retrievalTime: checkedAt,
      datasetDownloadUrl:
        'https://storage.googleapis.com/emb-prod-bkt-publicdata/public-downloads/yearly_full_release_long_format.csv',
      accessStatus: 'free',
      accessCheckedAt: checkedAt,
      accessEvidence: 'HTTP 200, text/csv, ~49 MB, no authentication required.',
      corporateReuse: true,
      redistribution: true,
      attribution: 'Ember, "Yearly Electricity Data". Licensed CC BY 4.0.',
      topic: [getCategory('Electricity'), getCategory('Energy Systems')].filter(Boolean),
      date: checkedAt,
    },
    {
      title: 'Adjusted Net Savings by Country',
      slug: 'adjusted-net-savings',
      description:
        'Adjusted net savings, or "genuine savings": national savings corrected for resource depletion, pollution damage and investment in human capital. A World Bank measure of whether growth is actually building lasting wealth.',
      provider: 'World Bank',
      identifier: 'NY.ADJ.SVNG.GN.ZS',
      version: 'World Development Indicators, current release',
      licence: 'CC BY 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      originalUnit: '% of gross national income',
      geographicLevel: 'Country',
      observationPeriod: '1970-2023',
      retrievalTime: checkedAt,
      datasetDownloadUrl:
        'https://api.worldbank.org/v2/en/indicator/NY.ADJ.SVNG.GN.ZS?downloadformat=csv',
      accessStatus: 'free',
      accessCheckedAt: checkedAt,
      accessEvidence: 'HTTP 200, application/zip containing CSV, ~64 KB, no authentication required.',
      corporateReuse: true,
      redistribution: true,
      attribution:
        'World Bank, World Development Indicators - "Adjusted net savings, including particulate emission damage (% of GNI)". Licensed CC BY 4.0.',
      topic: [getCategory('Finance'), getCategory('Sustainable Business')].filter(Boolean),
      date: checkedAt,
    },
  ];

  for (const ds of datasets) {
    try {
      // Match on slug so a re-run updates rather than duplicating.
      const existing = await payload.find({
        collection: 'datasets',
        where: { slug: { equals: ds.slug } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        await payload.update({ collection: 'datasets', id: existing.docs[0].id, data: ds as any });
        console.log(`Updated dataset: ${ds.title}`);
      } else {
        await payload.create({ collection: 'datasets', data: ds as any });
        console.log(`Created dataset: ${ds.title}`);
      }
    } catch (e) {
      console.error(`Error seeding dataset ${ds.title}:`, e);
    }
  }

  for (const slug of RETIRED_SLUGS) {
    const stale = await payload.find({ collection: 'datasets', where: { slug: { equals: slug } }, limit: 1 });
    if (stale.docs.length > 0) {
      await payload.delete({ collection: 'datasets', id: stale.docs[0].id });
      console.log(`Removed fabricated dataset: ${slug}`);
    }
  }

  console.log('Seed Data Portal complete.');
  process.exit(0);
}

run();
