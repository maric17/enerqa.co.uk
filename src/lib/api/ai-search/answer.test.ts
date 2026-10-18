import { describe, it, expect } from 'vitest';
import { parseWebAnswer } from './answer';
const response = (text = 'Source A disagrees with Source B.') => ({ status: 'completed', output: [
  { type: 'web_search_call', status: 'completed' },
  { type: 'message', content: [{ type: 'output_text', text, annotations: [
    { type: 'url_citation', start_index: 0, end_index: 8, url: 'https://example.org/a', title: 'Source A' },
    { type: 'url_citation', start_index: 24, end_index: 32, url: 'https://example.org/b', title: 'Source B' },
  ] }] },
] });
describe('source-led answers', () => {
  it('keeps conflicting sources, offsets and exact text, without an Enerqa promotion', () => {
    const result = parseWebAnswer(response(), 'id');
    expect(result.status).toBe('complete');
    expect(result.sources).toHaveLength(2);
    expect(result.answer[0].text).toBe('Source A disagrees with Source B.');
    expect(result.answer[0].citations[1]).toEqual({ start: 24, end: 32, source_id: 'web-2' });
    expect(result.enerqa).toBeNull();
    expect(result.sources[0].published_at).toBeNull();
  });
  it('does not produce an answer from memory when search did not complete', () => {
    const raw = response(); raw.output[0].status = 'failed';
    expect(parseWebAnswer(raw, 'id').status).toBe('insufficient');
  });
  it.each(['incomplete', 'failed'])('rejects %s provider responses', status => {
    expect(parseWebAnswer({ ...response(), status }, 'id').answer).toEqual([]);
  });
  it('handles refusals and missing citations without substituting keyword results', () => {
    expect(parseWebAnswer({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'Cannot answer' }] }] }, 'id').status).toBe('refused');
    expect(parseWebAnswer({ status: 'completed', output: [{ type: 'web_search_call', status: 'completed' }, { type: 'message', content: [{ type: 'output_text', text: 'Unsupported claim' }] }] }, 'id').answer).toEqual([]);
  });
  it('rejects bad citation offsets and unsafe links', () => {
    expect(parseWebAnswer(response('Short'), 'id').status).toBe('insufficient');
    const raw = response(); raw.output[1].content![0].annotations[0].url = 'javascript:alert(1)';
    expect(parseWebAnswer(raw, 'id').status).toBe('insufficient');
  });
});
