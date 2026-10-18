import { expect, it, vi } from 'vitest';
const create = vi.hoisted(() => vi.fn());
vi.mock('openai', () => ({ default: class { responses = { create }; } }));
vi.mock('@/lib/api/core/accessCheck', () => ({ firstVerified: vi.fn() }));
import { POST } from './route';

it('keeps unapproved AI search off before any paid call', async () => {
  const response = await POST(new Request('https://enerqa.co.uk/api/ai-search', { method: 'POST', body: JSON.stringify({ query: 'solar energy' }) }));
  expect(response.status).toBe(503);
  expect((await response.json()).error.code).toBe('unavailable');
  expect(create).not.toHaveBeenCalled();
});
