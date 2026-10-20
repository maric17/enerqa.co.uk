import { NextResponse } from 'next/server';
import catalogue from '@/lib/data-portal/gapminder-catalogue.json';
import { gapminderDataAttribution, GAPMINDER_LICENCE_URL } from '@/lib/data-portal/attribution';

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
    // Preserve the indicator's own terms separately from Gapminder's citation.
    licence_url: record.attribution.match(/Licence\/terms: (https?:\/\/\S+)/)?.[1].replace(/\.$/, '') ?? null,
    attribution: gapminderDataAttribution(record.source),
    gapminder_licence_url: GAPMINDER_LICENCE_URL,
    version: record.commit,
    data_urls: record.data_urls,
  });
}
