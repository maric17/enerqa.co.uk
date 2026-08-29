import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache this route for 24 hours

const mockTempData = [
  { year: '2010', tempAnomaly: 0.8 },
  { year: '2012', tempAnomaly: 0.9 },
  { year: '2014', tempAnomaly: 1.1 },
  { year: '2016', tempAnomaly: 1.3 },
  { year: '2018', tempAnomaly: 1.2 },
  { year: '2020', tempAnomaly: 1.5 },
  { year: '2022', tempAnomaly: 1.6 },
  { year: '2024', tempAnomaly: 1.8 },
];

export async function GET(request: Request) {
  try {
    // In a real implementation:
    // const { searchParams } = new URL(request.url)
    // const country = searchParams.get('country') || 'QAT'
    // const res = await fetch(`https://climateknowledgeportal.worldbank.org/api/v1/cru/tas/year/${country}`)
    // const data = await res.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({
      source: 'World Bank CCKP API (Mock)',
      lastUpdated: new Date().toISOString(),
      data: mockTempData,
    });
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature data' },
      { status: 500 }
    );
  }
}
