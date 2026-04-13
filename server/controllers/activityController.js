const Activity = require('../models/Activity');
const User = require('../models/User');
const { calculatePathDistance, estimateCalories } = require('../services/territoryService');
const { distanceXp, distanceCoins, getLevelFromXp } = require('../services/xpService');

// Save a completed activity session
exports.saveActivity = async (req, res) => {
  try {
    const { path, duration, startedAt, endedAt, territoriesClaimed } = req.body;
    const userId = req.user.id;

    if (!path || !path.coordinates || path.coordinates.length < 2) {
      return res.status(400).json({ message: 'Invalid path data' });
    }

    const distance = calculatePathDistance(path.coordinates);
    const avgSpeed = duration > 0 ? distance / duration : 0;
    const calories = estimateCalories(distance, duration);

    const activity = await Activity.create({
      userId,
      path,
      distance,
      duration,
      avgSpeed,
      caloriesBurned: calories,
      territoriesClaimed: territoriesClaimed || [],
      startedAt: startedAt || new Date(Date.now() - duration * 1000),
      endedAt: endedAt || new Date()
    });

    // Update user stats
    const xpEarned = distanceXp(distance);
    const coinsEarned = distanceCoins(distance);
    const steps = Math.round(distance / 0.75); // ~0.75m per step

    const user = await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.totalDistance': distance,
        'stats.totalSteps': steps,
        xp: xpEarned,
        coins: coinsEarned
      }
    }, { new: true });

    // Update level
    const newLevel = getLevelFromXp(user.xp);
    if (newLevel !== user.level) {
      user.level = newLevel;
      await user.save();
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.streak.lastActiveDate
      ? new Date(user.streak.lastActiveDate).toDateString()
      : null;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastActive === yesterday ? user.streak.current + 1 : 1;

      await User.findByIdAndUpdate(userId, {
        'streak.current': newStreak,
        'streak.lastActiveDate': new Date()
      });
    }

    res.status(201).json({
      activity,
      rewards: {
        xpEarned,
        coinsEarned,
        steps,
        caloriesBurned: calories
      }
    });
  } catch (error) {
    console.error('Save activity error:', error);
    res.status(500).json({ message: 'Error saving activity' });
  }
};

// Get activity history
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const activities = await Activity.find({ userId })
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ userId });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Error fetching activity history' });
  }
};

// Get aggregated stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    let dateFrom;
    const now = new Date();

    switch (period) {
      case 'day':
        dateFrom = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        dateFrom = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        dateFrom = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
        dateFrom = new Date(0);
        break;
      default:
        dateFrom = new Date(now.setDate(now.getDate() - 7));
    }

    const activities = await Activity.find({
      userId,
      startedAt: { $gte: dateFrom }
    }).sort({ startedAt: 1 });

    // Daily aggregation
    const dailyStats = {};
    activities.forEach(a => {
      const day = new Date(a.startedAt).toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { distance: 0, duration: 0, calories: 0, steps: 0, sessions: 0 };
      }
      dailyStats[day].distance += a.distance;
      dailyStats[day].duration += a.duration;
      dailyStats[day].calories += a.caloriesBurned;
      dailyStats[day].steps += Math.round(a.distance / 0.75);
      dailyStats[day].sessions += 1;
    });

    // Convert to array
    const chartData = Object.entries(dailyStats).map(([date, data]) => ({
      date,
      ...data,
      distance: Math.round(data.distance),
      duration: Math.round(data.duration)
    }));

    // Totals
    const totals = activities.reduce((acc, a) => ({
      distance: acc.distance + a.distance,
      duration: acc.duration + a.duration,
      calories: acc.calories + a.caloriesBurned,
      sessions: acc.sessions + 1
    }), { distance: 0, duration: 0, calories: 0, sessions: 0 });

    res.json({
      period,
      totals: {
        ...totals,
        distance: Math.round(totals.distance),
        steps: Math.round(totals.distance / 0.75)
      },
      chartData
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
