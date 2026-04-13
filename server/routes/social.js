const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  searchUsers,
  removeFriend
} = require('../controllers/socialController');

router.get('/friends', auth, getFriends);
router.post('/friend-request', auth, sendFriendRequest);
router.post('/friend-accept', auth, acceptFriendRequest);
router.delete('/friend/:friendId', auth, removeFriend);
router.get('/search', auth, searchUsers);

module.exports = router;
