export async function fetchUnOchaData() {
  try {
    // UN OCHA HDX API for humanitarian and risk datasets for Qatar
    const res = await fetch('https://data.humdata.org/api/3/action/package_search?q=Qatar', {
      next: { revalidate: 86400 }, // Cache for 1 day
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch UN OCHA HDX data: ${res.status}`);
    }

    const data = await res.json();
    
    if (data && data.success && data.result) {
      return { datasetCount: data.result.count };
    }
    
    return { datasetCount: 0 };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("UN OCHA API unavailable, using mock data.");
    }
    return { datasetCount: 15 }; // Mock fallback
  }
}
