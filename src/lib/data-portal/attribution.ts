// Exact adapted-material citation published at gapminder.org/free-material/.
export const GAPMINDER_ADAPTED_CREDIT = 'Based on free material from GAPMINDER.ORG, CC-BY LICENSE';
export const GAPMINDER_LICENCE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/** Keep the original provider credit alongside Gapminder's published wording. */
export function gapminderDataAttribution(source: string) {
  return `${GAPMINDER_ADAPTED_CREDIT}. Original source(s): ${source}.`;
}
