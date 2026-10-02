import { getIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';
import { filterIntelligence, readingAction, filterUrl } from '@/lib/feeds/intelligence';
import { getPrivacyHref } from '@/lib/policies';

export async function ExternalSearchResults({ query }: { query: string }) {
  const [index, privacy] = await Promise.all([getIntelligenceIndex().catch(() => null), getPrivacyHref()]);
  const items = index ? filterIntelligence(index.items, { q: [query] }).slice(0, 6) : [];
  return <section aria-labelledby="other-sources" className="space-y-4">
    <h2 id="other-sources" className="text-2xl font-bold">Other Sources and States</h2>
    {items.length ? <ul className="space-y-4">{items.map(item => <li key={item.url} className="rounded border border-gray-200 p-4">
      <h3 className="text-lg font-semibold" dir="auto">{item.title}</h3>
      <p className="text-sm">{item.publisher} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : 'Date not supplied'}</p>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline">{readingAction(item.type)}</a>
    </li>)}</ul> : <p role="status">{!index || index.sourcesFailed ? 'External sources are temporarily unavailable.' : 'No open-access external sources match this query.'}</p>}
    <a href={filterUrl({ q: [query] })} className="underline">Explore Global Intelligence</a>
    <p className="text-sm">Please do not enter confidential information. {privacy && <><a href={privacy} className="underline">Read our Privacy Notice</a>. </>}<a href="/contact?intent=general" className="underline">Send search feedback</a>.</p>
  </section>;
}
