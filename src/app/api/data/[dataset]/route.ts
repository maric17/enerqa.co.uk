import { seriesToCsv, csvFilename } from '@/lib/api/core/csv';
import { failureMessage } from '@/lib/api/core/types';
import { readSelection, selectSeries } from '@/lib/data-portal/selection';
import { DATASETS } from '@/lib/data-portal/connectors';

export const revalidate = 3600;

export async function GET(request: Request, { params }: { params: Promise<{ dataset: string }> }) {
  const { dataset } = await params;
  const entry = Object.hasOwn(DATASETS, dataset) ? DATASETS[dataset] : null;

  if (!entry) {
    return new Response(`Unknown dataset "${dataset}".\n`, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const searchParams = new URL(request.url).searchParams;
  const result = await entry.handler(searchParams);

  if (!result.ok) {
    // An honest plain-text explanation, never an empty CSV that looks like
    // a dataset with no rows (p. 226).
    return new Response(`# ${entry.title}\n# ${failureMessage(result)}\n# ${result.message}\n`, {
      status: result.reason === 'no_results' ? 404 : 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const filters = [...searchParams.entries()].map(([k, v]) => `${k}=${v}`).join(', ');
  const selected = selectSeries(result.data, readSelection(searchParams));
  if (!selected.length) return new Response('No data matches these filters.', { status: 404 });
  const csv = seriesToCsv(selected, filters || 'default selection');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename(dataset)}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
