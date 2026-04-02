const axios = require('axios');
const ContextEngine = require('./contextEngine');

class DecisionEngine {
  constructor() {
    this.contextEngine = new ContextEngine();
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:5001';
  }

  async makeDecision(notification, user, context) {
    try {
      // Get ML prediction
      const mlPrediction = await this.getMLPrediction(notification, context);
      
      // Get rule-based decision
      const ruleDecision = this.getRuleBasedDecision(notification, user, context);
      
      // Combine decisions
      const finalDecision = this.combineDecisions(mlPrediction, ruleDecision, user);
      
      return {
        decision: finalDecision.action,
        confidence: finalDecision.confidence,
        mlPrediction,
        ruleDecision,
        decisionSource: finalDecision.source,
        reasoning: finalDecision.reasoning
      };
    } catch (error) {
      console.error('Error making decision:', error);
      // Fallback to rule-based decision
      const ruleDecision = this.getRuleBasedDecision(notification, user, context);
      return {
        decision: ruleDecision.action,
        confidence: 0.5,
        mlPrediction: null,
        ruleDecision,
        decisionSource: 'RULES_ONLY_FALLBACK',
        reasoning: 'ML service unavailable, using rules only'
      };
    }
  }

  async getMLPrediction(notification, context) {
    try {
      const payload = {
        app: notification.app,
        sender: notification.sender,
        message: notification.message,
        activity: context.activity,
        timestamp: context.timestamp,
        is_weekday: context.isWeekday ? 1 : 0
      };

      const response = await axios.post(`${this.mlApiUrl}/predict`, payload, {
        timeout: 2000, // 2 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        return {
          action: response.data.prediction,
          confidence: response.data.confidence,
          probabilities: response.data.probabilities,
          features: response.data.processed_features
        };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('ML prediction failed:', error.message);
      throw error;
    }
  }

  getRuleBasedDecision(notification, user, context) {
    const messageAnalysis = this.contextEngine.analyzeMessage(notification.message);
    const appPriority = this.contextEngine.getAppPriority(notification.app, user);
    
    let score = 0;
    let reasoning = [];

    // App priority scoring
    if (appPriority === 'critical') {
      score += 0.8;
      reasoning.push('Critical priority app');
    } else if (appPriority === 'high') {
      score += 0.6;
      reasoning.push('High priority app');
    } else if (appPriority === 'medium') {
      score += 0.4;
      reasoning.push('Medium priority app');
    } else {
      score += 0.2;
      reasoning.push('Low priority app');
    }

    // Message analysis scoring
    if (messageAnalysis.hasUrgencyKeyword) {
      score += 0.3;
      reasoning.push('Contains urgency keyword');
    }

    if (messageAnalysis.isPrioritySender) {
      score += 0.2;
      reasoning.push('Priority sender detected');
    }

    // Context-based scoring
    if (context.activity === 'sleep') {
      score -= 0.4;
      reasoning.push('User is sleeping');
    } else if (context.activity === 'study' || context.activity === 'work') {
      if (appPriority === 'low') {
        score -= 0.3;
        reasoning.push('Low priority app during focus time');
      }
    }

    // Time-based scoring
    if (context.isSleepTime) {
      score -= 0.3;
      reasoning.push('Sleep time hours');
    }

    // Quiet hours check
    if (user.preferences.notifications.quietHours.enabled) {
      const shouldShow = this.contextEngine.shouldShowDuringQuietHours(
        notification, 
        user.preferences.notifications.quietHours
      );
      if (!shouldShow) {
        score -= 0.2;
        reasoning.push('Quiet hours active');
      }
    }

    // User preferences for current activity
    if (user.preferences.focusModes[context.activity]) {
      const activityPrefs = user.preferences.focusModes[context.activity];
      
      if (activityPrefs.blockedApps.includes(notification.app)) {
        score -= 0.5;
        reasoning.push('App blocked in current activity mode');
      }
      
      if (activityPrefs.allowedApps.includes(notification.app)) {
        score += 0.3;
        reasoning.push('App allowed in current activity mode');
      }
      
      if (activityPrefs.priorityContacts.includes(notification.sender)) {
        score += 0.4;
        reasoning.push('Priority contact in current activity mode');
      }
    }

    // Normalize score to 0-1 range
    score = Math.max(0, Math.min(1, score));

    // Convert score to action
    let action;
    if (score >= 0.7) {
      action = 'SHOW';
    } else if (score >= 0.4) {
      action = 'DELAY';
    } else {
      action = 'BLOCK';
    }

    return {
      action,
      confidence: score,
      score,
      reasoning: reasoning.join('; ')
    };
  }

  combineDecisions(mlPrediction, ruleDecision, user) {
    if (!mlPrediction) {
      return {
        action: ruleDecision.action,
        confidence: ruleDecision.confidence,
        source: 'RULES_ONLY',
        reasoning: ruleDecision.reasoning
      };
    }

    const mlConfidence = mlPrediction.confidence;
    const ruleConfidence = ruleDecision.confidence;
    const userSensitivity = user.preferences.aiSettings.sensitivity || 0.7;

    // Weight the decisions based on confidence and user sensitivity
    let mlWeight = mlConfidence * userSensitivity;
    let ruleWeight = ruleConfidence * (1 - userSensitivity);

    // Create weighted scores for each action
    const actions = ['SHOW', 'DELAY', 'BLOCK'];
    const scores = {};

    actions.forEach(action => {
      const mlScore = mlPrediction.probabilities[action] || 0;
      const ruleScore = ruleDecision.action === action ? 1 : 0;
      
      scores[action] = (mlScore * mlWeight) + (ruleScore * ruleWeight);
    });

    // Find the action with highest score
    const bestAction = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const finalConfidence = scores[bestAction];

    // Determine decision source
    let source;
    if (mlWeight > ruleWeight * 1.5) {
      source = 'ML_PRIMARILY';
    } else if (ruleWeight > mlWeight * 1.5) {
      source = 'RULES_PRIMARILY';
    } else {
      source = 'ML_PLUS_RULES';
    }

    // Create reasoning
    const reasoning = `ML: ${mlPrediction.action} (${mlConfidence.toFixed(2)}), Rules: ${ruleDecision.action} (${ruleConfidence.toFixed(2)}), Final: ${bestAction} (${finalConfidence.toFixed(2)})`;

    return {
      action: bestAction,
      confidence: finalConfidence,
      source,
      reasoning
    };
  }

  async batchDecisions(notifications, user) {
    const decisions = [];
    
    for (const notification of notifications) {
      const context = this.contextEngine.getContext(user._id, user.currentActivity);
      const decision = await this.makeDecision(notification, user, context);
      decisions.push({
        notificationId: notification._id,
        ...decision
      });
    }
    
    return decisions;
  }

  learnFromFeedback(notificationId, userFeedback, originalDecision) {
    // This would typically send feedback to the ML service for retraining
    // For now, we'll just log it for future analysis
    console.log(`Feedback received for notification ${notificationId}:`, {
      userFeedback,
      originalDecision,
      timestamp: new Date().toISOString()
    });

    // In a production system, you would:
    // 1. Store feedback in database
    // 2. Periodically retrain the model with new data
    // 3. Adjust user preferences based on patterns
    
    return {
      success: true,
      message: 'Feedback recorded for model improvement'
    };
  }
}

module.exports = DecisionEngine;
