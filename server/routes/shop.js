const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getItems, buyItem } = require('../controllers/shopController');

router.get('/items', auth, getItems);
router.post('/buy', auth, buyItem);

module.exports = router;
