export async function fetchNoaaData() {
  // NOAA API requires an access token.
  // We will return mock data to simulate the integration without failing if a token is not provided.
  // In a real application, you would add your token to .env as NEXT_PUBLIC_NOAA_TOKEN
  
  const token = process.env.NEXT_PUBLIC_NOAA_TOKEN;
  
  if (!token) {
    console.log("No NOAA API Token found. Using mock data.");
    return generateMockNoaaData();
  }

  try {
    // Fetching yearly summaries for a Qatar station as an example
    const res = await fetch('https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&locationid=FIPS:QA&startdate=2015-01-01&enddate=2020-12-31', {
      next: { revalidate: 86400 },
      headers: {
        'token': token,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch NOAA data: ${res.status}`);
    }

    const data = await res.json();
    return data.results || generateMockNoaaData();
  } catch (error) {
    console.error("NOAA Fetch Error:", error);
    return generateMockNoaaData();
  }
}

function generateMockNoaaData() {
  return [
    { date: "2016", datatype: "TAVG", value: 27.5 },
    { date: "2017", datatype: "TAVG", value: 27.8 },
    { date: "2018", datatype: "TAVG", value: 28.1 },
    { date: "2019", datatype: "TAVG", value: 28.5 },
    { date: "2020", datatype: "TAVG", value: 28.2 },
  ];
}
