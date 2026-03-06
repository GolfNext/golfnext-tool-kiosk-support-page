import { LokaliseApi } from "@lokalise/node-api";
import {
  type Locale,
  type Translations,
  getSupportedLocales as getLocales,
  isSupportedLocale as isLocaleSupported,
} from "./locale-types";

export type { Locale, Translations };
export const getSupportedLocales = getLocales;
export const isSupportedLocale = isLocaleSupported;

const lokaliseApi = new LokaliseApi({
  apiKey: process.env.LOKALISE_API_TOKEN!,
});

const PROJECT_ID = process.env.NEXT_PUBLIC_LOKALISE_PROJECT_ID!;

export async function loadTranslations(locale: Locale): Promise<Translations> {
  try {
    const translations: Translations = {};
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await lokaliseApi.keys().list({
        project_id: PROJECT_ID,
        page,
        limit: 500,
        include_translations: 1,
      } as any);

      response.items.forEach((key: any) => {
        const translation = key.translations?.find(
          (t: any) => t.language_iso === locale
        );
        if (translation && translation.translation) {
          translations[key.key_name.web] = translation.translation;
        }
      });

      hasMore = page < response.totalPages;
      page++;
    }

    return translations;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    return {};
  }
}

export function translate(
  translations: Translations,
  key: string,
  variables?: Record<string, string>
): string {
  let text = translations[key] || key;

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, "g"), value);
    });
  }

  return text;
}

export function createTranslator(translations: Translations) {
  return (key: string, variables?: Record<string, string>) =>
    translate(translations, key, variables);
}
