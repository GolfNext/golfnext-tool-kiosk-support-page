"use client";

import { useState, useEffect } from "react";
import { type Locale, type Translations } from "@/lib/locale-types";
import { initializeLocale } from "@/lib/locale";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { PhoneEmailSection } from "@/components/PhoneEmailSection";
import { IncidentList } from "@/components/IncidentList";
import { SelfHelp } from "@/components/SelfHelp";
import { ClubContact } from "@/components/ClubContact";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectedLocale = initializeLocale();
    setLocale(detectedLocale);
    loadTranslationsForLocale(detectedLocale);
  }, []);

  const loadTranslationsForLocale = async (newLocale: Locale) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/translations?locale=${newLocale}`);
      const data = await response.json();
      setTranslations(data.translations || {});
    } catch (error) {
      console.error("Failed to load translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    loadTranslationsForLocale(newLocale);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-green">
        <div className="text-lime font-sora text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-midnight-green">
      <Header translations={translations} onLanguageChange={handleLanguageChange} />

      <main className="flex-1">
        {/* Page title */}
        <div className="w-full max-w-[480px] mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-sora font-semibold text-white mb-2">
            {translations["hotline.page_title"] || "GolfNext Hotline"}
          </h1>
          <p className="text-neutral font-manrope">
            {translations["hotline.tagline"] || "Get help with GolfNext machines"}
          </p>
        </div>

        {/* Status badge */}
        <StatusBadge translations={translations} />

        {/* Phone & Email CTA */}
        <PhoneEmailSection translations={translations} />

        {/* Active incidents */}
        <IncidentList translations={translations} locale={locale} />

        {/* Self-help */}
        <SelfHelp translations={translations} />

        {/* Club contact */}
        <ClubContact translations={translations} />
      </main>

      <Footer translations={translations} />
    </div>
  );
}
