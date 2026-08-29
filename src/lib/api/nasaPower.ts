export async function fetchNasaPowerData() {
  try {
    // NASA POWER API for daily temperature and solar radiation
    // Using a recent 7 day window for Qatar (approx lat 25.2, lon 51.5)
    // In a real app, dates should be calculated dynamically.
    const today = new Date();
    today.setDate(today.getDate() - 2); // Get data from 2 days ago to ensure availability
    const end = today.toISOString().split('T')[0].replace(/-/g, '');
    today.setDate(today.getDate() - 7);
    const start = today.toISOString().split('T')[0].replace(/-/g, '');

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=51.5&latitude=25.2&start=${start}&end=${end}&format=JSON`;
    
    const res = await fetch(url, {
      next: { revalidate: 3600 * 12 }, // Cache for 12 hours
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch NASA POWER data: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("NASA POWER Fetch Error:", error);
    // Return mock data for UI demo purposes if API fails
    return {
      properties: {
        parameter: {
          T2M: {
            "20240101": 22.5,
            "20240102": 23.1,
            "20240103": 21.8,
            "20240104": 22.0,
            "20240105": 24.2,
          },
          ALLSKY_SFC_SW_DWN: {
            "20240101": 4.5,
            "20240102": 4.6,
            "20240103": 4.2,
            "20240104": 4.8,
            "20240105": 5.1,
          }
        }
      }
    };
  }
}
