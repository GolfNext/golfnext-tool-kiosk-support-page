import type { Locale } from "@/lib/lokalise";

/**
 * ClickUp incident from API
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  status?: "OPEN" | "MONITORING";
  venues?: string[];
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
 * Page props with translations
 */
export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
