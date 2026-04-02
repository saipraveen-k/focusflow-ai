const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  preferences: {
    focusModes: {
      study: {
        enabled: { type: Boolean, default: true },
        allowedApps: [{ type: String }],
        blockedApps: [{ type: String }],
        priorityContacts: [{ type: String }]
      },
      work: {
        enabled: { type: Boolean, default: true },
        allowedApps: [{ type: String }],
        blockedApps: [{ type: String }],
        priorityContacts: [{ type: String }]
      },
      sleep: {
        enabled: { type: Boolean, default: true },
        allowedApps: [{ type: String }],
        blockedApps: [{ type: String }],
        priorityContacts: [{ type: String }]
      },
      leisure: {
        enabled: { type: Boolean, default: false },
        allowedApps: [{ type: String }],
        blockedApps: [{ type: String }],
        priorityContacts: [{ type: String }]
      }
    },
    notifications: {
      enableSounds: { type: Boolean, default: true },
      enableVibration: { type: Boolean, default: true },
      enableLED: { type: Boolean, default: false },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: "22:00" },
        end: { type: String, default: "07:00" }
      }
    },
    aiSettings: {
      sensitivity: { type: Number, default: 0.7, min: 0, max: 1 },
      learningEnabled: { type: Boolean, default: true },
      autoAdjust: { type: Boolean, default: true }
    }
  },
  currentActivity: {
    type: String,
    enum: ['study', 'work', 'sleep', 'leisure', 'none'],
    default: 'none'
  },
  stats: {
    totalNotifications: { type: Number, default: 0 },
    blockedNotifications: { type: Number, default: 0 },
    delayedNotifications: { type: Number, default: 0 },
    allowedNotifications: { type: Number, default: 0 },
    focusTimeMinutes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
