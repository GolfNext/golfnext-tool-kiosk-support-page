"use client";

import { useState, useEffect } from "react";
import { type Locale, getSupportedLocales } from "@/lib/locale-types";
import { initializeLocale, saveLocale } from "@/lib/locale";
import type { Translations } from "@/lib/locale-types";

interface LanguageSwitcherProps {
  translations: Translations;
  onLanguageChange: (locale: Locale) => void;
}

const LANGUAGE_FLAGS: Record<Locale, string> = {
  da: "🇩🇰",
  sv: "🇸🇪",
  is: "🇮🇸",
  fi: "🇫🇮",
  en: "🇬🇧",
  no: "🇳🇴",
  de: "🇩🇪",
};

export function LanguageSwitcher({
  translations,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const locale = initializeLocale();
    setCurrentLocale(locale);
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    setCurrentLocale(locale);
    saveLocale(locale);
    onLanguageChange(locale);
    setIsOpen(false);
  };

  // Get supported locales and sort alphabetically by display name
  const supportedLocales = getSupportedLocales();
  const sortedLocales = [...supportedLocales].sort((a, b) => {
    const nameA = translations[`lang.${a}`] || a;
    const nameB = translations[`lang.${b}`] || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white min-h-[48px]"
      >
        <span className="text-xl">{LANGUAGE_FLAGS[currentLocale]}</span>
        <span className="font-manrope">
          {translations[`lang.${currentLocale}`] || currentLocale.toUpperCase()}
        </span>
        <span className="text-xs">▾</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-midnight-green border border-white/20 shadow-lg z-20 overflow-hidden">
            {sortedLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left min-h-[48px] ${
                  locale === currentLocale ? "bg-white/10" : ""
                }`}
              >
                <span className="text-xl">{LANGUAGE_FLAGS[locale]}</span>
                <span className="font-manrope text-white">
                  {translations[`lang.${locale}`] || locale.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
