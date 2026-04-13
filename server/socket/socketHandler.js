/**
 * Socket.io Event Handlers
 * Handles real-time communication between clients and server
 */

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

// Track online users: { socketId: { userId, username, location } }
const onlineUsers = new Map();

function setupSocketHandlers(io) {
  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // Track online user
    onlineUsers.set(socket.id, {
      userId: socket.user.id,
      username: socket.user.username,
      location: null
    });

    // Broadcast online count
    io.emit('users:online', onlineUsers.size);

    // --- Location Updates ---
    socket.on('user:location', (data) => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        user.location = data.location; // { lat, lng }

        // Broadcast location to nearby users
        socket.broadcast.emit('user:nearby', {
          userId: socket.user.id,
          username: socket.user.username,
          location: data.location
        });
      }
    });

    // --- Territory Events ---
    socket.on('territory:claim', (data) => {
      // Broadcast territory claim to all users
      io.emit('territory:claimed', {
        userId: socket.user.id,
        username: socket.user.username,
        geohashes: data.geohashes,
        count: data.count
      });
    });

    socket.on('territory:invaded', (data) => {
      // Notify the territory owner
      const ownerSocket = findSocketByUserId(data.ownerId);
      if (ownerSocket) {
        io.to(ownerSocket).emit('territory:invaded', {
          attackerId: socket.user.id,
          attackerName: socket.user.username,
          geohash: data.geohash
        });
      }
    });

    // --- Battle Events ---
    socket.on('battle:start', (data) => {
      const ownerSocket = findSocketByUserId(data.ownerId);
      if (ownerSocket) {
        io.to(ownerSocket).emit('battle:start', {
          attackerId: socket.user.id,
          attackerName: socket.user.username,
          geohash: data.geohash,
          requiredTime: data.requiredTime
        });
      }
    });

    socket.on('battle:result', (data) => {
      io.emit('battle:result', {
        ...data,
        attackerName: socket.user.username
      });
    });

    // --- Notifications ---
    socket.on('notification:send', (data) => {
      const targetSocket = findSocketByUserId(data.targetUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('notification', {
          type: data.type,
          message: data.message,
          from: socket.user.username,
          timestamp: new Date()
        });
      }
    });

    // --- Leaderboard ---
    socket.on('leaderboard:update', () => {
      io.emit('leaderboard:update');
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.username}`);
      onlineUsers.delete(socket.id);
      io.emit('users:online', onlineUsers.size);
    });
  });

  /**
   * Find a socket ID by user ID
   */
  function findSocketByUserId(userId) {
    for (const [socketId, user] of onlineUsers.entries()) {
      if (user.userId === userId) return socketId;
    }
    return null;
  }
}

module.exports = setupSocketHandlers;
