import geographies from './gapminder-geographies.json';
import { timeCoordinate } from './timePeriods';

export type Observation = { geo: string; time: string; value: number };
export type ChartObservation = Observation & { x: number };

const fullNames: Record<string, string> = {
  UK: 'United Kingdom',
  USA: 'United States',
  UAE: 'United Arab Emirates',
  USSR: 'Soviet Union',
  Lao: 'Laos',
  'Congo, Dem. Rep.': 'Democratic Republic of the Congo',
  'Congo, Rep.': 'Republic of the Congo',
  'Micronesia, Fed. Sts.': 'Federated States of Micronesia',
};

// These names come from the same pinned entity definitions as the catalogue.
// Resolve both Gapminder IDs and ISO aliases without changing source data IDs.
export function countryName(geo: string): string {
  const name = (geographies as Record<string, string>)[geo.toLowerCase()] ?? geo;
  // Gapminder itself abbreviates these names; spell them out in the interface.
  return fullNames[name] ?? name.replaceAll('St.', 'Saint').replace(' (U.S.)', ' (United States)');
}

export function matchIndicators(
  yObservations: Observation[],
  xObservations: Observation[] | null,
): ChartObservation[] {
  const xValues = new Map(xObservations?.map(o => [`${o.geo.toLowerCase()}\t${o.time}`, o.value]));
  return yObservations.flatMap(o => {
    // Match exact country/time pairs before aggregation so missing values cannot be paired.
    const x = xObservations === null ? timeCoordinate(o.time) : xValues.get(`${o.geo.toLowerCase()}\t${o.time}`);
    return x !== undefined && Number.isFinite(x) && Number.isFinite(o.value) ? [{ ...o, x }] : [];
  });
}
