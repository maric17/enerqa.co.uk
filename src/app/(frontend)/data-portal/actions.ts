'use server';

import { WORLD_BANK_INDICATORS, type IndicatorKey } from '@/lib/api/data/worldBankIndicators';
import { DATASETS } from '@/lib/data-portal/connectors';
import { failureMessage } from '@/lib/api/core/types';

/** Restrict browser requests to registered source slices and known country codes. */
export async function getExploreData(country: string, indicator: IndicatorKey | 'energy-generation' = 'co2PerCapita') {
  if (!/^[A-Z]{3}$/.test(country) || (indicator !== 'energy-generation' && !Object.hasOwn(WORLD_BANK_INDICATORS, indicator))) {
    return { error: 'Select an available dataset and geography.' };
  }
  const key = indicator === 'energy-generation' ? indicator : 'world-bank-indicator';
  const params = new URLSearchParams({ countries: country, indicator });
  const result = await DATASETS[key].handler(params);
  return result.ok ? { data: result.data } : { error: failureMessage(result) };
}
