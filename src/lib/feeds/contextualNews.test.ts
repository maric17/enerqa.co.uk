import { expect, it } from 'vitest';
import { newsIndustries } from './contextual';

const cases = [
  ['financial-institutions-investors-development-finance', 'CBG calls for increased climate finance', 'The bank supports nature-based solutions.',
    'Council publishes climate risk report', 'The council discusses regional adaptation.'],
  ['infrastructure-real-estate-industrial-zones', 'Low-carbon concrete cuts data centre emissions', 'Construction materials can reduce embodied carbon.',
    'AI factory opens in a live environment', 'A software testing platform opens.'],
  ['transport-logistics-mobility', 'TfL consults on zero-emission private hire vehicles', 'The policy reduces vehicle emissions.',
    'AI stocks fall as oil prices rise', 'Investors react to energy prices.'],
  ['agriculture-food-aquaculture', 'Climate finance framework supports small scale farmers', 'Agricultural adaptation protects rural livelihoods.',
    'Stockpile food and wash your hands', 'Could you replace the water mains and regulate the banks?'],
  ['mining-natural-resources', 'Mining and deforestation reshape Amazon rivers', 'Communities lose water.',
    'Power prices fall as solar rebounds | Serbia Energy Mining News', 'Regional electricity prices decline.'],
  ['technology-telecoms-data-infrastructure', 'Low-carbon concrete cuts data centre emissions', 'Construction affects environmental performance.',
    'Technology company appoints a director', 'The company has an office beside a water park.'],
  ['healthcare-education-institutional-estates', 'Hospital signs renewable energy supply deal', 'Power supply supports the medical center.',
    'University appoints oil and gas heir as professor', 'The professor will teach renewable energy research.'],
];

it.each(cases)('requires a main sector subject and concrete context for %s', (slug, title, summary, unrelatedTitle, unrelatedSummary) => {
  // The positive and opposing cases exercise both hero selection and the shared news index.
  expect(newsIndustries({ title, summary })).toContain(slug);
  expect(newsIndustries({ title: unrelatedTitle, summary: unrelatedSummary })).not.toContain(slug);
});
