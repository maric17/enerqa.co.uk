// Q14 approved this exact mapping; stable slugs keep every link canonical.
const government = 'government-regulators-public-institutions';
const oil = 'oil-gas-petrochemicals';
const manufacturing = 'industry-manufacturing-materials';
const infrastructure = 'infrastructure-real-estate-industrial-zones';
const transport = 'transport-logistics-mobility';
const agriculture = 'agriculture-food-aquaculture';
const tourism = 'tourism-hospitality-destinations';
const estates = 'healthcare-education-institutional-estates';
const water = 'water-waste-circular-economy';
const mining = 'mining-natural-resources';
const technology = 'technology-telecoms-data-infrastructure';

export const APPROVED_DOMAIN_INDUSTRIES: Record<string, string[]> = {
  'climate-action-carbon-management': [government, oil, infrastructure, transport, agriculture, tourism, estates],
  'energy-systems-transition': [government, 'energy-utilities', oil, manufacturing, infrastructure, transport, agriculture, tourism, technology, estates],
  'environment-nature-circularity': [government, oil, manufacturing, infrastructure, water, agriculture, mining, tourism, estates],
  'sustainable-business-esg-finance': ['financial-institutions-investors-development-finance', manufacturing, transport, water, mining, tourism, technology, estates],
};

// Q16 confirms these three identities only. Preserve other names and co-authors.
export function approvedByline(byline: string): string {
  return byline
    .replace(/(?:Dr\.\s*)?Quosay\s+(?:A\.\s*)?(?:Ahmed|Awad)(?:,\s*PhD)?/g, 'Quosay Ahmed')
    .replace(/Reem\s+(?:Almalik|Almlik|Elmalik)/g, 'Reem Elmalik')
    .replace(/Amr\s+(?:Nasradin|Nasreldin(?:\s+H\.\s+Abdulhadi)?)/g, 'Amr Nasreldin');
}
