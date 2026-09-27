import { getProvider } from './registry';
import { isStale } from './provenance';
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

/**
 * Characters that make a spreadsheet read a cell as a formula (OWASP "CSV
 * injection"): = + - @, and a leading tab or carriage return. The audit got a
 * bare `=1+1` cell into an export through a query parameter (L1077).
 */
const FORMULA_START = /^\s*[=+\-@\t\r]/;

/** A plain number cannot be a formula, so "-3.5" or "-1e-3" stays a number. */
const PLAIN_NUMBER = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/**
 * One CSV cell. Numbers are written as numbers, so a negative value in the
 * value column is never touched. Text that would start a formula gets a
 * leading apostrophe - the spreadsheet convention for "this is text" - and is
 * quoted like any cell containing a delimiter, quote or newline.
 */
export function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  let text = String(value);
  if (FORMULA_START.test(text) && !PLAIN_NUMBER.test(text)) text = `'${text}`;
  // Quote anything containing a delimiter, quote or newline; double inner quotes.
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * A "# ..." header line. It stays one readable line starting with "#" (so
 * tools that skip comment lines still do), but a spreadsheet splits it at
 * commas, so no comma-separated piece may start a formula either: the filter
 * description is built from the visitor's query string. Quotes become
 * apostrophes so no piece can open a quoted field.
 */
export function commentLine(text: string): string {
  const flat = `# ${text}`.replace(/[\r\n]+/g, ' ').replace(/"/g, "'");
  return flat
    .split(',')
    .map((piece, i) => {
      if (i === 0) return piece;
      const lead = piece.match(/^\s*/)?.[0] ?? '';
      const rest = piece.slice(lead.length);
      return FORMULA_START.test(rest) && !PLAIN_NUMBER.test(rest) ? `${lead}'${rest}` : piece;
    })
    .join(',');
}

export function seriesToCsv(series: DataSeries[], filterDescription?: string): string {
  if (series.length === 0) return '# No data\n';

  const lines: string[] = [];
  const now = new Date().toISOString();

  lines.push('# Enerqa data export');
  lines.push(`# Generated: ${now}`);
  if (filterDescription) lines.push(commentLine(`Filter applied: ${filterDescription}`));
  lines.push('#');

  // One provenance block per distinct source in the export.
  const seen = new Set<string>();
  for (const s of series) {
    const p = s.provenance;
    const key = `${p.providerId}|${p.sourceUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const provider = getProvider(p.providerId);
    const block = [
      `Source: ${p.providerName}`,
      `Attribution: ${p.attribution}`,
      `Licence: ${p.licence}${p.licenceUrl ? ` (${p.licenceUrl})` : ''}`,
      `Source URL: ${p.sourceUrl}`,
      `Methodology: ${provider.docsUrl}`,
      ...(p.version ? [`Dataset version: ${p.version}`] : []),
      ...(p.sourceReleasedAt ? [`Source released: ${p.sourceReleasedAt}`] : []),
      `Retrieved by Enerqa: ${p.retrievedAt}`,
      // p. 227: "If the source is unavailable, show the latest cached release
      // with a stale-data notice". A file keeps the notice with the numbers.
      ...(isStale(p)
        ? [`Stale data: ${p.providerName} could not be refreshed. These are the latest cached values, retrieved ${p.retrievedAt}.`]
        : []),
      p.transformations.length > 0
        ? `Transformations applied by Enerqa: ${p.transformations.join('; ')}`
        : 'Transformations applied by Enerqa: none (values as published)',
    ];
    lines.push(...block.map(commentLine), '#');
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
