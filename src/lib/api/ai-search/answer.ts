import { z } from 'zod';

const source = z.object({ id: z.string(), kind: z.literal('web'), title: z.string(), url: z.string().url().refine(s => /^https?:\/\//.test(s)), published_at: z.string().nullable(), retrieved_at: z.string() });
export const searchResultSchema = z.object({
  schema_version: z.literal('1.0'), request_id: z.string(),
  status: z.enum(['complete', 'insufficient', 'refused']), basis: z.enum(['web', 'none']),
  answer: z.array(z.object({ text: z.string(), citations: z.array(z.object({ start: z.number().int().nonnegative(), end: z.number().int().nonnegative(), source_id: z.string() })) })),
  sources: z.array(source), enerqa: z.null(),
}).superRefine((result, ctx) => {
  for (const block of result.answer) for (const cite of block.citations) {
    if (cite.start >= cite.end || cite.end > block.text.length || !result.sources.some(s => s.id === cite.source_id)) ctx.addIssue({ code: 'custom', message: 'Invalid citation span or source.' });
  }
  if (result.status === 'complete' && (!result.answer.some(b => b.text.trim()) || !result.sources.length || result.basis !== 'web')) ctx.addIssue({ code: 'custom', message: 'Answer lacks web evidence.' });
});
export type SearchResult = z.infer<typeof searchResultSchema>;

const providerResponse = z.object({
  status: z.string(),
  output: z.array(z.object({
    type: z.string(), status: z.string().optional(),
    content: z.array(z.object({
      type: z.string(), text: z.string().optional(), refusal: z.string().optional(),
      annotations: z.array(z.object({ type: z.string(), url: z.string().optional(), title: z.string().optional(), start_index: z.number().optional(), end_index: z.number().optional() })).optional(),
    })).optional(),
  })),
});

/** Parse typed Responses items, preserving citation offsets in their own text block. */
export function parseWebAnswer(raw: unknown, requestId: string, retrievedAt = new Date().toISOString()): SearchResult {
  const result: SearchResult = { schema_version: '1.0', request_id: requestId, status: 'insufficient', basis: 'none', answer: [], sources: [], enerqa: null };
  const parsed = providerResponse.safeParse(raw);
  if (!parsed.success || parsed.data.status !== 'completed') return result;
  if (parsed.data.output.some(i => i.content?.some(c => c.type === 'refusal'))) return { ...result, status: 'refused' };
  if (!parsed.data.output.some(i => i.type === 'web_search_call' && i.status === 'completed')) return result;
  const sources: SearchResult['sources'] = [];
  const answer: SearchResult['answer'] = [];
  for (const item of parsed.data.output) {
    if (item.type !== 'message') continue;
    for (const part of item.content ?? []) {
      if (part.type !== 'output_text' || !part.text?.trim()) continue;
      const citations: SearchResult['answer'][number]['citations'] = [];
      for (const annotation of part.annotations ?? []) {
        if (annotation.type !== 'url_citation') continue;
        const { url, start_index: start, end_index: end } = annotation;
        if (!url || !/^https?:\/\//.test(url) || !Number.isInteger(start) || !Number.isInteger(end) || start! < 0 || end! <= start! || end! > part.text.length) return result;
        let existing = sources.find(s => s.url === url);
        if (!existing) {
          existing = { id: `web-${sources.length + 1}`, kind: 'web', title: annotation.title || url, url, published_at: null, retrieved_at: retrievedAt };
          sources.push(existing);
        }
        citations.push({ start: start!, end: end!, source_id: existing.id });
      }
      citations.sort((a, b) => a.start - b.start);
      if (citations.some((c, i) => i > 0 && c.start < citations[i - 1].end)) return result;
      answer.push({ text: part.text, citations });
    }
  }
  if (!sources.length || !answer.length) return result;
  const validated = searchResultSchema.safeParse({ ...result, status: 'complete', basis: 'web', answer, sources });
  return validated.success ? validated.data : result;
}
