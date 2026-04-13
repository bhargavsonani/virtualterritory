const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateLocation } = require('../middleware/antiCheat');
const {
  claimTerritory,
  getTerritoriesInArea,
  getUserTerritories,
  battleTerritory
} = require('../controllers/territoryController');

router.post('/claim', auth, claimTerritory);
router.get('/area', auth, getTerritoriesInArea);
router.get('/user/:userId', auth, getUserTerritories);
router.post('/battle', auth, battleTerritory);

module.exports = router;
