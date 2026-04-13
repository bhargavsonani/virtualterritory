import ngeohash from 'ngeohash';

const GEOHASH_PRECISION = 7;

/**
 * Convert a coordinate to a geohash string
 */
export function coordToGeohash(lng, lat) {
  return ngeohash.encode(lat, lng, GEOHASH_PRECISION);
}

/**
 * Convert a geohash to its bounding box polygon (GeoJSON format)
 */
export function geohashToPolygon(hash) {
  const bbox = ngeohash.decode_bbox(hash);
  const [minLat, minLng, maxLat, maxLng] = bbox;

  return {
    type: 'Feature',
    properties: { geohash: hash },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ]]
    }
  };
}

/**
 * Convert an array of territories to GeoJSON FeatureCollection
 */
export function territoriesToGeoJSON(territories) {
  return {
    type: 'FeatureCollection',
    features: territories.map(t => ({
      type: 'Feature',
      properties: {
        geohash: t.geohash,
        ownerId: t.ownerId?._id || t.ownerId,
        ownerName: t.ownerId?.username || 'Unknown',
        defenseLevel: t.defenseLevel,
        area: t.area
      },
      geometry: t.geometry
    }))
  };
}

/**
 * Convert a path of coordinates to GeoJSON LineString
 */
export function pathToGeoJSON(coordinates) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates
    }
  };
}

/**
 * Get geohashes from a path
 */
export function pathToGeohashes(coordinates) {
  const hashes = new Set();
  for (const [lng, lat] of coordinates) {
    hashes.add(coordToGeohash(lng, lat));
  }
  return Array.from(hashes);
}
