const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getGlobalLeaderboard,
  getCityLeaderboard,
  getWeeklyLeaderboard
} = require('../controllers/leaderboardController');

router.get('/global', auth, getGlobalLeaderboard);
router.get('/city/:city', auth, getCityLeaderboard);
router.get('/weekly', auth, getWeeklyLeaderboard);

module.exports = router;
