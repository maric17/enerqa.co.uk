import { describe, expect, it } from 'vitest';
import { mapGdeltArticles } from './gdelt';
import { mapNewsdataResults } from './newsdata';
import { newsImageUrl } from './types';
import { toCard } from '@/components/home/firstFoldNews';

const retrievedAt = '2026-10-02T00:00:00Z';
const url = 'https://www.theguardian.com/environment/climate';
const image = 'https://media.example.com/climate.jpg';

describe('news images', () => {
  it('keeps provider image URLs through to the browser card', () => {
    const [newsdata] = mapNewsdataResults([{ title: 'Climate action', link: url, image_url: image }], retrievedAt);
    const [gdelt] = mapGdeltArticles([{ title: 'Climate action', url, socialimage: image }], retrievedAt);
    expect(toCard(newsdata).imageUrl).toBe(image);
    expect(toCard(gdelt).imageUrl).toBe(image);
  });

  it('handles old cached records without an image', () => {
    const [item] = mapNewsdataResults([{ title: 'Climate action', link: url }], retrievedAt);
    delete item.imageUrl;
    expect(toCard(item).imageUrl).toBeNull();
  });

  // Reject unsafe or broken feed values before they become browser requests.
  it.each([undefined, null, '', 'not a url', 'http://example.com/photo.jpg', 'javascript:alert(1)', 'data:image/png;base64,abc', 'https://user:password@example.com/photo.jpg'])('rejects %s', (value) => {
    expect(newsImageUrl(value)).toBeNull();
  });
});
