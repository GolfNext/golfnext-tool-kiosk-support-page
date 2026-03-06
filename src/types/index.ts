import type { Locale } from "@/lib/locale-types";

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
 * ClickUp incident from API with venue relationships
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  status?: "OPEN" | "MONITORING";
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
 * Page props with translations
 */
export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
