/**
 * One language vocabulary for every connector (p. 226: "language/geography
 * tags ... before display"). NewsData says "english", GDELT
 * says "English" and the RSS feeds say "en", which is how the Global
 * Intelligence filter ended up listing both "EN" and "ENGLISH". Everything is
 * stored as an ISO 639-1 code.
 */
const LANGUAGE_CODES: Record<string, string> = {
  // ISO 639-2 three-letter codes, as GBIF sends them.
  eng: 'en',
  ara: 'ar',
  fra: 'fr',
  fre: 'fr',
  spa: 'es',
  deu: 'de',
  ger: 'de',
  por: 'pt',
  english: 'en',
  arabic: 'ar',
  french: 'fr',
  spanish: 'es',
  german: 'de',
  portuguese: 'pt',
  italian: 'it',
  dutch: 'nl',
  russian: 'ru',
  chinese: 'zh',
  japanese: 'ja',
  korean: 'ko',
  turkish: 'tr',
  hindi: 'hi',
  indonesian: 'id',
};

export function normaliseLanguage(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase();
  if (!value) return null;
  if (/^[a-z]{2}$/.test(value)) return value;
  // "en-GB", "en_US"
  const tagged = value.match(/^([a-z]{2})[-_]/);
  if (tagged) return tagged[1];
  return LANGUAGE_CODES[value] ?? value;
}

