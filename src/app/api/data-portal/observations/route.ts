import { NextResponse } from 'next/server';
import catalogue from '@/lib/data-portal/gapminder-catalogue.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const format = searchParams.get('format') || 'json';

  if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

  const record = catalogue.find((c: any) => c.id === id);
  if (!record) return NextResponse.json({ error: 'Not found or disabled' }, { status: 404 });

  try {
    const observations: any[] = [];

    // Fetch all CSV data
    for (const url of record.data_urls) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch dataset from upstream: ${res.status}`);
      
      const csvText = await res.text();
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) continue;

      const headers = lines[0].split(',').map(h => h.trim());
      // Fast Track uses country rather than geo; keep its country IDs intact.
      const geoIdx = ['geo', 'country', 'global'].map(key => headers.indexOf(key)).find(index => index !== -1) ?? -1;
      const timeIdx = headers.indexOf('time');
      const valIdx = headers.indexOf(record.concept);

      if (timeIdx === -1 || valIdx === -1) {
        continue;
      }

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        const geo = geoIdx !== -1 ? row[geoIdx] : 'global';
        const time = row[timeIdx];
        const valStr = row[valIdx];

        // Do not interpolate missing years or coerce missing to zero
        if (valStr === '' || valStr === undefined) {
          continue;
        }

        const value = Number(valStr);
        if (!Number.isFinite(value)) {
          continue; // skip malformed numbers
        }

        observations.push({ geo, time, value });
      }
    }

    if (format === 'csv') {
      const csvOutput = ['geo,time,value'];
      for (const obs of observations) {
        csvOutput.push(`${obs.geo},${obs.time},${obs.value}`);
      }
      return new NextResponse(csvOutput.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${record.concept}.csv"`,
        },
      });
    }

    return NextResponse.json({
      id: record.id,
      name: record.name,
      count: observations.length,
      observations
    });
  } catch (error) {
    console.error('Observation fetch error:', error);
    return NextResponse.json({ error: 'Server error processing data layer' }, { status: 500 });
  }
}
