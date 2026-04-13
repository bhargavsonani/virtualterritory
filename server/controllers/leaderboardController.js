const User = require('../models/User');

// Global leaderboard
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { metric = 'totalLandOwned', limit = 50, page = 1 } = req.query;

    const sortField = `stats.${metric}`;
    const users = await User.find()
      .select('username avatar level city stats')
      .sort({ [sortField]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add rank
    const offset = (page - 1) * limit;
    const leaderboard = users.map((user, index) => ({
      rank: offset + index + 1,
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      city: user.city,
      stats: user.stats
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// City leaderboard
exports.getCityLeaderboard = async (req, res) => {
  try {
    const { city } = req.params;
    const { metric = 'totalLandOwned', limit = 50 } = req.query;

    const sortField = `stats.${metric}`;
    const users = await User.find({ city: new RegExp(city, 'i') })
      .select('username avatar level city stats')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      city: user.city,
      stats: user.stats
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('City leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching city leaderboard' });
  }
};

// Weekly leaderboard (based on recent activity)
exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const Activity = require('../models/Activity');
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyStats = await Activity.aggregate([
      { $match: { startedAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: '$userId',
          totalDistance: { $sum: '$distance' },
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { totalDistance: -1 } },
      { $limit: 50 }
    ]);

    // Populate user info
    const userIds = weeklyStats.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username avatar level city');

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const leaderboard = weeklyStats.map((stat, index) => {
      const user = userMap[stat._id.toString()] || {};
      return {
        rank: index + 1,
        id: stat._id,
        username: user.username || 'Unknown',
        avatar: user.avatar || '',
        level: user.level || 1,
        weeklyDistance: Math.round(stat.totalDistance),
        weeklySessions: stat.totalSessions,
        weeklyDuration: Math.round(stat.totalDuration)
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Weekly leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching weekly leaderboard' });
  }
};
