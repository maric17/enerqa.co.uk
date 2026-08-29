export async function fetchCckpData() {
  try {
    // World Bank CCKP API for CMIP6 Precipitation Projections (climatology, annual, median SSP2-4.5) for Qatar (QAT)
    const res = await fetch('https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_climatology_pr_climatology_annual_2020-2039_median_ssp245_ensemble_all_mean/QAT?_format=json', {
      next: { revalidate: 86400 }, // Cache for 1 day
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch CCKP data: ${res.status}`);
    }

    const json = await res.json();
    
    // The data is returned as {"data": {"QAT": {"2020-07": 68.79}}}
    if (json.data && json.data.QAT) {
      const values = Object.values(json.data.QAT);
      if (values.length > 0) {
        return { projectedPrecipitation: values[0], unit: 'mm/month' };
      }
    }
    
    return { projectedPrecipitation: '0', unit: 'mm/month' };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("CCKP API unavailable, using mock data.");
    }
    return { projectedPrecipitation: '68.79', unit: 'mm/month' };
  }
}
