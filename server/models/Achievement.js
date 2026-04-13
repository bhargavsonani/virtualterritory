// Achievement definitions — stored as constants, tracked by ID in user.achievements
const ACHIEVEMENTS = {
  FIRST_STEP: {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first activity',
    icon: '👣',
    xpReward: 50,
    coinReward: 25
  },
  FIRST_TERRITORY: {
    id: 'first_territory',
    title: 'Landowner',
    description: 'Claim your first territory',
    icon: '🏴',
    xpReward: 100,
    coinReward: 50
  },
  WALK_1KM: {
    id: 'walk_1km',
    title: 'Getting Started',
    description: 'Walk 1 kilometer total',
    icon: '🚶',
    xpReward: 75,
    coinReward: 30
  },
  WALK_10KM: {
    id: 'walk_10km',
    title: 'Road Warrior',
    description: 'Walk 10 kilometers total',
    icon: '🏃',
    xpReward: 200,
    coinReward: 100
  },
  WALK_50KM: {
    id: 'walk_50km',
    title: 'Marathon Spirit',
    description: 'Walk 50 kilometers total',
    icon: '🏅',
    xpReward: 500,
    coinReward: 250
  },
  WALK_100KM: {
    id: 'walk_100km',
    title: 'Ultra Runner',
    description: 'Walk 100 kilometers total',
    icon: '🏆',
    xpReward: 1000,
    coinReward: 500
  },
  CAPTURE_5: {
    id: 'capture_5',
    title: 'Raider',
    description: 'Capture 5 enemy territories',
    icon: '⚔️',
    xpReward: 150,
    coinReward: 75
  },
  CAPTURE_25: {
    id: 'capture_25',
    title: 'Conqueror',
    description: 'Capture 25 enemy territories',
    icon: '👑',
    xpReward: 400,
    coinReward: 200
  },
  CAPTURE_100: {
    id: 'capture_100',
    title: 'Empire Builder',
    description: 'Capture 100 enemy territories',
    icon: '🏰',
    xpReward: 1000,
    coinReward: 500
  },
  OWN_1_ACRE: {
    id: 'own_1_acre',
    title: 'First Acre',
    description: 'Own 1 acre of land (4047 m²)',
    icon: '🌍',
    xpReward: 200,
    coinReward: 100
  },
  OWN_10_ACRES: {
    id: 'own_10_acres',
    title: 'Landlord',
    description: 'Own 10 acres of land',
    icon: '🗺️',
    xpReward: 750,
    coinReward: 350
  },
  STREAK_3: {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Maintain a 3-day activity streak',
    icon: '🔥',
    xpReward: 100,
    coinReward: 50
  },
  STREAK_7: {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day activity streak',
    icon: '💥',
    xpReward: 300,
    coinReward: 150
  },
  STREAK_30: {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day activity streak',
    icon: '⚡',
    xpReward: 1000,
    coinReward: 500
  },
  DEFEND_5: {
    id: 'defend_5',
    title: 'Guardian',
    description: 'Successfully defend 5 territories',
    icon: '🛡️',
    xpReward: 150,
    coinReward: 75
  },
  LEVEL_5: {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 200,
    coinReward: 100
  },
  LEVEL_10: {
    id: 'level_10',
    title: 'Veteran',
    description: 'Reach level 10',
    icon: '🌟',
    xpReward: 500,
    coinReward: 250
  },
  CITY_CONQUEROR: {
    id: 'city_conqueror',
    title: 'City Conqueror',
    description: 'Be #1 in your city leaderboard',
    icon: '🏙️',
    xpReward: 1000,
    coinReward: 500
  }
};

module.exports = ACHIEVEMENTS;
