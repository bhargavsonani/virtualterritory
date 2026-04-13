const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validatePath } = require('../middleware/antiCheat');
const { saveActivity, getHistory, getStats } = require('../controllers/activityController');

router.post('/save', auth, validatePath, saveActivity);
router.get('/history', auth, getHistory);
router.get('/stats', auth, getStats);

module.exports = router;
