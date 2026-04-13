/**
 * Format meters to a human-readable distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format seconds to duration string
 */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Format area in m² to readable string
 */
export function formatArea(sqMeters) {
  if (sqMeters < 4047) return `${Math.round(sqMeters)} m²`;
  const acres = sqMeters / 4047;
  if (acres < 100) return `${acres.toFixed(2)} acres`;
  const sqKm = sqMeters / 1000000;
  return `${sqKm.toFixed(2)} km²`;
}

/**
 * Format speed in m/s to km/h
 */
export function formatSpeed(mps) {
  return `${(mps * 3.6).toFixed(1)} km/h`;
}

/**
 * Format large numbers with k/M suffixes
 */
export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/**
 * Format a date to a relative string (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

/**
 * Get color for a user (deterministic based on ID)
 */
export function getUserColor(userId) {
  const colors = [
    '#00f5ff', '#39ff14', '#ff006e', '#bf00ff',
    '#ffd700', '#ff6b35', '#29a6ff', '#47e08a',
    '#ff4757', '#7c4dff', '#00e676', '#40c4ff'
  ];
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Calculate level progress percentage
 */
export function levelProgress(xp, level) {
  const xpForLevel = (l) => Math.floor(100 * Math.pow(l - 1, 1.5));
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}
