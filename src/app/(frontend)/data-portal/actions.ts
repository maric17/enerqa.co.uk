'use server';

import { fetchIndicator, WORLD_BANK_INDICATORS, IndicatorKey } from '@/lib/api/data/worldBankIndicators';

export async function getExploreData(country: string, indicator: IndicatorKey = 'co2PerCapita') {
  const result = await fetchIndicator({
    countries: [country],
    indicator,
  });
  
  if (!result.ok) {
    return { error: result.reason || 'Failed to fetch data' };
  }
  
  return { data: result.data };
}
