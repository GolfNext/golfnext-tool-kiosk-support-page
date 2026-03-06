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
    return (
      <section className="w-full max-w-[480px] mx-auto px-4 py-6">
        <h2 className="text-xl font-sora font-semibold text-white mb-4">
          {translations["hotline.incidents.title"] || "Active incidents"}
        </h2>
        <p className="text-neutral font-manrope text-center py-8">
          {translations["hotline.incidents.none"] || "No known issues right now"} ✅
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[480px] mx-auto px-4 py-6">
      <h2 className="text-xl font-sora font-semibold text-white mb-4">
        {translations["hotline.incidents.title"] || "Active incidents"}
      </h2>
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 rounded-lg border border-white/10"
            style={{ backgroundColor: "var(--color-card-bg)" }}
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Status badge */}
              {incident.status === "MONITORING" ? (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500 text-yellow-400 text-xs font-sora font-semibold">
                  {translations["hotline.incidents.status.monitoring"] || "We're working on it"}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-error-red/20 border border-error-red text-error-red text-xs font-sora font-semibold">
                  {translations["hotline.incidents.status.open"] || "Active issue"}
                </span>
              )}

              {/* Scope badge */}
              {incident.scope === "Global" && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 text-xs font-sora font-semibold">
                  🌍 {translations["hotline.incidents.scope.global"] || "All kiosks"}
                </span>
              )}

              {incident.scope === "Country" && incident.targetCountry && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-sora font-semibold">
                  {COUNTRY_FLAGS[incident.targetCountry] || "🌐"} {incident.targetCountry}
                </span>
              )}
              
              {/* Venue labels (only for Club scope) */}
              {incident.scope === "Clubs" && incident.venues && incident.venues.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {incident.venues.map((venue, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-lime/20 text-lime text-xs font-manrope"
                    >
                      📍 {venue}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h3 className="font-sora font-semibold text-white mb-2">
              {incident.title}
            </h3>
            {incident.description && (
              <p className="text-sm font-manrope" style={{ color: "var(--color-text-muted)" }}>
                {incident.description}
              </p>
            )}
            {incident.updatedAt && (
              <p className="text-xs font-manrope mt-2 text-neutral">
                {(translations["hotline.incidents.created_at"] || "Created: {time}").replace(
                  "{time}",
                  new Date(incident.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
