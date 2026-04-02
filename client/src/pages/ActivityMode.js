import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Briefcase, 
  Moon, 
  Coffee, 
  Power,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const ActivityMode = () => {
  const { user, updateActivity } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState(user?.currentActivity || 'none');

  const activities = [
    {
      id: 'study',
      name: 'Study Mode',
      description: 'Block distractions during study sessions',
      icon: BookOpen,
      color: 'bg-blue-500',
      features: [
        'Blocks social media notifications',
        'Allows educational apps',
        'Priority for teacher/professor messages',
        'Silences promotional content'
      ]
    },
    {
      id: 'work',
      name: 'Work Mode',
      description: 'Maintain focus during work hours',
      icon: Briefcase,
      color: 'bg-green-500',
      features: [
        'Allows work communication apps',
        'Blocks entertainment notifications',
        'Priority for manager/client messages',
        'Minimizes personal interruptions'
      ]
    },
    {
      id: 'sleep',
      name: 'Sleep Mode',
      description: 'Uninterrupted rest during sleep hours',
      icon: Moon,
      color: 'bg-indigo-500',
      features: [
        'Only emergency contacts allowed',
        'Blocks all non-urgent notifications',
        'Silent delivery for critical alerts',
        'Maximum disturbance prevention'
      ]
    },
    {
      id: 'leisure',
      name: 'Leisure Mode',
      description: 'Relaxed filtering for free time',
      icon: Coffee,
      color: 'bg-purple-500',
      features: [
        'Minimal filtering applied',
        'Allows social and entertainment',
        'Basic spam filtering only',
        'Full notification experience'
      ]
    }
  ];

  const handleActivityChange = async (activityId) => {
    const result = await updateActivity(activityId);
    if (result.success) {
      setSelectedActivity(activityId);
    }
  };

  const getActivityStatus = (activityId) => {
    if (activityId === selectedActivity) return 'active';
    return 'inactive';
  };

  const getStatusIcon = (activityId) => {
    if (activityId === selectedActivity) {
      return <CheckCircle className="h-5 w-5 text-white" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Mode</h1>
        <p className="text-gray-600 mt-1">
          Select your current activity to optimize notification filtering
        </p>
      </div>

      {/* Current Status */}
      <div className="card p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-600 rounded-full">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              <p className="text-gray-600">
                {selectedActivity === 'none' 
                  ? 'No activity mode selected - All notifications will be processed with default settings'
                  : `${activities.find(a => a.id === selectedActivity)?.name} is active - Notifications are being filtered accordingly`
                }
              </p>
            </div>
          </div>
          {selectedActivity !== 'none' && (
            <button
              onClick={() => handleActivityChange('none')}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Power className="h-4 w-4" />
              <span>Disable</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activities.map((activity) => {
          const isActive = getActivityStatus(activity.id) === 'active';
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className={`card p-6 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                  : 'hover:shadow-lg border-gray-200'
              }`}
              onClick={() => handleActivityChange(activity.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${activity.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                </div>
                {getStatusIcon(activity.id)}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                <ul className="space-y-1">
                  {activity.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? 'bg-primary-500' : 'bg-gray-400'
                      }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isActive ? 'Currently Active' : 'Activate Mode'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How Activity Modes Work</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Activity modes automatically adjust notification filtering based on your current context. 
                Each mode has predefined rules that determine which notifications should be shown, delayed, or blocked.
              </p>
              <p>
                The AI system learns from your behavior and can automatically suggest the best mode based on 
                time of day, app usage patterns, and your feedback.
              </p>
              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success-600" />
                  <span className="font-medium">SHOW</span>
                  <span className="text-gray-600">- Immediate delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning-600" />
                  <span className="font-medium">DELAY</span>
                  <span className="text-gray-600">- Deliver later</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-danger-600" />
                  <span className="font-medium">BLOCK</span>
                  <span className="text-gray-600">- Never show</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">Study Mode Recommended</p>
                <p className="text-xs text-gray-600">Based on your calendar and current time (2:00 PM - 6:00 PM)</p>
              </div>
            </div>
            <button
              onClick={() => handleActivityChange('study')}
              className="btn btn-primary text-sm"
            >
              Apply
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">Sleep Mode Tonight</p>
                <p className="text-xs text-gray-600">Auto-activate at 10:00 PM based on your sleep schedule</p>
              </div>
            </div>
            <button className="btn btn-secondary text-sm">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMode;
