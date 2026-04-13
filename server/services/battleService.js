/**
 * Battle Service — Handles territory capture and defense logic
 */

// Base capture time in seconds
const BASE_CAPTURE_TIME = 30;

// Speed thresholds (m/s)
const WALKING_SPEED = 1.4;  // ~5 km/h  
const RUNNING_SPEED = 2.8;  // ~10 km/h

/**
 * Calculate capture time based on attacker speed and defender's defense level
 * Running gets faster capture, higher defense = longer capture time
 */
function calculateCaptureTime(attackerSpeed, defenseLevel) {
  let speedMultiplier = 1.0;

  if (attackerSpeed >= RUNNING_SPEED) {
    speedMultiplier = 0.5; // Running = 50% faster capture
  } else if (attackerSpeed >= WALKING_SPEED) {
    speedMultiplier = 0.75; // Walking = 25% faster
  }

  // Defense multiplier: each level adds 20% more time
  const defenseMultiplier = 1 + (defenseLevel - 1) * 0.2;

  return Math.round(BASE_CAPTURE_TIME * speedMultiplier * defenseMultiplier);
}

/**
 * Determine if a capture attempt is successful
 * Attacker must stay in the tile for the full capture time
 */
function isCaptureSuccessful(timeSpentInTile, requiredTime) {
  return timeSpentInTile >= requiredTime;
}

/**
 * Calculate defense level increase from activity
 * More activity on owned territory = higher defense
 */
function calculateDefenseIncrease(currentLevel, activityDistance) {
  // Every 500m of activity in owned territory increases defense by 0.5
  const increase = Math.floor(activityDistance / 500) * 0.5;
  return Math.min(currentLevel + increase, 10); // Cap at 10
}

/**
 * Check if territory is shielded
 */
function isShielded(user) {
  if (!user.activeShield || !user.activeShield.active) return false;
  return new Date(user.activeShield.expiresAt) > new Date();
}

/**
 * Calculate coins earned from a capture
 */
function captureCoinsReward(defenseLevel) {
  return 10 + (defenseLevel * 5); // Higher defense = better reward
}

/**
 * Calculate XP earned from a capture  
 */
function captureXpReward(defenseLevel) {
  return 25 + (defenseLevel * 10);
}

module.exports = {
  BASE_CAPTURE_TIME,
  calculateCaptureTime,
  isCaptureSuccessful,
  calculateDefenseIncrease,
  isShielded,
  captureCoinsReward,
  captureXpReward
};
