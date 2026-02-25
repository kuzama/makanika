const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

interface HasLocation {
  id: string;
  latitude: number;
  longitude: number;
}

interface WithDistance<T> extends HasLocation {
  distance: number;
}

/**
 * Sort an array of items with lat/lng by distance from a reference point.
 * Nearest first. Attaches `distance` (km) to each result.
 */
export function sortByDistance<T extends HasLocation>(
  items: T[],
  refLat: number,
  refLng: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: haversineDistance(refLat, refLng, item.latitude, item.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
}
