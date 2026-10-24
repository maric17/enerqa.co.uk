import { handleNewsCron } from '@/lib/api/news/cron';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** Stocks and three industry batches each get an independent scheduled invocation. */
export async function GET(request: Request, context: { params: Promise<{ job: string }> }) {
  const { job } = await context.params;
  return handleNewsCron(request, job);
}
