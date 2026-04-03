import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  Bell, 
  BellOff, 
  Clock, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Activity,
  Eye,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  const { data: stats, isLoading: statsLoading } = useQuery(
    ['notificationStats', selectedPeriod],
    async () => {
      const response = await axios.get(`/api/notifications/stats?period=${selectedPeriod}`);
      return response.data;
    },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const { data: notifications, isLoading: notificationsLoading } = useQuery(
    'recentNotifications',
    async () => {
      const response = await axios.get('/api/notifications?limit=10');
      return response.data;
    },
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'SHOW':
        return <Eye className="h-4 w-4 text-success-600" />;
      case 'DELAY':
        return <Clock className="h-4 w-4 text-warning-600" />;
      case 'BLOCK':
        return <X className="h-4 w-4 text-danger-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'SHOW':
        return 'status-show';
      case 'DELAY':
        return 'status-delay';
      case 'BLOCK':
        return 'status-block';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (statsLoading || notificationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor your notification filtering performance and activity
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Period:</span>
        {['1h', '24h', '7d', '30d'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Notifications"
          value={stats?.stats?.total || 0}
          icon={Bell}
          color="bg-blue-500"
          change={12}
        />
        <StatCard
          title="Allowed"
          value={stats?.stats?.shown || 0}
          icon={Eye}
          color="bg-success-500"
          change={8}
        />
        <StatCard
          title="Delayed"
          value={stats?.stats?.delayed || 0}
          icon={Clock}
          color="bg-warning-500"
          change={-5}
        />
        <StatCard
          title="Blocked"
          value={stats?.stats?.blocked || 0}
          icon={Shield}
          color="bg-danger-500"
          change={15}
        />
      </div>

      {/* Productivity Score */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Productivity Score</h3>
          <TrendingUp className="h-5 w-5 text-success-500" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Focus Efficiency</span>
              <span className="text-sm font-medium text-gray-900">
                {stats?.productivityScore || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.productivityScore || 0}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {stats?.productivityScore || 0}
            </div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>
          <div className="p-6">
            {notifications?.notifications?.length > 0 ? (
              <div className="space-y-3">
                {notifications.notifications.slice(0, 5).map((notification) => (
                  <div key={notification._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getDecisionIcon(notification.decision)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.app}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {notification.sender}: {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`status-badge ${getDecisionBadge(notification.decision)}`}>
                        {notification.decision}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* App Statistics */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">App Statistics</h3>
          </div>
          <div className="p-6">
            {stats?.appStats?.length > 0 ? (
              <div className="space-y-4">
                {stats.appStats.slice(0, 5).map((app) => (
                  <div key={app._id} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {app._id}
                        </span>
                        <span className="text-xs text-gray-500">{app.total} total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="flex h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-success-500"
                            style={{ width: `${(app.shown / app.total) * 100}%` }}
                          />
                          <div
                            className="bg-warning-500"
                            style={{ width: `${(app.delayed / app.total) * 100}%` }}
                          />
                          <div
                            className="bg-danger-500"
                            style={{ width: `${(app.blocked / app.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No app data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Activity Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Current Activity</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${
              stats?.currentActivity === 'none' ? 'bg-gray-400' : 'bg-green-400 animate-pulse'
            }`} />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {stats?.currentActivity || 'None'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats?.currentActivity === 'none' 
            ? 'No activity mode selected. Choose an activity mode to start filtering notifications.'
            : `Focus mode is active. Notifications are being filtered based on your ${stats?.currentActivity} preferences.`
          }
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
