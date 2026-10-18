import { getPayload } from 'payload';
import config from '@payload-config';
import { loadDatasetSeries } from '@/lib/data-portal/dataset';
import { readSelection, selectSeries } from '@/lib/data-portal/selection';
import { seriesToCsv, csvFilename } from '@/lib/api/core/csv';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: 'datasets', where: {
    slug: { equals: params.get('slug') ?? '' }, status: { equals: 'verified_open' },
    accessStatus: { equals: 'verified_open' }, redistribution: { equals: true },
  }, limit: 1, depth: 0 });
  const dataset = result.docs[0];
  if (!dataset) return new Response('Dataset unavailable.', { status: 404 });
  const loaded = await loadDatasetSeries(dataset);
  if (!loaded?.ok) return new Response('Source temporarily unavailable.', { status: 503 });
  const selected = selectSeries(loaded.data, readSelection(params));
  if (!selected.length) return new Response('No data matches these filters.', { status: 404 });
  return new Response(seriesToCsv(selected, params.toString()), { headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${csvFilename(dataset.slug.replace(/[^a-z0-9-]/gi, '-'))}"`,
  } });
}
