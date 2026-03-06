/**
 * Shared locale types and constants
 * Safe to import in both client and server code
 */

export const SUPPORTED_LOCALES = ["da", "sv", "is", "fi", "en", "no", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Translations = Record<string, string>;

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): readonly Locale[] {
  return SUPPORTED_LOCALES;
}
