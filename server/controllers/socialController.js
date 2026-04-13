const User = require('../models/User');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user.id;

    if (targetUserId === userId) {
      return res.status(400).json({ message: "You can't add yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    if (targetUser.friendRequests.includes(userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(userId);
    await targetUser.save();

    res.json({ message: 'Friend request sent!' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    // Add to friends (both ways)
    if (!user.friends.includes(requesterId)) {
      user.friends.push(requesterId);
    }
    if (!requester.friends.includes(userId)) {
      requester.friends.push(userId);
    }

    await user.save();
    await requester.save();

    res.json({ message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

// Get friends list
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username avatar level stats city')
      .populate('friendRequests', 'username avatar level');

    res.json({
      friends: user.friends,
      pendingRequests: user.friendRequests
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      username: new RegExp(q, 'i'),
      _id: { $ne: req.user.id }
    })
      .select('username avatar level city stats.totalLandOwned')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
};
