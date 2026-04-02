#!/usr/bin/env python3
"""
FocusFlow AI - Demo Flow Simulation

This script simulates the notification filtering system in action,
demonstrating how different notifications are processed based on
user context and activity mode.

Usage:
    python demo/demo_simulation.py
"""

import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

# Activity modes with their configurations
ACTIVITY_MODES = {
    'study': {
        'name': '📚 Study Mode',
        'description': 'Maximum focus - blocks distractions',
        'blocked_apps': ['instagram', 'facebook', 'tiktok', 'youtube', 'netflix', 'twitter'],
        'allowed_apps': ['gmail', 'whatsapp', 'slack', 'zoom', 'teams'],
        'priority_contacts': ['teacher', 'professor', 'emergency', 'mom', 'dad'],
        'context_penalty': -0.3
    },
    'work': {
        'name': '💼 Work Mode',
        'description': 'Professional focus - prioritizes work apps',
        'blocked_apps': ['instagram', 'facebook', 'tiktok', 'youtube', 'netflix', 'twitter', 'gaming'],
        'allowed_apps': ['slack', 'teams', 'gmail', 'outlook', 'zoom', 'linkedin'],
        'priority_contacts': ['boss', 'manager', 'client', 'emergency'],
        'context_penalty': -0.2
    },
    'sleep': {
        'name': '😴 Sleep Mode',
        'description': 'Rest mode - only emergencies get through',
        'blocked_apps': ['instagram', 'facebook', 'tiktok', 'youtube', 'netflix', 'twitter', 'slack', 'teams'],
        'allowed_apps': ['phone', 'messages'],
        'priority_contacts': ['emergency', 'family', 'mom', 'dad'],
        'context_penalty': -0.5
    },
    'leisure': {
        'name': '🎮 Leisure Mode',
        'description': 'Relaxation time - minimal filtering',
        'blocked_apps': [],
        'allowed_apps': [],
        'priority_contacts': [],
        'context_penalty': 0.1
    }
}

# App priority levels
APP_PRIORITIES = {
    'phone': 'critical',
    'messages': 'critical',
    'whatsapp': 'high',
    'telegram': 'high',
    'gmail': 'high',
    'slack': 'high',
    'teams': 'high',
    'zoom': 'high',
    'outlook': 'medium',
    'linkedin': 'medium',
    'calendar': 'medium',
    'reminder': 'medium',
    'instagram': 'low',
    'facebook': 'low',
    'twitter': 'low',
    'tiktok': 'low',
    'youtube': 'low',
    'spotify': 'low',
    'amazon': 'low',
    'netflix': 'low',
    'gaming': 'low'
}

