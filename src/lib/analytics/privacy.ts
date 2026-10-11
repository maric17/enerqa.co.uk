// Only known public route shapes may be measured. Never transmit queries, hashes or private routes.
export function analyticsPath(path: string): string | null {
  const clean = path.split(/[?#]/, 1)[0];
  if (/^\/(?:|about|about\/careers|domains-and-industries|project-development|tools|knowledge-hub|knowledge-hub\/global-intelligence|data-portal|data-portal\/sources|data-portal\/explorer|privacy|terms|cookie-choices|accessibility)$/.test(clean)) return clean;
  if (/^\/(?:domains|industries|tools|knowledge-hub|data-portal\/datasets|data-portal\/dashboards)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) return clean;
  return null;
}

export function safeAnalyticsPayload(payload: Record<string, unknown>, path: string, website: string) {
  const url = analyticsPath(path);
  if (!url) return null;
  const name = payload.name;
  if (name !== undefined && name !== 'dataset_download' && name !== 'tool_access') return null;
  // Deliberately discard title, referrer, identifiers and arbitrary event properties.
  return { website, hostname: window.location.hostname, url, title: url, referrer: '', ...(name ? { name } : {}) };
}
