import { handleNewsCron } from '@/lib/api/news/cron';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** Homepage/domain discovery runs independently of stocks and industry batches. */
export async function GET(request: Request) {
  return handleNewsCron(request, 'general');
}
