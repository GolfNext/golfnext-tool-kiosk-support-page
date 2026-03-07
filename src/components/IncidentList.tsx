"use client";

import { useEffect, useState } from "react";
import type { Incident } from "@/types";
import type { Translations, Locale } from "@/lib/locale-types";

interface IncidentListProps {
  translations: Translations;
  locale: Locale;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "Denmark": "🇩🇰",
  "Iceland": "🇮🇸",
  "Sweden": "🇸🇪",
  "Finland": "🇫🇮",
  "Norway": "🇳🇴",
};

export function IncidentList({ translations, locale }: IncidentListProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/incidents?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data.incidents || []);
        setLoading(false);
      })
      .catch(() => {
        setIncidents([]);
        setLoading(false);
      });
  }, [locale]);

  if (loading) {
    return null;
  }

  if (incidents.length === 0) {
    return null; // Hide section entirely if no incidents
  }
}
