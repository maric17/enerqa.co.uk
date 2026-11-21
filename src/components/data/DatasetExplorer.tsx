import copy from '@/lib/i18n/data-portal-copy.json';
import { publicCopy, type SiteLanguage } from '@/lib/i18n/publicCopy';
import type { DataSeries } from '@/lib/api/core/types';
import { DataSeriesTable } from './DataSeriesTable';
import { selectSeries, type Selection } from '@/lib/data-portal/selection';
import Link, { SiteGetForm } from '@/components/ui/SiteLink';
import { pilotHref } from '@/lib/i18n/pilot';

export function DatasetExplorer({ data, selection, slug, stale = false, actionHref, query, language = 'en' }: { data: DataSeries[]; selection: Selection; slug: string; stale?: boolean; actionHref?: string; query?: string; language?: SiteLanguage }) {
  const t = (text: string) => publicCopy(language, copy, text);
  const href = pilotHref(language, actionHref ?? `/data-portal/datasets/${slug}`);
  // Keep connector settings when the visitor changes observation filters.
  const retained = [...new URLSearchParams(query).entries()].filter(([key]) => !['series', 'area', 'from', 'to'].includes(key));
  const selected = selectSeries(data, selection);
  const periods = [...new Set(data.flatMap(s => s.observations.map(o => o.period.includes('T') ? o.period.slice(0, 10) : o.period)))].sort();
  const areas = [...new Set(data.flatMap(s => s.area ? [s.area] : []))];
  return <>
    <section aria-labelledby="explore-data">
      <h2 id="explore-data" className="text-2xl font-bold mb-4">{t("Explore the Data")}</h2>
      <SiteGetForm action={`${href}#explore-data`} className="flex flex-wrap items-end gap-4">
        {retained.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
        {([
          ['series', 'Series', data.map(s => [s.id, `${s.label} (${s.unit})`])],
          ['area', 'Geography', areas.map(a => [a, a])],
          ['from', 'From period', periods.map(p => [p, p])],
          ['to', 'To period', periods.map(p => [p, p])],
        ] as [keyof Selection, string, string[][]][]).map(([key, label, values]) => <label key={key} className="flex min-w-0 max-w-full flex-col gap-1 text-sm">
          {t(label)}<select name={key} defaultValue={selection[key] ?? ''} className="w-full min-w-0 max-w-full rounded border border-gray-300 p-2">
            <option value="">{t("All available")}</option>{values.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </label>)}
        <button className="rounded bg-[var(--color-dark)] text-white px-4 py-2">{t("Apply filters")}</button>
        <Link href={`${href}${retained.length ? `?${new URLSearchParams(retained)}` : ""}#explore-data`} className="underline">{t("Clear filters")}</Link>
      </SiteGetForm>
    </section>
    <section aria-labelledby="data-views">
      <h2 id="data-views" className="text-2xl font-bold mb-4">{t("Chart Table and Map")}</h2>
      <Link href={pilotHref(language, '/data-portal/sources')} className="underline">{t("Sources and Methodology")}</Link>
      {selected.length === 0 && <p role="status">{t("No data matches these filters. Change the selection or clear filters.")}</p>}
      {/* Separate panels preserve unlike units, frequency and measure bases. */}
      {selected.map(s => {
        const max = Math.max(1, ...s.observations.map(o => Math.abs(o.value ?? 0)));
        const latest = [...s.observations].sort((a, b) => b.period.localeCompare(a.period))[0];
        return <div key={s.id} className="my-8 space-y-4">
          <h3 className="text-xl font-semibold">{s.label} — {s.area ?? t('Geography not specified')}</h3>
          <p className="text-sm">{s.unit} · {s.frequency} · {s.provenance.providerName}{t(". Latest returned period:")} {latest.period}; {latest.value === null ? t('no figure published') : `${latest.value.toLocaleString('en-GB')} ${s.unit}`}{latest.flag ? ` (${latest.flag})` : ''}.</p>
          <figure className="m-0" aria-label={`${s.label} ${t('chart; equivalent table follows')}`}>
            <figcaption className="text-sm mb-2">{t("Magnitude by period; signed values are labelled. Missing values have no bar.")}</figcaption>
            <div className="max-h-80 overflow-auto space-y-1 border rounded p-3">
              {s.observations.map(o => <div key={o.period} className="grid grid-cols-[5rem_1fr] gap-3 text-sm">
                <span>{o.period}</span><div><span>{o.value === null ? t('— (missing)') : `${o.value.toLocaleString('en-GB')} ${s.unit}`}</span>
                  {o.value !== null && <div aria-hidden="true" className="h-2 bg-[var(--color-primary-deep)]" style={{ width: `${Math.abs(o.value) / max * 100}%` }} />}
                </div>
              </div>)}
            </div>
          </figure>
          <div className="overflow-x-auto"><DataSeriesTable language={language} series={[s]} stale={stale} caption={`${s.label} — ${t('selected observations')}`} /></div>
        </div>;
      })}
    </section>
  </>;
}
