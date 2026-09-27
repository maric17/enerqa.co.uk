import { NextResponse } from 'next/server';
import catalogue from '@/lib/data-portal/gapminder-catalogue.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'current'; // current or full

  if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

  const record = catalogue.find((c: any) => c.id === id);
  if (!record) return NextResponse.json({ error: 'Not found or disabled' }, { status: 404 });

  if (type === 'full') {
    // Return all data URLs directly as a zip or multiple links for full download
    // Since we don't have a zip archiver installed, just return the list of raw links
    // or proxy the first file. Usually "full" means the original source.
    return NextResponse.json({
      message: 'Full download sources',
      urls: record.data_urls,
      licence: record.licence,
      attribution: record.attribution
    });
  }

  // Fallback to proxying the first file
  try {
    const res = await fetch(record.data_urls[0]);
    if (!res.ok) throw new Error('Failed to fetch from upstream');
    const text = await res.text();
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${record.concept}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Error downloading file' }, { status: 500 });
  }
}
