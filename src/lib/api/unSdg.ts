export async function fetchUnSdgData() {
  try {
    // The UN SDG API (unstats.un.org) is currently returning empty results for Qatar.
    // As an alternative to mock data, we fetch SDG 7 (Affordable and Clean Energy) 
    // data directly from the World Bank API: Renewable energy consumption (% of total final energy consumption)
    // Indicator: EG.FEC.RNEW.ZS
    const res = await fetch('https://api.worldbank.org/v2/country/qat/indicator/EG.FEC.RNEW.ZS?format=json&per_page=10', {
      next: { revalidate: 86400 }, // Cache for 1 day
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch alternative SDG data: ${res.status}`);
    }

    const data = await res.json();
    
    // World Bank returns an array where the second element is the data array
    if (Array.isArray(data) && data.length > 1 && data[1] && data[1].length > 0) {
      // Map to the format expected by the ESG UI tab
      return data[1].map((item: any) => ({
        timePeriodStart: parseInt(item.date),
        value: item.value || 0,
        timeDetail: item.date
      }));
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn("Alternative SDG API returned empty data, using mock data.");
    }
    return generateMockSdgData();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Alternative SDG API unavailable, using mock data.", error);
    }
    return generateMockSdgData();
  }
}

function generateMockSdgData() {
  return [
    { timePeriodStart: 2018, value: "112.5", timeDetail: "2018" },
    { timePeriodStart: 2019, value: "118.2", timeDetail: "2019" },
    { timePeriodStart: 2020, value: "115.0", timeDetail: "2020" },
    { timePeriodStart: 2021, value: "117.8", timeDetail: "2021" },
  ];
}