# Sample notifications for simulation
SAMPLE_NOTIFICATIONS = [
    # Study mode scenarios
    {'app': 'instagram', 'sender': 'friend', 'message': 'Check out my new post! 😊'},
    {'app': 'whatsapp', 'sender': 'teacher', 'message': 'URGENT: Assignment due tomorrow'},
    {'app': 'amazon', 'sender': 'promo', 'message': '50% off electronics - Limited time offer!'},
    {'app': 'gmail', 'sender': 'professor', 'message': 'Office hours cancelled today'},
    {'app': 'slack', 'sender': 'study_group', 'message': 'Meeting at 3pm for project'},
    {'app': 'tiktok', 'sender': 'notification', 'message': 'Your video is ready to post'},
    {'app': 'whatsapp', 'sender': 'mom', 'message': 'Call me when free'},
    {'app': 'youtube', 'sender': 'notification', 'message': 'New video from your favorite channel'},
    
    # Work mode scenarios
    {'app': 'slack', 'sender': 'manager', 'message': 'Team meeting in 5 mins'},
    {'app': 'gmail', 'sender': 'colleague', 'message': 'Project update - please review'},
    {'app': 'instagram', 'sender': 'friend', 'message': 'Lunch today?'},
    {'app': 'teams', 'sender': 'client', 'message': 'URGENT: Contract needs signature'},
    {'app': 'facebook', 'sender': 'notification', 'message': 'You have 3 new friend requests'},
    {'app': 'linkedin', 'sender': 'recruiter', 'message': 'Exciting job opportunity'},
    {'app': 'outlook', 'sender': 'boss', 'message': 'Quarterly review scheduled'},
    {'app': 'twitter', 'sender': 'notification', 'message': 'Trending topics you missed'},
    
    # Sleep mode scenarios
    {'app': 'telegram', 'sender': 'group', 'message': 'Weekend plans discussion'},
    {'app': 'whatsapp', 'sender': 'emergency_contact', 'message': 'URGENT: Call me back ASAP'},
    {'app': 'instagram', 'sender': 'influencer', 'message': 'Live stream starting now!'},
    {'app': 'phone', 'sender': 'family', 'message': 'Missed call'},
    {'app': 'email', 'sender': 'newsletter', 'message': 'Daily digest - Top stories'},
    {'app': 'slack', 'sender': 'coworker', 'message': 'Quick question about work'},
    {'app': 'gmail', 'sender': 'bank', 'message': 'ALERT: Unusual activity detected'},
    {'app': 'messages', 'sender': 'emergency', 'message': 'Emergency alert: Weather warning'},
    
    # Leisure mode scenarios
    {'app': 'netflix', 'sender': 'notification', 'message': 'New season available!'},
    {'app': 'spotify', 'sender': 'system', 'message': 'Your weekly playlist is ready'},
    {'app': 'instagram', 'sender': 'friend', 'message': 'Check out this meme lol'},
    {'app': 'gmail', 'sender': 'friend', 'message': 'Party this weekend!'},
    {'app': 'amazon', 'sender': 'delivery', 'message': 'Your package has been delivered'},
    {'app': 'youtube', 'sender': 'creator', 'message': 'Live stream starting'},
    {'app': 'uber_eats', 'sender': 'promo', 'message': '30% off your next order'},
    {'app': 'whatsapp', 'sender': 'best_friend', 'message': 'Movie night tonight?'}
]

# Urgency keywords for detection
URGENCY_KEYWORDS = [
    'urgent', 'emergency', 'important', 'asap', 'immediate',
    'critical', 'alert', 'warning', 'deadline', 'meeting'
]


def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}\n")


def print_notification(notification: Dict[str, str], decision: Dict[str, Any]):
    """Print a notification with its decision."""
    app = notification['app']
    sender = notification['sender']
    message = notification['message']
    
    action = decision['decision']
    confidence = decision['confidence']
    reasoning = decision['reasoning']
    
    # Color based on decision
    if action == 'SHOW':
        color = Colors.GREEN
        icon = '✅'
    elif action == 'DELAY':
        color = Colors.YELLOW
        icon = '⏰'
    else:
        color = Colors.RED
        icon = '🚫'
    
    print(f"\n{Colors.BOLD}📱 Notification Received:{Colors.END}")
    print(f"   App: {app.capitalize()}")
    print(f"   Sender: {sender.capitalize()}")
    print(f"   Message: {message}")
    
    print(f"\n{Colors.BOLD}🤖 AI Decision:{Colors.END}")
    print(f"   {color}{icon} Action: {action}{Colors.END}")
    print(f"   Confidence: {confidence:.0%}")
    print(f"   Reasoning: {reasoning}")
    
    # Show ML vs Rules breakdown if available
    if 'ml_prediction' in decision:
        print(f"\n{Colors.BOLD}📊 Decision Breakdown:{Colors.END}")
        print(f"   ML Prediction: {decision['ml_prediction']['action']} ({decision['ml_prediction']['confidence']:.0%})")
        print(f"   Rule Score: {decision['rule_score']:.2f}")
        print(f"   Decision Source: {decision['decision_source']}")


