/**
 * Time utilities for GolfNext Hotline
 * Hotline is open 07:00-22:00 CET/CEST
 * Times are displayed in user's local timezone for better UX
 */

const HOTLINE_OPEN_HOUR_CET = 7;
const HOTLINE_CLOSE_HOUR_CET = 22;
const CET_TIMEZONE = "Europe/Copenhagen";

/**
 * Check if the hotline is currently open
 * Open hours: 07:00 - 22:00 CET/CEST
 */
export function isHotlineOpen(): boolean {
  const now = new Date();

  const cetHour = parseInt(
    new Intl.DateTimeFormat("en", {
      timeZone: CET_TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(now)
  );

  return cetHour >= HOTLINE_OPEN_HOUR_CET && cetHour < HOTLINE_CLOSE_HOUR_CET;
}

/**
 * Get opening time in user's local timezone
 * Converts 07:00 CET to user's local time
 */
export function getOpeningTimeLocal(): string {
  const now = new Date();
  
  // Create a date for today at 07:00 in CET
  const openingTimeCET = new Date(
    now.toLocaleString("en-US", { timeZone: CET_TIMEZONE })
  );
  openingTimeCET.setHours(HOTLINE_OPEN_HOUR_CET, 0, 0, 0);
  
  // Get the UTC timestamp of 07:00 CET
  const utcTimestamp = Date.parse(
    openingTimeCET.toLocaleString("en-US", { timeZone: "UTC" })
  );
  
  // Create proper date object from UTC timestamp
  const openingDate = new Date(
    new Date().toLocaleDateString("en-US", { timeZone: CET_TIMEZONE }) + 
    ` ${HOTLINE_OPEN_HOUR_CET}:00:00 GMT+0100`
  );
  
  // Format in user's local timezone (no timezone name)
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(openingDate);
}

/**
 * Get closing time in user's local timezone  
 * Converts 22:00 CET to user's local time
 */
export function getClosingTimeLocal(): string {
  const now = new Date();
  
  const closingDate = new Date(
    new Date().toLocaleDateString("en-US", { timeZone: CET_TIMEZONE }) + 
    ` ${HOTLINE_CLOSE_HOUR_CET}:00:00 GMT+0100`
  );
  
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(closingDate);
}
