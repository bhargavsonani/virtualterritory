const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getActiveChallenges, claimReward } = require('../controllers/challengeController');

router.get('/active', auth, getActiveChallenges);
router.post('/claim', auth, claimReward);

module.exports = router;
