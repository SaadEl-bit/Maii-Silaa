// Geospatial helpers — distance calculations for community alerts.

/**
 * Calculate the distance in km between two GPS points using the Haversine formula.
 * This is the standard way to find "how far apart are two places on Earth".
 *
 * Example: distanceKm(34.0, -6.8, 34.1, -6.7) → ~13.1 km
 * (That's roughly Rabat to Salé)
 */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if two points are within a given radius (in km).
 * Used by community alerts to find "is this farmer within 15km of the outbreak?"
 *
 * Example: isWithinRadius(34.0, -6.8, 34.05, -6.78, 15) → true
 */
function isWithinRadius(lat1, lng1, lat2, lng2, radiusKm) {
  return distanceKm(lat1, lng1, lat2, lng2) <= radiusKm;
}

/**
 * Find all items in an array that are within a radius of a center point.
 * Each item must have a `location_lat` and `location_lng` property.
 *
 * Used by communityService.js to find all farmers near a pest outbreak.
 */
function findWithinRadius(centerLat, centerLng, items, radiusKm) {
  return items.filter((item) =>
    isWithinRadius(
      centerLat,
      centerLng,
      item.location_lat,
      item.location_lng,
      radiusKm
    )
  );
}

module.exports = {
  distanceKm,
  isWithinRadius,
  findWithinRadius,
};