const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  stats: {
    totalDistance: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },
    totalLandOwned: { type: Number, default: 0 },
    totalCaptures: { type: Number, default: 0 },
    totalDefenses: { type: Number, default: 0 }
  },
  coins: { type: Number, default: 100 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  activeShield: {
    active: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }
  },
  activeBoosts: [{
    type: { type: String, enum: ['double_capture', 'speed_bonus', 'xp_multiplier'] },
    expiresAt: Date
  }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  achievements: [{ type: String }],
  streak: {
    current: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying (email & username already indexed via unique:true)
userSchema.index({ 'stats.totalLandOwned': -1 });
userSchema.index({ 'stats.totalDistance': -1 });
userSchema.index({ level: -1 });
userSchema.index({ city: 1 });

module.exports = mongoose.model('User', userSchema);
