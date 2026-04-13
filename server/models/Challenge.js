const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true
  },
  metric: {
    type: String,
    enum: ['distance', 'captures', 'streak', 'steps', 'battles_won'],
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  reward: {
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    bonusLand: { type: Number, default: 0 }
  },
  activeFrom: {
    type: Date,
    required: true
  },
  activeTo: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

challengeSchema.index({ type: 1, activeFrom: 1, activeTo: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
