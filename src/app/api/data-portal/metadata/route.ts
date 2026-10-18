import { NextResponse } from 'next/server';
import catalogue from '@/lib/data-portal/gapminder-catalogue.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

  const record = catalogue.find((c: any) => c.id === id);
  if (!record) return NextResponse.json({ error: 'Not found or disabled' }, { status: 404 });

  return NextResponse.json({
    id: record.id,
    concept: record.concept,
    name: record.name,
    collection: record.collection,
    topic: record.topic,
    source: record.source,
    licence: record.licence,
    attribution: record.attribution,
    data_urls: record.data_urls,
  });
}
