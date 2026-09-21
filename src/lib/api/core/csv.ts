import { getProvider } from './registry';
import type { DataSeries } from './types';

/**
 * CSV export (handoff p. 227).
 *
 * "CSV downloads contain the filtered data **plus** attribution, units,
 * methodology links and transformation notes." So the file opens with a
 * commented header block: a reader who opens the CSV six months later still
 * knows where the numbers came from, what period they describe and what we
 * did to them.
 *
 * Missing values are written as empty cells, never as 0 (p. 227).
 */

function escapeCell(value: string | number | null): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  // Quote anything containing a delimiter, quote or newline; double inner quotes.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function seriesToCsv(series: DataSeries[], filterDescription?: string): string {
  if (series.length === 0) return '# No data\n';

  const lines: string[] = [];
  const now = new Date().toISOString();

  lines.push('# Enerqa data export');
  lines.push(`# Generated: ${now}`);
  if (filterDescription) lines.push(`# Filter applied: ${filterDescription}`);
  lines.push('#');

  // One provenance block per distinct source in the export.
  const seen = new Set<string>();
  for (const s of series) {
    const p = s.provenance;
    const key = `${p.providerId}|${p.sourceUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const provider = getProvider(p.providerId);
    lines.push(`# Source: ${p.providerName}`);
    lines.push(`# Attribution: ${p.attribution}`);
    lines.push(`# Licence: ${p.licence}${p.licenceUrl ? ` (${p.licenceUrl})` : ''}`);
    lines.push(`# Source URL: ${p.sourceUrl}`);
    lines.push(`# Methodology: ${provider.docsUrl}`);
    if (p.version) lines.push(`# Dataset version: ${p.version}`);
    if (p.sourceReleasedAt) lines.push(`# Source released: ${p.sourceReleasedAt}`);
    lines.push(`# Retrieved by Enerqa: ${p.retrievedAt}`);
    if (p.transformations.length > 0) {
      lines.push(`# Transformations applied by Enerqa: ${p.transformations.join('; ')}`);
    } else {
      lines.push('# Transformations applied by Enerqa: none (values as published)');
    }
    lines.push('#');
  }

  lines.push('# Empty value cells mean the source published no figure for that period.');
  lines.push('# They are not zeros.');
  lines.push('');

  lines.push(
    ['series', 'area', 'period', 'value', 'unit', 'frequency', 'measure_note', 'flag', 'source', 'source_url']
      .map(escapeCell)
      .join(','),
  );

  for (const s of series) {
    for (const obs of s.observations) {
      lines.push(
        [
          s.label,
          s.area ?? '',
          obs.period,
          // Missing stays empty. This is the whole point.
          obs.value === null ? '' : obs.value,
          s.unit,
          s.frequency,
          s.measureNote ?? '',
          obs.flag ?? '',
          s.provenance.attribution,
          s.provenance.sourceUrl,
        ]
          .map(escapeCell)
          .join(','),
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

/** Filename that carries the dataset and the retrieval date. */
export function csvFilename(slug: string): string {
  return `enerqa-${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
}
