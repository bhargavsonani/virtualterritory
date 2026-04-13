/**
 * Anti-cheat middleware
 * Validates GPS data to detect spoofing/vehicle cheating
 */

const MAX_HUMAN_SPEED = 12; // m/s (~43 km/h, covers fast sprinting)
const MIN_ACCURACY = 100;   // meters — reject very inaccurate readings

const validateLocation = (req, res, next) => {
  const { coordinates, speed, accuracy } = req.body;

  // Check if coordinates exist
  if (!coordinates || !Array.isArray(coordinates)) {
    return res.status(400).json({ message: 'Invalid coordinates data' });
  }

  // Check accuracy — reject highly inaccurate readings
  if (accuracy && accuracy > MIN_ACCURACY) {
    return res.status(400).json({
      message: 'GPS accuracy too low. Please move to an open area.',
      code: 'LOW_ACCURACY'
    });
  }

  // Check speed — detect vehicle movement
  if (speed && speed > MAX_HUMAN_SPEED) {
    return res.status(400).json({
      message: 'Speed too high. Only walking and running count!',
      code: 'SPEED_TOO_HIGH'
    });
  }

  // Validate coordinate ranges
  for (const coord of coordinates) {
    if (!Array.isArray(coord) || coord.length < 2) {
      return res.status(400).json({ message: 'Invalid coordinate format' });
    }
    const [lng, lat] = coord;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Coordinates out of valid range' });
    }
  }

  next();
};

/**
 * Validate a path of coordinates for consistency
 * Checks that consecutive points aren't impossibly far apart
 */
const validatePath = (req, res, next) => {
  const { path, duration } = req.body;

  if (!path || !path.coordinates || path.coordinates.length < 2) {
    return next(); // Skip validation for short paths
  }

  const coords = path.coordinates;
  let totalDistance = 0;

  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];

    // Haversine distance
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  // Check if avg speed is reasonable
  if (duration > 0) {
    const avgSpeed = totalDistance / duration;
    if (avgSpeed > MAX_HUMAN_SPEED) {
      return res.status(400).json({
        message: 'Activity speed is suspicious. Please only walk or run.',
        code: 'SUSPICIOUS_SPEED'
      });
    }
  }

  next();
};

module.exports = { validateLocation, validatePath };
