const moment = require('moment');

class ContextEngine {
  constructor() {
    this.urgencyKeywords = [
      'urgent', 'emergency', 'important', 'asap', 'immediate', 
      'critical', 'alert', 'warning', 'deadline', 'meeting'
    ];
    
    this.prioritySenders = [
      'boss', 'manager', 'teacher', 'professor', 'doctor', 
      'emergency', 'bank', 'security', 'admin'
    ];
  }

  getContext(userId, userActivity = null) {
    const now = moment();
    
    return {
      timestamp: now.unix(),
      hourOfDay: now.hour(),
      dayOfWeek: now.day(),
      isWeekday: now.day() >= 1 && now.day() <= 5,
      isWeekend: now.day() === 0 || now.day() === 6,
      activity: userActivity || this.detectActivity(now),
      timeOfDay: this.getTimeOfDay(now.hour()),
      isWorkingHours: this.isWorkingHours(now.hour()),
      isSleepTime: this.isSleepTime(now.hour())
    };
  }

  detectActivity(moment) {
    const hour = moment.hour();
    
    if (hour >= 6 && hour < 9) return 'leisure';
    if (hour >= 9 && hour < 12) return 'work';
    if (hour >= 12 && hour < 13) return 'leisure';
    if (hour >= 13 && hour < 17) return 'work';
    if (hour >= 17 && hour < 20) return 'leisure';
    if (hour >= 20 && hour < 22) return 'study';
    if (hour >= 22 || hour < 6) return 'sleep';
    
    return 'leisure';
  }

  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  isWorkingHours(hour) {
    return hour >= 9 && hour <= 17;
  }

  isSleepTime(hour) {
    return hour >= 22 || hour <= 6;
  }

  analyzeMessage(message) {
    const messageLower = message.toLowerCase();
    const messageLength = message.length;
    
    // Check for urgency keywords
    const hasUrgencyKeyword = this.urgencyKeywords.some(keyword => 
      messageLower.includes(keyword)
    );
    
    // Check for priority sender patterns
    const isPrioritySender = this.prioritySenders.some(sender => 
      messageLower.includes(sender)
    );
    
    // Detect question (ends with ?)
    const isQuestion = message.trim().endsWith('?');
    
    // Detect call to action
    const callToActionWords = ['call', 'text', 'reply', 'respond', 'answer'];
    const hasCallToAction = callToActionWords.some(word => 
      messageLower.includes(word)
    );
    
    // Detect personal vs promotional
    const personalWords = ['you', 'your', 'my', 'our', 'we', 'us'];
    const promotionalWords = ['sale', 'discount', 'offer', 'deal', 'buy', 'shop'];
    
    const personalCount = personalWords.filter(word => 
      messageLower.includes(word)
    ).length;
    
    const promotionalCount = promotionalWords.filter(word => 
      messageLower.includes(word)
    ).length;
    
    const isPersonal = personalCount > promotionalCount;
    const isPromotional = promotionalCount > 0;
    
    return {
      messageLength,
      hasUrgencyKeyword,
      isPrioritySender,
      isQuestion,
      hasCallToAction,
      isPersonal,
      isPromotional,
      urgencyScore: this.calculateUrgencyScore({
        hasUrgencyKeyword,
        isPrioritySender,
        isQuestion,
        hasCallToAction,
        messageLength
      })
    };
  }

  calculateUrgencyScore(analysis) {
    let score = 0;
    
    if (analysis.hasUrgencyKeyword) score += 0.4;
    if (analysis.isPrioritySender) score += 0.3;
    if (analysis.isQuestion) score += 0.1;
    if (analysis.hasCallToAction) score += 0.1;
    
    // Short messages might be more urgent
    if (analysis.messageLength < 50) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  getAppPriority(app, userPreferences = null) {
    const appPriorities = {
      // High priority apps
      'whatsapp': 'high',
      'telegram': 'high',
      'gmail': 'high',
      'slack': 'high',
      'teams': 'high',
      'zoom': 'high',
      'phone': 'critical',
      'messages': 'critical',
      
      // Medium priority apps
      'linkedin': 'medium',
      'outlook': 'medium',
      'calendar': 'medium',
      'reminder': 'medium',
      
      // Low priority apps
      'instagram': 'low',
      'facebook': 'low',
      'twitter': 'low',
      'tiktok': 'low',
      'youtube': 'low',
      'spotify': 'low',
      'amazon': 'low',
      'netflix': 'low'
    };
    
    // Check user preferences first
    if (userPreferences) {
      const activityPrefs = userPreferences.focusModes[userPreferences.currentActivity];
      if (activityPrefs) {
        if (activityPrefs.allowedApps.includes(app)) return 'high';
        if (activityPrefs.blockedApps.includes(app)) return 'low';
      }
    }
    
    return appPriorities[app.toLowerCase()] || 'medium';
  }

  shouldShowDuringQuietHours(notification, quietHours) {
    if (!quietHours.enabled) return true;
    
    const now = moment();
    const currentTime = now.format('HH:mm');
    const startTime = quietHours.start;
    const endTime = quietHours.end;
    
    const isQuietTime = this.isTimeInRange(currentTime, startTime, endTime);
    
    if (!isQuietTime) return true;
    
    // During quiet hours, only show urgent notifications
    const messageAnalysis = this.analyzeMessage(notification.message);
    return messageAnalysis.hasUrgencyKeyword || messageAnalysis.urgencyScore > 0.7;
  }

  isTimeInRange(currentTime, startTime, endTime) {
    const current = moment(currentTime, 'HH:mm');
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    
    if (end.isBefore(start)) {
      // Range spans midnight
      return current.isSameOrAfter(start) || current.isBefore(end);
    } else {
      // Normal range
      return current.isSameOrAfter(start) && current.isBefore(end);
    }
  }
}

module.exports = ContextEngine;
