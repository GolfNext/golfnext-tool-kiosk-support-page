import type { Locale } from "@/lib/locale-types";

/**
 * Incident scope types
 */
export type IncidentScope = "Global" | "Country" | "Clubs";

/**
 * Golf club from ClickUp "GolfNext Clubs" list
 */
export interface GolfClub {
  id: string;
  name: string;
  hubspotId: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  city: string;
}

/**
 * ClickUp incident with scope and geo-filtering
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  status?: "OPEN" | "MONITORING";
  scope?: IncidentScope;
  targetCountry?: string;
  venues?: string[]; // Club names for display
  venueIds?: string[]; // Club task IDs from relationship field
  clubs?: GolfClub[]; // Full club data after lookup
  updatedAt?: string;
}

/**
 * Self-help FAQ item
 */
export interface SelfHelpItem {
  title: string;
  steps: string[];
}

/**
 * Language option for switcher
 */
export interface LanguageOption {
  code: Locale;
  name: string;
  flag: string;
}

/**
 * Coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Page props
 */
export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
