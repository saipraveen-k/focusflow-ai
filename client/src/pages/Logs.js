import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  FileText, 
  Eye, 
  Clock, 
  X, 
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState('all');
  const [filterApp, setFilterApp] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');

  const { data: notifications, isLoading, refetch } = useQuery(
    ['notifications', filterDecision, filterApp, filterActivity],
    async () => {
      const params = new URLSearchParams();
      if (filterDecision !== 'all') params.append('decision', filterDecision);
      if (filterApp !== 'all') params.append('app', filterApp);
      if (filterActivity !== 'all') params.append('activity', filterActivity);
      params.append('limit', '100');

      const response = await axios.get(`/api/notifications?${params}`);
      return response.data;
    },
    { refetchInterval: 15000 } // Refetch every 15 seconds
  );

  const filteredNotifications = notifications?.notifications?.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const getDecisionIcon = (decision) => {
    switch (decision) {
      case 'SHOW':
        return <Eye className="h-4 w-4 text-success-600" />;
      case 'DELAY':
        return <Clock className="h-4 w-4 text-warning-600" />;
      case 'BLOCK':
        return <X className="h-4 w-4 text-danger-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-success-600';
    if (confidence >= 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  const uniqueApps = [...new Set(notifications?.notifications?.map(n => n.app) || [])];
  const uniqueActivities = [...new Set(notifications?.notifications?.map(n => n.activity) || [])];

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'App', 'Sender', 'Message', 'Activity', 'Decision', 'Confidence', 'Source'].join(','),
      ...filteredNotifications.map(n => [
        new Date(n.timestamp).toISOString(),
        n.app,
        n.sender,
        `"${n.message.replace(/"/g, '""')}"`,
        n.activity,
        n.decision,
        n.confidence,
        n.finalDecisionSource
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: filteredNotifications.length,
    shown: filteredNotifications.filter(n => n.decision === 'SHOW').length,
    delayed: filteredNotifications.filter(n => n.decision === 'DELAY').length,
    blocked: filteredNotifications.filter(n => n.decision === 'BLOCK').length,
    avgConfidence: filteredNotifications.length > 0 
      ? (filteredNotifications.reduce((sum, n) => sum + n.confidence, 0) / filteredNotifications.length).toFixed(2)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Logs</h1>
          <p className="text-gray-600 mt-1">
            View and analyze notification filtering history and decisions
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shown</p>
              <p className="text-xl font-bold text-success-600">{stats.shown}</p>
            </div>
            <Eye className="h-8 w-8 text-success-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-xl font-bold text-warning-600">{stats.delayed}</p>
            </div>
            <Clock className="h-8 w-8 text-warning-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked</p>
              <p className="text-xl font-bold text-danger-600">{stats.blocked}</p>
            </div>
            <X className="h-8 w-8 text-danger-400" />
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className={`text-xl font-bold ${getConfidenceColor(stats.avgConfidence)}`}>
                {(stats.avgConfidence * 100).toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Decision Filter */}
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="input"
          >
            <option value="all">All Decisions</option>
            <option value="SHOW">Show</option>
            <option value="DELAY">Delay</option>
            <option value="BLOCK">Block</option>
          </select>

          {/* App Filter */}
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="input"
          >
            <option value="all">All Apps</option>
            {uniqueApps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>

          {/* Activity Filter */}
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value)}
            className="input"
          >
            <option value="all">All Activities</option>
            {uniqueActivities.map(activity => (
              <option key={activity} value={activity}>{activity}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
            <span className="text-sm text-gray-500">
              Showing {filteredNotifications.length} of {notifications?.notifications?.length || 0} notifications
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-3 text-gray-500">Loading logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications found</p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {notification.app}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.sender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={notification.message}>
                      {notification.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="status-badge bg-blue-100 text-blue-800 capitalize">
                        {notification.activity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getDecisionIcon(notification.decision)}
                        <span className={`status-badge ${getDecisionBadge(notification.decision)}`}>
                          {notification.decision}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 max-w-xs">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                notification.confidence >= 0.8 ? 'bg-success-500' :
                                notification.confidence >= 0.6 ? 'bg-warning-500' : 'bg-danger-500'
                              }`}
                              style={{ width: `${notification.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(notification.confidence)}`}>
                          {(notification.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {notification.finalDecisionSource || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
