const ngeohash = require('ngeohash');

const GEOHASH_PRECISION = 7; // ~150m x 150m tiles

/**
 * Convert a coordinate [lng, lat] to a geohash string
 */
function coordToGeohash(lng, lat) {
  return ngeohash.encode(lat, lng, GEOHASH_PRECISION);
}

/**
 * Convert a geohash string to its bounding box polygon
 * Returns GeoJSON polygon coordinates
 */
function geohashToPolygon(hash) {
  const bbox = ngeohash.decode_bbox(hash);
  // bbox = [minlat, minlng, maxlat, maxlng]
  const [minLat, minLng, maxLat, maxLng] = bbox;

  return {
    type: 'Polygon',
    coordinates: [[
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat]
    ]]
  };
}

/**
 * Get the center point of a geohash
 */
function geohashToCenter(hash) {
  const { latitude, longitude } = ngeohash.decode(hash);
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
}

/**
 * Calculate the approximate area of a geohash tile in m²
 */
function geohashArea(hash) {
  const bbox = ngeohash.decode_bbox(hash);
  const [minLat, minLng, maxLat, maxLng] = bbox;

  const R = 6371000;
  const latDiff = (maxLat - minLat) * Math.PI / 180;
  const lngDiff = (maxLng - minLng) * Math.PI / 180;
  const avgLat = ((minLat + maxLat) / 2) * Math.PI / 180;

  const height = R * latDiff;
  const width = R * lngDiff * Math.cos(avgLat);

  return Math.abs(height * width);
}

/**
 * Convert a GPS path (array of [lng, lat]) to a unique set of geohashes
 */
function pathToGeohashes(coordinates) {
  const geohashes = new Set();

  for (const [lng, lat] of coordinates) {
    const hash = coordToGeohash(lng, lat);
    geohashes.add(hash);
  }

  return Array.from(geohashes);
}

/**
 * Get all geohashes within a bounding box
 */
function getGeohashesInBounds(bounds) {
  // bounds = { north, south, east, west }
  const { north, south, east, west } = bounds;
  return ngeohash.bboxes(south, west, north, east, GEOHASH_PRECISION);
}

/**
 * Calculate haversine distance between two [lng, lat] points in meters
 */
function haversineDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate total distance of a path in meters
 */
function calculatePathDistance(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineDistance(coordinates[i - 1], coordinates[i]);
  }
  return total;
}

/**
 * Estimate calories burned based on distance (meters) and duration (seconds)
 * Very rough estimate: ~60 cal/km walking, ~90 cal/km running
 */
function estimateCalories(distance, duration) {
  const distKm = distance / 1000;
  const speedKmh = (distance / duration) * 3.6;

  // Running threshold: > 8 km/h
  const calPerKm = speedKmh > 8 ? 90 : 60;
  return Math.round(distKm * calPerKm);
}

module.exports = {
  GEOHASH_PRECISION,
  coordToGeohash,
  geohashToPolygon,
  geohashToCenter,
  geohashArea,
  pathToGeohashes,
  getGeohashesInBounds,
  haversineDistance,
  calculatePathDistance,
  estimateCalories
};
