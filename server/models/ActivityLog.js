const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: String,
    enum: ['study', 'work', 'sleep', 'leisure', 'none'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number, // in minutes
  notificationsReceived: {
    type: Number,
    default: 0
  },
  notificationsBlocked: {
    type: Number,
    default: 0
  },
  notificationsDelayed: {
    type: Number,
    default: 0
  },
  notificationsAllowed: {
    type: Number,
    default: 0
  },
  productivityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
activityLogSchema.index({ userId: 1, startTime: -1 });
activityLogSchema.index({ userId: 1, activity: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