def calculate_rule_score(notification: Dict, user_prefs: Dict, context: Dict) -> Dict:
    """Calculate rule-based decision score."""
    app = notification['app'].lower()
    sender = notification['sender'].lower()
    message = notification['message'].lower()
    
    score = 0
    reasoning = []
    
    # App priority scoring
    app_priority = APP_PRIORITIES.get(app, 'medium')
    priority_scores = {'critical': 0.8, 'high': 0.6, 'medium': 0.4, 'low': 0.2}
    score += priority_scores.get(app_priority, 0.4)
    reasoning.append(f"App priority: {app_priority}")
    
    # Check for urgency keywords
    has_urgency = any(keyword in message for keyword in URGENCY_KEYWORDS)
    if has_urgency:
        score += 0.3
        reasoning.append("Contains urgency keyword")
    
    # Check for priority sender
    is_priority = any(p_sender in sender for p_sender in user_prefs['priority_contacts'])
    if is_priority:
        score += 0.4
        reasoning.append("Priority sender")
    
    # Context penalties
    activity = context['activity']
    mode_config = ACTIVITY_MODES.get(activity, {})
    
    # Blocked apps
    if app in mode_config.get('blocked_apps', []):
        score -= 0.5
        reasoning.append("App blocked in current mode")
    
    # Allowed apps
    if app in mode_config.get('allowed_apps', []):
        score += 0.3
        reasoning.append("App allowed in current mode")
    
    # Time-based penalties
    if context['is_sleep_time']:
        score -= 0.3
        reasoning.append("Sleep time hours")
    
    # Normalize score
    score = max(0, min(1, score))
    
    # Determine action
    if score >= 0.7:
        action = 'SHOW'
    elif score >= 0.4:
        action = 'DELAY'
    else:
        action = 'BLOCK'
    
    return {
        'action': action,
        'score': score,
        'reasoning': '; '.join(reasoning)
    }


def simulate_ml_prediction(notification: Dict, context: Dict) -> Dict:
    """Simulate ML prediction (would normally call Python ML service)."""
    app = notification['app'].lower()
    sender = notification['sender'].lower()
    message = notification['message'].lower()
    activity = context['activity']
    
    # Simulate ML behavior based on patterns
    app_priority = APP_PRIORITIES.get(app, 'medium')
    has_urgency = any(keyword in message for keyword in URGENCY_KEYWORDS)
    is_priority_sender = sender in ['teacher', 'professor', 'boss', 'manager', 'emergency', 'mom', 'dad']
    
    # Calculate simulated probability
    show_prob = 0.3  # Base probability
    
    if app_priority in ['critical', 'high']:
        show_prob += 0.3
    if has_urgency:
        show_prob += 0.2
    if is_priority_sender:
        show_prob += 0.2
    if activity == 'sleep':
        show_prob -= 0.2
    if activity == 'study' and app_priority == 'low':
        show_prob -= 0.3
    
    show_prob = max(0.05, min(0.95, show_prob))
    block_prob = max(0.05, 1 - show_prob) * 0.6
    delay_prob = max(0.05, 1 - show_prob) * 0.4
    
    # Normalize
    total = show_prob + block_prob + delay_prob
    show_prob /= total
    block_prob /= total
    delay_prob /= total
    
    # Determine prediction
    probs = {'SHOW': show_prob, 'BLOCK': block_prob, 'DELAY': delay_prob}
    prediction = max(probs, key=probs.get)
    confidence = probs[prediction]
    
    return {
        'action': prediction,
        'confidence': confidence,
        'probabilities': probs
    }


def make_decision(notification: Dict, user_prefs: Dict, context: Dict) -> Dict:
    """Make final decision combining ML and rules."""
    # Get ML prediction
    ml_prediction = simulate_ml_prediction(notification, context)
    
    # Get rule-based decision
    rule_decision = calculate_rule_score(notification, user_prefs, context)
    
    # Combine decisions (weighted average)
    ml_weight = ml_prediction['confidence'] * user_prefs.get('ai_sensitivity', 0.7)
    rule_weight = rule_decision['score'] * (1 - user_prefs.get('ai_sensitivity', 0.7))
    
    # Simple combination: if both agree, use that; otherwise use higher confidence
    if ml_prediction['action'] == rule_decision['action']:
        final_action = ml_prediction['action']
        final_confidence = (ml_prediction['confidence'] + rule_decision['score']) / 2
        source = 'ML_PLUS_RULES'
    elif ml_prediction['confidence'] > rule_decision['score']:
        final_action = ml_prediction['action']
        final_confidence = ml_prediction['confidence'] * 0.8
        source = 'ML_PRIMARILY'
    else:
        final_action = rule_decision['action']
        final_confidence = rule_decision['score'] * 0.8
        source = 'RULES_PRIMARILY'
    
    return {
        'decision': final_action,
        'confidence': final_confidence,
        'reasoning': rule_decision['reasoning'],
        'ml_prediction': ml_prediction,
        'rule_score': rule_decision['score'],
        'decision_source': source
    }


