const Territory = require('../models/Territory');
const User = require('../models/User');
const {
  pathToGeohashes,
  geohashToPolygon,
  geohashToCenter,
  geohashArea,
  getGeohashesInBounds
} = require('../services/territoryService');
const { isShielded, captureCoinsReward, captureXpReward } = require('../services/battleService');
const { claimXp, getLevelFromXp } = require('../services/xpService');

// Claim territory tiles from a GPS path
exports.claimTerritory = async (req, res) => {
  try {
    const { coordinates } = req.body; // array of [lng, lat]
    const userId = req.user.id;

    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ message: 'At least 2 coordinates required' });
    }

    // Convert path to unique geohashes
    const geohashes = pathToGeohashes(coordinates);

    if (geohashes.length === 0) {
      return res.status(400).json({ message: 'No territory tiles found on path' });
    }

    const claimedTiles = [];
    const capturedTiles = [];
    let totalAreaClaimed = 0;

    for (const hash of geohashes) {
      // Check if tile already exists
      const existing = await Territory.findOne({ geohash: hash });

      if (existing) {
        // Already owned by this user — skip
        if (existing.ownerId.toString() === userId) continue;

        // Owned by another user — check if shielded
        const owner = await User.findById(existing.ownerId);
        if (owner && isShielded(owner)) continue;

        // Capture the tile
        const prevOwner = existing.ownerId;
        existing.ownerId = userId;
        existing.capturedAt = new Date();
        existing.defenseLevel = 1;
        await existing.save();

        // Update previous owner's land count
        const tileArea = geohashArea(hash);
        await User.findByIdAndUpdate(prevOwner, {
          $inc: { 'stats.totalLandOwned': -tileArea }
        });

        totalAreaClaimed += tileArea;
        capturedTiles.push(hash);
      } else {
        // New tile — claim it
        const polygon = geohashToPolygon(hash);
        const center = geohashToCenter(hash);
        const area = geohashArea(hash);

        await Territory.create({
          ownerId: userId,
          geohash: hash,
          geometry: polygon,
          center: center,
          area: area,
          defenseLevel: 1
        });

        totalAreaClaimed += area;
        claimedTiles.push(hash);
      }
    }

    // Update user stats
    const xpEarned = claimXp(claimedTiles.length + capturedTiles.length);
    const user = await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.totalLandOwned': totalAreaClaimed,
        'stats.totalCaptures': capturedTiles.length,
        xp: xpEarned
      }
    }, { new: true });

    // Update level
    const newLevel = getLevelFromXp(user.xp);
    if (newLevel !== user.level) {
      user.level = newLevel;
      await user.save();
    }

    res.json({
      claimed: claimedTiles.length,
      captured: capturedTiles.length,
      totalAreaClaimed: Math.round(totalAreaClaimed),
      xpEarned,
      newTiles: [...claimedTiles, ...capturedTiles]
    });
  } catch (error) {
    console.error('Claim territory error:', error);
    res.status(500).json({ message: 'Error claiming territory' });
  }
};

// Get territories in a bounding box
exports.getTerritoriesInArea = async (req, res) => {
  try {
    const { north, south, east, west } = req.query;

    if (!north || !south || !east || !west) {
      return res.status(400).json({ message: 'Bounding box parameters required (north, south, east, west)' });
    }

    const territories = await Territory.find({
      center: {
        $geoWithin: {
          $box: [
            [parseFloat(west), parseFloat(south)],
            [parseFloat(east), parseFloat(north)]
          ]
        }
      }
    }).populate('ownerId', 'username avatar level');

    res.json(territories);
  } catch (error) {
    console.error('Get territories error:', error);
    res.status(500).json({ message: 'Error fetching territories' });
  }
};

// Get territories for a specific user
exports.getUserTerritories = async (req, res) => {
  try {
    const { userId } = req.params;
    const territories = await Territory.find({ ownerId: userId });

    res.json({
      count: territories.length,
      totalArea: territories.reduce((sum, t) => sum + t.area, 0),
      territories
    });
  } catch (error) {
    console.error('Get user territories error:', error);
    res.status(500).json({ message: 'Error fetching user territories' });
  }
};

// Battle — initiate territory capture
exports.battleTerritory = async (req, res) => {
  try {
    const { geohash, timeSpent, speed } = req.body;
    const attackerId = req.user.id;

    const territory = await Territory.findOne({ geohash });
    if (!territory) {
      return res.status(404).json({ message: 'Territory not found' });
    }

    if (territory.ownerId.toString() === attackerId) {
      return res.status(400).json({ message: 'You already own this territory' });
    }

    // Check shield
    const owner = await User.findById(territory.ownerId);
    if (owner && isShielded(owner)) {
      return res.status(400).json({ message: 'Territory is shielded!' });
    }

    const { calculateCaptureTime, isCaptureSuccessful } = require('../services/battleService');
    const requiredTime = calculateCaptureTime(speed || 1.4, territory.defenseLevel);

    if (!isCaptureSuccessful(timeSpent, requiredTime)) {
      return res.status(400).json({
        message: 'Not enough time spent in territory',
        requiredTime,
        timeSpent
      });
    }

    // Transfer ownership
    const prevOwner = territory.ownerId;
    const tileArea = territory.area;

    territory.ownerId = attackerId;
    territory.capturedAt = new Date();
    territory.defenseLevel = 1;
    await territory.save();

    // Update stats
    const coinsEarned = captureCoinsReward(territory.defenseLevel);
    const xpEarned = captureXpReward(territory.defenseLevel);

    await User.findByIdAndUpdate(prevOwner, {
      $inc: { 'stats.totalLandOwned': -tileArea }
    });

    await User.findByIdAndUpdate(attackerId, {
      $inc: {
        'stats.totalLandOwned': tileArea,
        'stats.totalCaptures': 1,
        coins: coinsEarned,
        xp: xpEarned
      }
    });

    res.json({
      success: true,
      message: 'Territory captured!',
      coinsEarned,
      xpEarned,
      geohash
    });
  } catch (error) {
    console.error('Battle error:', error);
    res.status(500).json({ message: 'Error during battle' });
  }
};
