import { type Locale, getSupportedLocales, isSupportedLocale } from "./locale-types";

const LOCALE_STORAGE_KEY = "golfnext-locale";

/**
 * Detect the user's preferred locale
 * Priority: 1. localStorage 2. Browser language 3. Fallback to English
 * This function runs client-side only (uses localStorage and navigator)
 */
export function detectLocale(): Locale {
  if (typeof window === "undefined") {
    // Server-side: return default
    return "en";
  }

  // 1. Check localStorage (user has manually selected before)
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && isSupportedLocale(saved)) {
    return saved;
  }

  // 2. Browser/phone language
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (isSupportedLocale(browserLang)) {
    return browserLang;
  }

  // 3. Fallback to English
  return "en";
}

/**
 * Save the user's locale preference to localStorage
 */
export function saveLocale(locale: Locale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

/**
 * Get locale from URL query parameter (useful for testing)
 * Example: ?lang=da
 */
export function getLocaleFromUrl(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");

  if (lang && isSupportedLocale(lang)) {
    return lang;
  }

  return null;
}

/**
 * Initialize locale - checks URL param first, then uses detection
 */
export function initializeLocale(): Locale {
  const urlLocale = getLocaleFromUrl();
  if (urlLocale) {
    saveLocale(urlLocale);
    return urlLocale;
  }

  return detectLocale();
}
