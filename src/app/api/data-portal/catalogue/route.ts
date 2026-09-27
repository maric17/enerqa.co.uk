import { NextResponse } from 'next/server';
import catalogue from '@/lib/data-portal/gapminder-catalogue.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  let results = catalogue;
  if (q) {
    results = catalogue.filter((c: any) => 
      c.name.toLowerCase().includes(q) || 
      (c.topic && c.topic.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  }

  const paginated = results.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    total: results.length,
    page,
    limit,
    results: paginated.map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic,
      source: c.source,
      licence: c.licence,
    }))
  });
}
