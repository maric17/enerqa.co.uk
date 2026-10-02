import { describe, expect, it } from 'vitest';
import { publicationImage } from './publicationImage';

const photo = { url: '/api/media/file/article.webp', mimeType: 'image/webp', alt: 'Solar panels' };
const upload = (value: unknown) => ({ type: 'upload', value });

describe('publication cover selection', () => {
  it('uses the featured image ahead of sharing and body images', () => {
    expect(publicationImage({
      featuredImage: photo,
      ogImage: { ...photo, url: '/social.jpg' },
      content: { root: { children: [upload({ ...photo, url: '/body.jpg' })] } },
    })).toEqual({ src: 'https://imdzu9d3if2xyauw.public.blob.vercel-storage.com/article.webp', alt: 'Solar panels' });
  });

  it('falls back to the sharing image when the featured upload is unavailable', () => {
    expect(publicationImage({ featuredImage: 42, ogImage: photo })?.alt).toBe('Solar panels');
  });

  it('prefers the chosen cover over body images and resolves stored media URLs', () => {
    expect(publicationImage({ ogImage: photo, content: { root: { children: [upload({ ...photo, url: '/body.jpg' })] } } })).toEqual({
      src: 'https://imdzu9d3if2xyauw.public.blob.vercel-storage.com/article.webp', alt: 'Solar panels',
    });
  });

  it('skips document uploads and finds images inside nested article blocks', () => {
    // A PDF before a nested photo must not prevent the photo becoming the cover.
    const content = { root: { children: [upload({ url: '/report.pdf', mimeType: 'application/pdf' }), {
      type: 'block', fields: { items: [{ content: { root: { children: [upload(photo)] } } }] },
    }] } };
    expect(publicationImage({ ogImage: 42, content })?.alt).toBe('Solar panels');
  });

  it('uses image extensions for older media records without a MIME type', () => {
    expect(publicationImage({ ogImage: { url: '/cover.jpg?version=2' } })).toEqual({ src: '/cover.jpg?version=2', alt: '' });
  });

  it('uses the branded fallback for missing, unresolved or non-image media', () => {
    expect(publicationImage({})).toBeNull();
    expect(publicationImage({ ogImage: 42, content: { root: { children: [upload(24)] } } })).toBeNull();
    expect(publicationImage({ ogImage: { url: '/report.pdf', mimeType: 'application/pdf' } })).toBeNull();
  });
});
