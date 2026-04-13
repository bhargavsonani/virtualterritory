const User = require('../models/User');

// Shop items definition
const SHOP_ITEMS = [
  {
    id: 'shield_1h',
    name: 'Basic Shield',
    description: 'Protect your territory for 1 hour',
    icon: '🛡️',
    price: 50,
    type: 'shield',
    duration: 3600 // seconds
  },
  {
    id: 'shield_6h',
    name: 'Advanced Shield',
    description: 'Protect your territory for 6 hours',
    icon: '🛡️',
    price: 200,
    type: 'shield',
    duration: 21600
  },
  {
    id: 'shield_24h',
    name: 'Fortress Shield',
    description: 'Protect your territory for 24 hours',
    icon: '🏰',
    price: 500,
    type: 'shield',
    duration: 86400
  },
  {
    id: 'double_capture',
    name: 'Double Capture',
    description: 'Claim double territory for 30 minutes',
    icon: '⚡',
    price: 100,
    type: 'boost',
    boostType: 'double_capture',
    duration: 1800
  },
  {
    id: 'speed_bonus',
    name: 'Speed Bonus',
    description: 'Capture territories 50% faster for 1 hour',
    icon: '🚀',
    price: 150,
    type: 'boost',
    boostType: 'speed_bonus',
    duration: 3600
  },
  {
    id: 'xp_multiplier',
    name: 'XP Boost',
    description: 'Earn double XP for 1 hour',
    icon: '✨',
    price: 120,
    type: 'boost',
    boostType: 'xp_multiplier',
    duration: 3600
  }
];

// Get shop items
exports.getItems = async (req, res) => {
  try {
    res.json(SHOP_ITEMS);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shop items' });
  }
};

// Buy item
exports.buyItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const user = await User.findById(userId);
    if (user.coins < item.price) {
      return res.status(400).json({
        message: 'Not enough coins',
        required: item.price,
        current: user.coins
      });
    }

    // Deduct coins
    user.coins -= item.price;

    // Apply item effect
    const expiresAt = new Date(Date.now() + item.duration * 1000);

    if (item.type === 'shield') {
      user.activeShield = {
        active: true,
        expiresAt
      };
    } else if (item.type === 'boost') {
      user.activeBoosts.push({
        type: item.boostType,
        expiresAt
      });
    }

    await user.save();

    res.json({
      message: `${item.name} activated!`,
      item: item.name,
      expiresAt,
      remainingCoins: user.coins
    });
  } catch (error) {
    console.error('Buy item error:', error);
    res.status(500).json({ message: 'Error purchasing item' });
  }
};
