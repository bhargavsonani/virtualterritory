const mongoose = require('mongoose');

const territorySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  geohash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  area: {
    type: Number,
    default: 0
  },
  defenseLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  capturedAt: {
    type: Date,
    default: Date.now
  },
  lastDefendedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Geospatial indexes for efficient spatial queries (geohash already indexed via unique:true)
territorySchema.index({ geometry: '2dsphere' });
territorySchema.index({ center: '2dsphere' });
territorySchema.index({ ownerId: 1 });

module.exports = mongoose.model('Territory', territorySchema);
