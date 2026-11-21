import { getIntelligenceIndex } from '@/lib/feeds/intelligenceIndex';
import { filterIntelligence, readingAction, filterUrl } from '@/lib/feeds/intelligence';
import { getPrivacyHref } from '@/lib/policies';
import Link from '@/components/ui/SiteLink';
import copy from '@/lib/i18n/public-page-copy.json';
import { publicCopy, type SiteLanguage } from '@/lib/i18n/publicCopy';
import { intelligenceText } from '@/lib/i18n/intelligence';

export async function ExternalSearchResults({ query, language = 'en' }: { query: string; language?: SiteLanguage }) {
  const t = (text: string) => publicCopy(language, copy, text);
  const [index, privacy] = await Promise.all([getIntelligenceIndex().catch(() => null), getPrivacyHref()]);
  const items = index ? filterIntelligence(index.items, { q: [query] }).slice(0, 6) : [];
  return <section aria-labelledby="other-sources" className="space-y-4">
    <h2 id="other-sources" className="text-2xl font-bold">{t('Other Sources and States')}</h2>
    {items.length ? <ul className="space-y-4">{items.map(item => <li key={item.url} className="rounded border border-gray-200 p-4">
      <h3 className="text-lg font-semibold" dir="auto">{item.title}</h3>
      <p className="text-sm">{item.publisher} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' }) : intelligenceText(language, 'Date not supplied')}</p>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline">{intelligenceText(language, readingAction(item.type))}</a>
    </li>)}</ul> : <p role="status">{t(!index || index.sourcesFailed ? 'External sources are temporarily unavailable.' : 'No open-access external sources match this query.')}</p>}
    <Link href={filterUrl({ q: [query] })} className="underline">{t("Explore Global Intelligence")}</Link>
    <p className="text-sm">{t("Please do not enter confidential information.")}{' '}{privacy && <><Link href={privacy} className="underline">{t("Read our Privacy Notice")}</Link>. </>}<Link href="/contact?intent=general" className="underline">{t("Send search feedback")}</Link>.</p>
  </section>;
}
