const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Get active challenges
exports.getActiveChallenges = async (req, res) => {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      activeFrom: { $lte: now },
      activeTo: { $gte: now }
    });

    // If no challenges exist, seed default ones
    if (challenges.length === 0) {
      const seeded = await seedDefaultChallenges();
      return res.json(seeded);
    }

    // Calculate progress for current user
    const userId = req.user.id;
    const user = await User.findById(userId);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const todayActivities = await Activity.find({
      userId,
      startedAt: { $gte: todayStart }
    });

    const weekActivities = await Activity.find({
      userId,
      startedAt: { $gte: weekAgo }
    });

    const todayDistance = todayActivities.reduce((sum, a) => sum + a.distance, 0);
    const weekDistance = weekActivities.reduce((sum, a) => sum + a.distance, 0);

    const withProgress = challenges.map(c => {
      let progress = 0;

      switch (c.metric) {
        case 'distance':
          progress = c.type === 'daily' ? todayDistance : weekDistance;
          break;
        case 'captures':
          progress = user.stats.totalCaptures;
          break;
        case 'streak':
          progress = user.streak.current;
          break;
        case 'steps':
          const steps = c.type === 'daily'
            ? todayDistance / 0.75
            : weekDistance / 0.75;
          progress = Math.round(steps);
          break;
        default:
          break;
      }

      return {
        ...c.toObject(),
        progress,
        completed: progress >= c.target,
        progressPercent: Math.min((progress / c.target) * 100, 100)
      };
    });

    res.json(withProgress);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
};

// Claim challenge reward
exports.claimReward = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Update user with rewards
    const user = await User.findByIdAndUpdate(userId, {
      $inc: {
        coins: challenge.reward.coins,
        xp: challenge.reward.xp
      }
    }, { new: true });

    res.json({
      message: 'Reward claimed!',
      reward: challenge.reward,
      newCoins: user.coins,
      newXp: user.xp
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(500).json({ message: 'Error claiming reward' });
  }
};

// Seed default challenges
async function seedDefaultChallenges() {
  const now = new Date();
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const defaults = [
    {
      title: 'Morning Walker',
      description: 'Walk 2 km today',
      icon: '🌅',
      type: 'daily',
      metric: 'distance',
      target: 2000,
      reward: { coins: 20, xp: 50, bonusLand: 0 },
      activeFrom: now,
      activeTo: todayEnd
    },
    {
      title: 'Step Master',
      description: 'Take 5,000 steps today',
      icon: '👟',
      type: 'daily',
      metric: 'steps',
      target: 5000,
      reward: { coins: 30, xp: 75, bonusLand: 0 },
      activeFrom: now,
      activeTo: todayEnd
    },
    {
      title: 'Territory Hunter',
      description: 'Capture 2 territories today',
      icon: '🏴',
      type: 'daily',
      metric: 'captures',
      target: 2,
      reward: { coins: 50, xp: 100, bonusLand: 0 },
      activeFrom: now,
      activeTo: todayEnd
    },
    {
      title: 'Weekly Marathon',
      description: 'Walk 20 km this week',
      icon: '🏃',
      type: 'weekly',
      metric: 'distance',
      target: 20000,
      reward: { coins: 100, xp: 250, bonusLand: 0 },
      activeFrom: now,
      activeTo: weekEnd
    },
    {
      title: 'Streak Builder',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      type: 'weekly',
      metric: 'streak',
      target: 3,
      reward: { coins: 75, xp: 150, bonusLand: 0 },
      activeFrom: now,
      activeTo: weekEnd
    },
    {
      title: 'Land Baron',
      description: 'Capture 10 territories this week',
      icon: '🏰',
      type: 'weekly',
      metric: 'captures',
      target: 10,
      reward: { coins: 150, xp: 350, bonusLand: 0 },
      activeFrom: now,
      activeTo: weekEnd
    }
  ];

  return await Challenge.insertMany(defaults);
}

module.exports.seedDefaultChallenges = seedDefaultChallenges;
