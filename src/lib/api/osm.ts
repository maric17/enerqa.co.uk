export async function fetchOsmData() {
  try {
    // OpenStreetMap Overpass API to get the count of power plants in Qatar
    const overpassQuery = `[out:json];area["ISO3166-1"="QA"][admin_level=2]->.searchArea;nwr["power"="plant"](area.searchArea);out count;`;
    
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      next: { revalidate: 86400 }, // Cache for 1 day
      signal: AbortSignal.timeout(5000) // 5 second timeout to prevent hanging Next.js
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch OSM data: ${res.status}`);
    }

    const data = await res.json();
    
    if (data && data.elements && data.elements.length > 0) {
      const count = data.elements[0].tags?.total || "0";
      return { powerPlantsCount: count };
    }
    
    return { powerPlantsCount: '0' };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("OSM API unavailable or timed out, using mock data.");
    }
    return { powerPlantsCount: '20' };
  }
}
