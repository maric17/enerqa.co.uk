import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ResponseCreateParamsNonStreaming } from 'openai/resources/responses/responses';
import { z } from 'zod';
import { providerEnabled } from '@/lib/api/core/registry';
import { parseWebAnswer } from '@/lib/api/ai-search/answer';
import { AI_SEARCH_CONFIG, WEB_ANSWER_PROMPT } from '@/lib/api/ai-search/config';
import { firstVerified } from '@/lib/api/core/accessCheck';

const requestSchema = z.object({ request_id: z.string().uuid(), query: z.string().trim().min(1).max(2000), locale: z.enum(['en', 'ar']).optional() }).strict();
const error = (requestId: string, code: string, status: number) => NextResponse.json({ request_id: requestId, error: {
  code, message: 'Search is temporarily unavailable; use site navigation or keyword search.', retry_after_seconds: null,
} }, { status });

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  // Both gates must pass before reading credentials or making any paid call.
  if (!providerEnabled('openai') || !AI_SEARCH_CONFIG.releaseReady) return error(requestId, 'unavailable', 503);
  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return error(requestId, 'invalid_request', 400);
  const { query, request_id } = body.data;
  if (!process.env.OPENAI_API_KEY) return error(request_id, 'unavailable', 503);
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 18000 });
    // The installed SDK omits max_tool_calls from this overload; retain the documented API cap.
    const options: ResponseCreateParamsNonStreaming & { max_tool_calls: number } = {
      model: AI_SEARCH_CONFIG.answerModel, store: false, instructions: WEB_ANSWER_PROMPT, input: query,
      tools: [{ type: 'web_search', external_web_access: true }], tool_choice: 'required',
      include: ['web_search_call.action.sources'], max_tool_calls: 3, max_output_tokens: 2400,
    };
    const raw = await client.responses.create(options, { signal: request.signal });
    const result = parseWebAnswer(raw, request_id);
    if (result.status === 'complete') {
      // Do not claim an answer is supported when even one cited destination fails.
      const verified = await firstVerified(result.sources, { url: s => s.url, limit: result.sources.length, maxChecks: 12 });
      if (verified.length !== result.sources.length) return NextResponse.json({ ...result, status: 'insufficient', basis: 'none', answer: [], sources: [] });
    }
    return NextResponse.json(result);
  } catch {
    return error(request_id, 'provider_unavailable', 503);
  }
}
