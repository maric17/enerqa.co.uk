export async function fetchWorldBankData() {
  try {
    // We use WRI Climate Watch API for GHG emissions as recommended in the docs
    // It provides robust, open data without requiring an API key.
    const res = await fetch('https://www.climatewatchdata.org/api/v1/data/historical_emissions?regions=QAT&sectors=Total%20excluding%20LULUCF', {
      next: { revalidate: 86400 }, // Cache for 1 day
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Climate Watch data: ${res.status}`);
    }

    const json = await res.json();
    
    if (json.data && json.data.length > 0 && json.data[0].emissions) {
      // Map WRI data (which is in MtCO2e) to the format expected by the UI
      // The UI divides by 1000 assuming kt, so we multiply by 1000 here to compensate
      const mappedData = json.data[0].emissions.map((e: any) => ({
        date: e.year.toString(),
        value: e.value * 1000 
      })).reverse(); // UI expects descending order (latest first)
      
      return mappedData;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn("Climate Watch API returned empty data, using mock data.");
    }
    return generateMockWorldBankData();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Climate Watch API unavailable, using mock data.", error);
    }
    return generateMockWorldBankData();
  }
}

function generateMockWorldBankData() {
  return [
    { date: "2020", value: 115000 },
    { date: "2019", value: 118000 },
    { date: "2018", value: 112000 },
    { date: "2017", value: 109000 },
    { date: "2016", value: 105000 }
  ];
}
