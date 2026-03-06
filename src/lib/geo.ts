/**
 * Geolocation utilities for proximity-based filtering
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ClubWithDistance {
  clubId: string;
  name: string;
  distance: number;
  coordinates: Coordinates;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter clubs by proximity to user's location
 * Returns clubs within the specified radius (km)
 */
export function filterClubsByProximity(
  clubs: Array<{ id: string; name: string; latitude: number; longitude: number }>,
  userLat: number,
  userLon: number,
  radiusKm: number = 10
): ClubWithDistance[] {
  return clubs
    .map((club) => ({
      clubId: club.id,
      name: club.name,
      distance: calculateDistance(userLat, userLon, club.latitude, club.longitude),
      coordinates: {
        latitude: club.latitude,
        longitude: club.longitude,
      },
    }))
    .filter((club) => club.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance); // Nearest first
}

/**
 * Get the nearest club to user's location
 */
export function getNearestClub(
  clubs: Array<{ id: string; name: string; latitude: number; longitude: number }>,
  userLat: number,
  userLon: number
): ClubWithDistance | null {
  if (clubs.length === 0) return null;

  const clubsWithDistance = clubs.map((club) => ({
    clubId: club.id,
    name: club.name,
    distance: calculateDistance(userLat, userLon, club.latitude, club.longitude),
    coordinates: {
      latitude: club.latitude,
      longitude: club.longitude,
    },
  }));

  return clubsWithDistance.reduce((nearest, current) =>
    current.distance < nearest.distance ? current : nearest
  );
}
