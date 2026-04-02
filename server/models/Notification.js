const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalId: {
    type: String,
    required: true
  },
  app: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  activity: {
    type: String,
    enum: ['study', 'work', 'sleep', 'leisure', 'none'],
    required: true
  },
  decision: {
    type: String,
    enum: ['SHOW', 'DELAY', 'BLOCK'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  mlProbabilities: {
    SHOW: Number,
    DELAY: Number,
    BLOCK: Number
  },
  contextData: {
    hourOfDay: Number,
    isWeekday: Boolean,
    isWeekend: Boolean,
    messageLength: Number,
    hasUrgencyKeyword: Boolean
  },
  ruleBasedDecision: {
    type: String,
    enum: ['SHOW', 'DELAY', 'BLOCK']
  },
  finalDecisionSource: {
    type: String,
    enum: ['ML_ONLY', 'RULES_ONLY', 'ML_PLUS_RULES'],
    default: 'ML_PLUS_RULES'
  },
  userFeedback: {
    type: String,
    enum: ['correct', 'incorrect', 'neutral']
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  delayedUntil: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  metadata: {
    deviceType: String,
    location: String,
    batteryLevel: Number,
    isCharging: Boolean
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, timestamp: -1 });
notificationSchema.index({ userId: 1, decision: 1 });
notificationSchema.index({ userId: 1, activity: 1 });
notificationSchema.index({ app: 1, timestamp: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
