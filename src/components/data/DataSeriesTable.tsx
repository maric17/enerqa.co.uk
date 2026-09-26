import React from 'react';
import type { DataSeries } from '@/lib/api/core/types';
import { isStale, sourceLabel } from '@/lib/api/core/provenance';

/**
 * The accessible tabular equivalent every chart must have (handoff p. 227).
 *
 * It is a real <table> with scope'd headers and a <caption>, not a grid of
 * divs, so a screen reader announces "row 3, France, 2021, 42.1 percent"
 * rather than reading three unrelated numbers.
 *
 * It also carries the three dates p. 227 insists on separating - the period the
 * data describes, when the source released it, and when Enerqa retrieved it -
 * plus the unit, the licence and any transformation we applied.
 */

function formatValue(value: number | null): string {
  // A missing value is an em dash, never a zero (p. 227).
  if (value === null) return '—';
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4;
  return value.toLocaleString('en-GB', { maximumFractionDigits: digits });
}

/**
 * p. 227: "Do not silently mix annual and monthly observations, modelled
 * estimates and national inventories, nominal and constant currency, or
 * different CO2e global warming potential horizons."
 *
 * Returns a plain-English reason when the series cannot share one table or
 * chart, or null when they can. The measure note is where connectors record the
 * basis (GWP horizon, currency basis, estimate vs inventory), so a differing
 * note is treated as a different measure, not a cosmetic difference. Exported
 * so charts apply exactly the same rule.
 */
export function mixedMeasureReason(series: DataSeries[]): string | null {
  const distinct = <T,>(pick: (s: DataSeries) => T) => [...new Set(series.map(pick))];
  const frequencies = distinct((s) => s.frequency);
  if (frequencies.length > 1) return `they are reported at different frequencies (${frequencies.join(' and ')})`;
  const units = distinct((s) => s.unit);
  if (units.length > 1) return `they use different units (${units.join(' and ')})`;
  if (distinct((s) => s.measureNote ?? '').length > 1) {
    return 'they are measured on different bases, such as different warming horizons, currency bases or estimate methods';
  }
  return null;
}

export function DataSeriesTable({
  series,
  caption,
  /** Set when the table stands in for a chart, so it can be visually hidden. */
  visuallyHidden = false,
  /** Force the stale notice. Normally worked out from each series' retrieval time. */
  stale = false,
}: {
  series: DataSeries[];
  caption: string;
  visuallyHidden?: boolean;
  stale?: boolean;
}) {
  if (series.length === 0) return null;

  // Refuse to put incompatible series side by side, and say why in words a
  // visitor understands - the data itself is still one click away per series.
  const mixed = mixedMeasureReason(series);
  if (mixed) {
    return (
      <div role="note" className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--paper-alt)] p-4 text-sm text-[var(--ink-soft)]">
        These series cannot be shown in one table because {mixed}. View each series on its own to compare like with like.
      </div>
    );
  }

  // A cached release older than its provider's refresh interval (p. 227).
  const showStale = stale || series.some((s) => isStale(s.provenance));
  const oldest = series.map((s) => s.provenance.retrievedAt).sort()[0];

  // Union of every period across the series, so rows line up even when one
  // source is missing a year.
  const periods = [...new Set(series.flatMap((s) => s.observations.map((o) => o.period)))].sort();
  const lookup = series.map((s) => new Map(s.observations.map((o) => [o.period, o])));

  const hasMissing = series.some((s) => s.observations.some((o) => o.value === null));

  return (
    <figure className={visuallyHidden ? 'sr-only' : 'm-0'}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-3 text-left text-sm text-[var(--ink-soft)]">
          {caption}
          {hasMissing && (
            <span className="block text-xs mt-1">
              An em dash means the source published no figure for that period. It does not mean zero.
            </span>
          )}
          {showStale && (
            <span className="block text-xs mt-1 font-semibold text-[var(--ink)]">
              Showing the latest cached release, retrieved{' '}
              {new Date(oldest).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.
              The provider could not be refreshed since - use each series&rsquo; &ldquo;View source&rdquo; link below for newer figures.
            </span>
          )}
        </caption>
        <thead>
          <tr className="border-b border-[var(--line)]">
            <th scope="col" className="py-2 pr-4 font-semibold text-[var(--ink)]">
              Period
            </th>
            {series.map((s) => (
              <th key={s.id} scope="col" className="py-2 pr-4 font-semibold text-[var(--ink)]">
                {s.label}
                <span className="block text-xs font-normal text-[var(--ink-muted)]">{s.unit}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period} className="border-b border-[var(--line)]/60">
              {/* row header, so a screen reader repeats the period per cell */}
              <th scope="row" className="py-2 pr-4 font-medium text-[var(--ink-soft)]">
                {period}
              </th>
              {series.map((s, i) => (
                <td key={s.id} className="py-2 pr-4 tabular-nums text-[var(--ink)]">
                  {formatValue(lookup[i].get(period)?.value ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption className="mt-4 space-y-2 text-xs leading-relaxed text-[var(--ink-muted)]">
        {series.map((s) => (
          <p key={`${s.id}-prov`} className="m-0">
            <span className="font-semibold">{s.label}:</span> {sourceLabel(s.provenance)}.{' '}
            {s.provenance.licenceUrl ? (
              <a href={s.provenance.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {s.provenance.licence}
              </a>
            ) : (
              s.provenance.licence
            )}
            .{' '}
            <a href={s.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              View source
            </a>
            {s.measureNote && <span className="block">{s.measureNote}</span>}
            {s.provenance.transformations.length > 0 && (
              <span className="block">
                Enerqa applied: {s.provenance.transformations.join('; ')}.
              </span>
            )}
          </p>
        ))}
      </figcaption>
    </figure>
  );
}
