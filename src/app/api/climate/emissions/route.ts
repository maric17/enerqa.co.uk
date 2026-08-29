import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache this route for 24 hours

// Mock data to simulate the WRI Climate Watch API response
const mockEmissionsData = [
  { year: '2015', Qatar: 110, Oman: 80, UAE: 210, target: 120 },
  { year: '2016', Qatar: 115, Oman: 82, UAE: 215, target: 115 },
  { year: '2017', Qatar: 108, Oman: 79, UAE: 205, target: 110 },
  { year: '2018', Qatar: 105, Oman: 75, UAE: 200, target: 105 },
  { year: '2019', Qatar: 102, Oman: 73, UAE: 195, target: 100 },
  { year: '2020', Qatar: 95, Oman: 68, UAE: 180, target: 95 },
  { year: '2021', Qatar: 98, Oman: 70, UAE: 185, target: 90 },
  { year: '2022', Qatar: 92, Oman: 65, UAE: 175, target: 85 },
  { year: '2023', Qatar: 88, Oman: 62, UAE: 170, target: 80 },
];

export async function GET(request: Request) {
  try {
    // In a real implementation, you would extract searchParams and fetch from the external API:
    // const { searchParams } = new URL(request.url)
    // const country = searchParams.get('country') || 'QAT'
    // const res = await fetch(`https://api.climatewatchdata.org/v1/emissions?location=${country}`)
    // const data = await res.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      source: 'WRI Climate Watch (Mock)',
      lastUpdated: new Date().toISOString(),
      data: mockEmissionsData,
    });
  } catch (error) {
    console.error('Error fetching emissions data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emissions data' },
      { status: 500 }
    );
  }
}
