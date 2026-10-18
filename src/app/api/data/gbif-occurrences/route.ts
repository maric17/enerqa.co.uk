import { loadOccurrenceExtract, occurrencesToCsv } from '@/lib/api/data/occurrenceExport';
import { failureMessage } from '@/lib/api/core/types';

// Return an ungated, rights-filtered extract; visitors never create a GBIF account.
export async function GET(request: Request) {
  const result = await loadOccurrenceExtract(new URL(request.url).searchParams);
  if (!result.ok) return new Response(failureMessage(result), { status: result.reason === 'no_results' ? 404 : 503 });
  return new Response(occurrencesToCsv(result.data), { headers: { 'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="enerqa-gbif-occurrences.csv"' } });
}
