/**
 * XP & Level Service — Handles experience points and leveling
 */

// XP required for each level (cumulative)
function xpForLevel(level) {
  // Exponential curve: level 1 = 0, level 2 = 100, level 3 = 250, etc.
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

/**
 * Get current level from total XP
 */
function getLevelFromXp(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/**
 * Get XP progress within current level
 */
function getLevelProgress(totalXp) {
  const currentLevel = getLevelFromXp(totalXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);

  return {
    level: currentLevel,
    currentXp: totalXp - currentLevelXp,
    requiredXp: nextLevelXp - currentLevelXp,
    totalXp,
    progress: (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)
  };
}

/**
 * Calculate XP earned from distance (meters)
 */
function distanceXp(meters) {
  // 1 XP per 10 meters
  return Math.floor(meters / 10);
}

/**
 * Calculate XP earned from claiming territory
 */
function claimXp(tilesCount) {
  // 15 XP per tile claimed
  return tilesCount * 15;
}

/**
 * Calculate coins earned from distance
 */
function distanceCoins(meters) {
  // 1 coin per 100 meters
  return Math.floor(meters / 100);
}

/**
 * Level-based perks
 */
function getLevelPerks(level) {
  return {
    captureSpeedBonus: 1 - Math.min(level * 0.02, 0.3), // Up to 30% faster capture
    influenceRadius: 1 + Math.min(level * 0.05, 0.5),    // Up to 50% larger radius
    maxShieldDuration: 60 * 60 * (1 + Math.floor(level / 5)), // +1 hour per 5 levels
    dailyCoinBonus: Math.floor(level * 2) // Bonus daily coins
  };
}

module.exports = {
  xpForLevel,
  getLevelFromXp,
  getLevelProgress,
  distanceXp,
  claimXp,
  distanceCoins,
  getLevelPerks
};
