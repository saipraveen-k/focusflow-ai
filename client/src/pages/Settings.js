import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Brain, 
  Shield,
  Volume2,
  Vibrate,
  Lightbulb,
  Moon,
  Save,
  RotateCcw
} from 'lucide-react';

const Settings = () => {
  const { user, updatePreferences } = useAuth();
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePreferences(preferences);
    setSaving(false);
    if (!result.success) {
      // Revert changes on error
      setPreferences(user?.preferences || {});
    }
  };

  const handleReset = () => {
    setPreferences(user?.preferences || {});
  };

  const updateNestedPreference = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const updateNestedPreferenceDeep = (category, subCategory, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category]?.[subCategory],
          [field]: value
        }
      }
    }));
  };

  const addToArray = (category, subCategory, field, value) => {
    const currentArray = preferences[category]?.[subCategory]?.[field] || [];
    if (!currentArray.includes(value)) {
      updateNestedPreferenceDeep(category, subCategory, field, [...currentArray, value]);
    }
  };

  const removeFromArray = (category, subCategory, field, value) => {
    const currentArray = preferences[category]?.[subCategory]?.[field] || [];
    updateNestedPreferenceDeep(
      category, 
      subCategory, 
      field, 
      currentArray.filter(item => item !== value)
    );
  };

  const commonApps = ['whatsapp', 'gmail', 'slack', 'instagram', 'facebook', 'twitter', 'telegram', 'spotify'];
  const commonContacts = ['family', 'emergency', 'boss', 'teacher', 'doctor', 'manager'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Customize your notification filtering preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Enable Sounds</span>
              </div>
              <button
                onClick={() => updateNestedPreference('notifications', 'enableSounds', !preferences.notifications?.enableSounds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications?.enableSounds ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications?.enableSounds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Vibrate className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Enable Vibration</span>
              </div>
              <button
                onClick={() => updateNestedPreference('notifications', 'enableVibration', !preferences.notifications?.enableVibration)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications?.enableVibration ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications?.enableVibration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Enable LED</span>
              </div>
              <button
                onClick={() => updateNestedPreference('notifications', 'enableLED', !preferences.notifications?.enableLED)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications?.enableLED ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications?.enableLED ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Moon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Quiet Hours</span>
              </div>
              <button
                onClick={() => updateNestedPreference('notifications', 'quietHours', {
                  ...preferences.notifications?.quietHours,
                  enabled: !preferences.notifications?.quietHours?.enabled
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications?.quietHours?.enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications?.quietHours?.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {preferences.notifications?.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.notifications?.quietHours?.start || '22:00'}
                    onChange={(e) => updateNestedPreference('notifications', 'quietHours', {
                      ...preferences.notifications?.quietHours,
                      start: e.target.value
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.notifications?.quietHours?.end || '07:00'}
                    onChange={(e) => updateNestedPreference('notifications', 'quietHours', {
                      ...preferences.notifications?.quietHours,
                      end: e.target.value
                    })}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Brain className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Settings</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Sensitivity ({Math.round((preferences.aiSettings?.sensitivity || 0.7) * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.aiSettings?.sensitivity || 0.7}
              onChange={(e) => updateNestedPreference('aiSettings', 'sensitivity', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Permissive</span>
              <span>More Restrictive</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Learning Enabled</span>
              <button
                onClick={() => updateNestedPreference('aiSettings', 'learningEnabled', !preferences.aiSettings?.learningEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.aiSettings?.learningEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.aiSettings?.learningEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Auto Adjust</span>
              <button
                onClick={() => updateNestedPreference('aiSettings', 'autoAdjust', !preferences.aiSettings?.autoAdjust)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.aiSettings?.autoAdjust ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.aiSettings?.autoAdjust ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Modes Settings */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Focus Modes</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {['study', 'work', 'sleep', 'leisure'].map((mode) => (
              <div key={mode} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h4 className="text-md font-semibold text-gray-900 capitalize mb-4">{mode} Mode</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Allowed Apps */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Apps
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {preferences.focusModes?.[mode]?.allowedApps?.map((app) => (
                        <span
                          key={app}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800"
                        >
                          {app}
                          <button
                            onClick={() => removeFromArray('focusModes', mode, 'allowedApps', app)}
                            className="ml-2 text-success-600 hover:text-success-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addToArray('focusModes', mode, 'allowedApps', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="input text-sm"
                    >
                      <option value="">Add app...</option>
                      {commonApps.filter(app => !preferences.focusModes?.[mode]?.allowedApps?.includes(app)).map(app => (
                        <option key={app} value={app}>{app}</option>
                      ))}
                    </select>
                  </div>

                  {/* Blocked Apps */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blocked Apps
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {preferences.focusModes?.[mode]?.blockedApps?.map((app) => (
                        <span
                          key={app}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800"
                        >
                          {app}
                          <button
                            onClick={() => removeFromArray('focusModes', mode, 'blockedApps', app)}
                            className="ml-2 text-danger-600 hover:text-danger-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addToArray('focusModes', mode, 'blockedApps', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="input text-sm"
                    >
                      <option value="">Add app...</option>
                      {commonApps.filter(app => !preferences.focusModes?.[mode]?.blockedApps?.includes(app)).map(app => (
                        <option key={app} value={app}>{app}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Contacts */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Contacts
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {preferences.focusModes?.[mode]?.priorityContacts?.map((contact) => (
                        <span
                          key={contact}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {contact}
                          <button
                            onClick={() => removeFromArray('focusModes', mode, 'priorityContacts', contact)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addToArray('focusModes', mode, 'priorityContacts', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="input text-sm"
                    >
                      <option value="">Add contact...</option>
                      {commonContacts.filter(contact => !preferences.focusModes?.[mode]?.priorityContacts?.includes(contact)).map(contact => (
                        <option key={contact} value={contact}>{contact}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
