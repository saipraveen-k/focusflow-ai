const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const DecisionEngine = require('../services/decisionEngine');
const ContextEngine = require('../services/contextEngine');
const mongoose = require('mongoose');

const decisionEngine = new DecisionEngine();
const contextEngine = new ContextEngine();

// POST /api/notifications - Receive and process a new notification
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      app,
      sender,
      message,
      timestamp = new Date(),
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!userId || !app || !sender || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, app, sender, message'
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get context
    const context = contextEngine.getContext(userId, user.currentActivity);

    // Create notification object
    const notificationData = {
      userId,
      originalId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      app,
      sender,
      message,
      timestamp: new Date(timestamp),
      activity: context.activity,
      metadata
    };

    // Make decision
    const decisionResult = await decisionEngine.makeDecision(
      notificationData,
      user,
      context
    );

    // Complete notification data with decision
    notificationData.decision = decisionResult.decision;
    notificationData.confidence = decisionResult.confidence;
    notificationData.mlProbabilities = decisionResult.mlPrediction?.probabilities;
    notificationData.contextData = {
      hourOfDay: context.hourOfDay,
      isWeekday: context.isWeekday,
      isWeekend: context.isWeekend,
      messageLength: message.length,
      hasUrgencyKeyword: contextEngine.analyzeMessage(message).hasUrgencyKeyword
    };
    notificationData.ruleBasedDecision = decisionResult.ruleDecision?.action;
    notificationData.finalDecisionSource = decisionResult.decisionSource;

    // Save notification to database
    const notification = new Notification(notificationData);
    await notification.save();

    // Update user stats
    await updateUserStats(user, decisionResult.decision);

    // Handle delayed notifications
    if (decisionResult.decision === 'DELAY') {
      notification.delayedUntil = calculateDelayTime(context);
      await notification.save();
    }

    // Handle immediate delivery
    if (decisionResult.decision === 'SHOW') {
      notification.delivered = true;
      notification.deliveredAt = new Date();
      await notification.save();
    }

    // Log activity
    await logActivity(user, notification, decisionResult);

    res.status(201).json({
      success: true,
      notification: {
        id: notification._id,
        originalId: notification.originalId,
        app: notification.app,
        sender: notification.sender,
        message: notification.message,
        decision: notification.decision,
        confidence: notification.confidence,
        reasoning: decisionResult.reasoning,
        delayedUntil: notification.delayedUntil
      }
    });

  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/notifications - Get user's notifications
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 50, skip = 0, decision, activity } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const filter = { userId };
    if (decision) filter.decision = decision;
    if (activity) filter.activity = activity;

    const notifications = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-__v');

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const { userId, period = '24h' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get statistics
    const stats = await Notification.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: '$decision',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    // Get app statistics
    const appStats = await Notification.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startTime }
        }
      },
      {
        $group: {
          _id: '$app',
          total: { $sum: 1 },
          shown: {
            $sum: { $cond: [{ $eq: ['$decision', 'SHOW'] }, 1, 0] }
          },
          delayed: {
            $sum: { $cond: [{ $eq: ['$decision', 'DELAY'] }, 1, 0] }
          },
          blocked: {
            $sum: { $cond: [{ $eq: ['$decision', 'BLOCK'] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      shown: 0,
      delayed: 0,
      blocked: 0,
      avgConfidence: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id.toLowerCase()] = stat.count;
    });

    // Calculate productivity score
    const productivityScore = Math.round(
      ((formattedStats.shown + formattedStats.delayed) / formattedStats.total) * 100
    ) || 0;

    res.json({
      success: true,
      period,
      stats: formattedStats,
      appStats,
      productivityScore,
      userStats: user.stats,
      currentActivity: user.currentActivity
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/notifications/:id/feedback - Provide feedback on notification decision
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body; // 'correct', 'incorrect', 'neutral'

    if (!['correct', 'incorrect', 'neutral'].includes(feedback)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback value'
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Update notification with feedback
    notification.userFeedback = feedback;
    await notification.save();

    // Learn from feedback
    const learningResult = decisionEngine.learnFromFeedback(
      id,
      feedback,
      notification.decision
    );

    res.json({
      success: true,
      feedback: notification.userFeedback,
      learning: learningResult
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/notifications/process-delayed - Process delayed notifications
router.post('/process-delayed', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const now = new Date();
    const delayedNotifications = await Notification.find({
      userId,
      decision: 'DELAY',
      delayedUntil: { $lte: now },
      delivered: false
    });

    const processedNotifications = [];

    for (const notification of delayedNotifications) {
      notification.delivered = true;
      notification.deliveredAt = now;
      await notification.save();
      
      processedNotifications.push({
        id: notification._id,
        originalId: notification.originalId,
        app: notification.app,
        sender: notification.sender,
        message: notification.message
      });
    }

    res.json({
      success: true,
      processedCount: processedNotifications.length,
      notifications: processedNotifications
    });

  } catch (error) {
    console.error('Error processing delayed notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper functions
async function updateUserStats(user, decision) {
  user.stats.totalNotifications += 1;
  
  switch (decision) {
    case 'SHOW':
      user.stats.allowedNotifications += 1;
      break;
    case 'DELAY':
      user.stats.delayedNotifications += 1;
      break;
    case 'BLOCK':
      user.stats.blockedNotifications += 1;
      break;
  }
  
  await user.save();
}

async function logActivity(user, notification, decisionResult) {
  // This would typically update activity logs
  // For now, we'll just update user's focus time if in focus mode
  if (['study', 'work'].includes(user.currentActivity)) {
    user.stats.focusTimeMinutes += 1;
    await user.save();
  }
}

function calculateDelayTime(context) {
  const delayMinutes = {
    'study': 60,
    'work': 30,
    'sleep': 480, // 8 hours
    'leisure': 15
  };
  
  const delay = delayMinutes[context.activity] || 30;
  return new Date(Date.now() + delay * 60 * 1000);
}

module.exports = router;