def run_demo():
    """Run the demo simulation."""
    print_header("FocusFlow AI - Demo Flow Simulation")
    
    print(f"{Colors.CYAN}This demo simulates how FocusFlow AI processes notifications{Colors.END}")
    print(f"{Colors.CYAN}based on different activity modes and contexts.{Colors.END}\n")
    
    # Demo scenarios
    scenarios = [
        {
            'name': 'Study Session',
            'activity': 'study',
            'hour': 14,
            'is_weekday': True,
            'notifications': [0, 1, 2, 3, 4, 5, 6, 7]
        },
        {
            'name': 'Work Mode',
            'activity': 'work',
            'hour': 10,
            'is_weekday': True,
            'notifications': [8, 9, 10, 11, 12, 13, 14, 15]
        },
        {
            'name': 'Sleep Mode',
            'activity': 'sleep',
            'hour': 23,
            'is_weekday': False,
            'notifications': [16, 17, 18, 19, 20, 21, 22, 23]
        },
        {
            'name': 'Leisure Time',
            'activity': 'leisure',
            'hour': 15,
            'is_weekday': True,
            'notifications': [24, 25, 26, 27, 28, 29, 30, 31]
        }
    ]
    
    # User preferences
    user_prefs = {
        'priority_contacts': ['teacher', 'professor', 'emergency', 'mom', 'dad', 'boss', 'manager'],
        'ai_sensitivity': 0.7
    }
    
    # Statistics
    stats = {'SHOW': 0, 'DELAY': 0, 'BLOCK': 0}
    
    for scenario in scenarios:
        mode_config = ACTIVITY_MODES[scenario['activity']]
        
        print_header(f"Scenario: {mode_config['name']}")
        print(f"📝 {mode_config['description']}")
        print(f"⏰ Time: {scenario['hour']}:00")
        print(f"📅 Weekday: {'Yes' if scenario['is_weekday'] else 'No'}")
        
        context = {
            'activity': scenario['activity'],
            'hour': scenario['hour'],
            'is_weekday': scenario['is_weekday'],
            'is_sleep_time': scenario['hour'] >= 22 or scenario['hour'] <= 6
        }
        
        print(f"\n{Colors.BOLD}Processing notifications...{Colors.END}\n")
        
        for idx in scenario['notifications']:
            if idx < len(SAMPLE_NOTIFICATIONS):
                notification = SAMPLE_NOTIFICATIONS[idx]
                decision = make_decision(notification, user_prefs, context)
                
                print_notification(notification, decision)
                stats[decision['decision']] += 1
                
                # Small delay for effect
                time.sleep(0.5)
                print(f"\n{'-'*40}")
        
        print(f"\n{Colors.BOLD}📊 Scenario Summary:{Colors.END}")
        print(f"   Show: {stats['SHOW']}, Delay: {stats['DELAY']}, Block: {stats['BLOCK']}")
    
    # Final statistics
    print_header("Demo Complete - Final Statistics")
    
    total = sum(stats.values())
    print(f"{Colors.BOLD}Total Notifications Processed:{Colors.END} {total}")
    print(f"\n{Colors.GREEN}✅ SHOW: {stats['SHOW']} ({stats['SHOW']/total*100:.0f}%){Colors.END}")
    print(f"{Colors.YELLOW}⏰ DELAY: {stats['DELAY']} ({stats['DELAY']/total*100:.0f}%){Colors.END}")
    print(f"{Colors.RED}🚫 BLOCK: {stats['BLOCK']} ({stats['BLOCK']/total*100:.0f}%){Colors.END}")
    
    print(f"\n{Colors.CYAN}FocusFlow AI successfully filtered distractions while{Colors.END}")
    print(f"{Colors.CYAN}ensuring important notifications get through!{Colors.END}")
    
    print_header("Demo Completed")


if __name__ == '__main__':
    run_demo()