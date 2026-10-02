import type { AccessStatus, ConnectorFailure, ConnectorResult } from '../core/types';
import type { NewsBasketKey, NewsItem, NewsProvider } from './types';

/** Public-safe counters only: never include URLs, keys, bodies or raw errors. */
export type NewsDiagnostics = {
  basket: NewsBasketKey;
  providers: {
    provider: NewsProvider;
    outcome: 'ok' | ConnectorFailure['reason'];
    items: number;
    stale: boolean;
    retrievedAt: string | null;
    issue: string | null;
    httpStatus: number | null;
  }[];
  counts: { received: number; relevant: number; afterGate: number; accessChecked: number; verifiedOpen: number; returned: number };
  access: Partial<Record<AccessStatus, number>>;
  storage: 'not_attempted' | 'ok' | 'failed';
};

export function createNewsDiagnostics(basket: NewsBasketKey): NewsDiagnostics {
  return {
    basket, providers: [],
    counts: { received: 0, relevant: 0, afterGate: 0, accessChecked: 0, verifiedOpen: 0, returned: 0 },
    access: {}, storage: 'not_attempted',
  };
}

/** Classify known failures instead of forwarding provider text to the browser. */
export function noteNewsProvider(diagnostics: NewsDiagnostics, provider: NewsProvider, result: ConnectorResult<NewsItem[]>): void {
  const message = result.ok ? '' : result.message ?? '';
  let issue: string | null = null;
  if (!result.ok) {
    if (/shared request accounting.*not configured/i.test(message)) issue = 'request_accounting_not_configured';
    else if (/shared request accounting.*unavailable/i.test(message)) issue = 'request_accounting_unavailable';
    else if (/budget/i.test(message)) issue = 'request_budget_reached';
    else if (/spacing/i.test(message)) issue = 'request_spacing_limit';
    else if (/query.*(long|length|cap)/i.test(message)) issue = 'query_limit';
    else if (/timeout|timed out|aborted/i.test(message)) issue = 'request_timeout';
    else if (/non-success payload|non-JSON|body.*read|JSON.*read/i.test(message)) issue = 'invalid_provider_response';
    else issue = result.reason;
  }
  diagnostics.providers.push({
    provider, outcome: result.ok ? 'ok' : result.reason,
    items: result.ok ? result.data.length : 0,
    stale: result.ok ? Boolean(result.stale) : false,
    retrievedAt: result.ok ? result.retrievedAt : null,
    issue,
    httpStatus: /HTTP (\d{3})/.test(message) ? Number(message.match(/HTTP (\d{3})/)![1]) : null,
  });
  if (result.ok) diagnostics.counts.received += result.data.length;
}

/** Local dev logs by default; deployed builds need an explicit server flag. */
export function logNewsDiagnostics(diagnostics: NewsDiagnostics): void {
  if (process.env.NEWS_DEBUG !== 'true' && !(process.env.NEWS_DEBUG === undefined && process.env.NODE_ENV === 'development')) return;
  console.info('[enerqa:news]', JSON.stringify(diagnostics));
}
