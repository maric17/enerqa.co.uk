import type { NewsProvider } from './types';

// Client trial: saved and live news use this provider alone, even on failure.
// Legacy connectors remain available for a separately approved fallback rollout.
export const PAGE_NEWS_PROVIDERS: NewsProvider[] = ['apitube'];
export const DEFAULT_NEWS_PROVIDERS = PAGE_NEWS_PROVIDERS;
export const REFRESH_NEWS_PROVIDERS = PAGE_NEWS_PROVIDERS;
