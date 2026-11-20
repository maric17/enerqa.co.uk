import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMediaUrl } from './utils';

afterEach(() => vi.unstubAllEnvs());

describe('media URLs', () => {
  it('uses the mounted media route on the local-storage deployment', () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_STORAGE', 'local');
    expect(resolveMediaUrl('/api/media/file/report.pdf')).toBe('/api/media/file/report.pdf');
  });

  it('keeps the existing Blob URL for the current preview', () => {
    vi.stubEnv('NEXT_PUBLIC_MEDIA_STORAGE', 'blob');
    expect(resolveMediaUrl('/api/media/file/report.pdf')).toBe('https://imdzu9d3if2xyauw.public.blob.vercel-storage.com/report.pdf');
  });
});
