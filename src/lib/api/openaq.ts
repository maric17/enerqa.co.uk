export async function fetchOpenAQData() {
  const token = process.env.OPENAQ_API_KEY;

  if (!token) {
    if (process.env.NODE_ENV !== 'development') {
      console.log("No OpenAQ API Token found. Using mock data.");
    }
    return generateMockOpenAQData();
  }

  try {
    // OpenAQ v3 API 
    // Fetching latest measurements for Doha, Qatar (locations_id 309834)
    const res = await fetch('https://api.openaq.org/v3/locations/309834/latest', {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
        'X-API-Key': token
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch OpenAQ data: ${res.status}`);
    }

    const data = await res.json();
    
    // In V3, the latest endpoint returns sensorsId instead of parameter objects.
    // We map the known sensors for Doha (309834) to their respective parameters.
    const sensorMapping: Record<number, { parameter: string, unit: string }> = {
      1757563: { parameter: "pm25", unit: "µg/m³" },
      1757564: { parameter: "o3", unit: "ppm" },
    };

    const measurements = data.results?.map((m: any) => {
      const mapping = sensorMapping[m.sensorsId];
      if (!mapping) return null;
      return {
        parameter: mapping.parameter,
        value: m.value,
        unit: mapping.unit
      };
    }).filter(Boolean) || [];

    // Fallback if no measurements found
    if (measurements.length === 0) {
       return generateMockOpenAQData();
    }

    return {
      results: [{
        location: "Doha",
        measurements: measurements
      }]
    };
  } catch (error) {
    console.warn("OpenAQ API unavailable or failed, using mock data.");
    return generateMockOpenAQData();
  }
}

function generateMockOpenAQData() {
  return {
    results: [
      {
        location: "Doha",
        measurements: [
          { parameter: "pm25", value: 45.2, unit: "µg/m³" },
          { parameter: "pm10", value: 89.1, unit: "µg/m³" }
        ]
      }
    ]
  };
}
