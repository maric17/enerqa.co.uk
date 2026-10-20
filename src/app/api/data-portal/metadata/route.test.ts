import { expect, it } from 'vitest';
import { GET } from './route';
import { GAPMINDER_ADAPTED_CREDIT, GAPMINDER_LICENCE_URL } from '@/lib/data-portal/attribution';

it('exports exact Gapminder credit and original source metadata without unfinished attribution text', async () => {
  // Use a real catalogue entry so provider credits and the pinned version remain intact.
  const response = await GET(new Request('http://localhost/api/data-portal/metadata?id=wdi:ag_lnd_el5m_ru_k2'));
  const metadata = await response.json();
  expect(metadata.attribution).toBe(`${GAPMINDER_ADAPTED_CREDIT}. Original source(s): ${metadata.source}.`);
  expect(metadata.gapminder_licence_url).toBe(GAPMINDER_LICENCE_URL);
  expect(metadata.licence_url).toBe('https://datacatalog.worldbank.org/int/public-licenses#cc-by');
  expect(metadata.version).toBe('e7a04a08504ca6715e7d2f262ff2ce0295915be9');
  expect(metadata.attribution).not.toContain('[describe');
  expect(metadata.data_urls[0]).toContain(metadata.version);
});
