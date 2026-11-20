export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  // Keep the existing preview working while the new host serves files locally.
  if (process.env.NEXT_PUBLIC_MEDIA_STORAGE !== 'local' && url.startsWith('/api/media/file/')) {
    return url.replace('/api/media/file/', 'https://imdzu9d3if2xyauw.public.blob.vercel-storage.com/');
  }
  return url;
}
