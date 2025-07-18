import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Download
} from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminData } from '../../hooks/useAdminData';
import ApplicationsTable from './ApplicationsTable';
import CallsCalendar from './CallsCalendar';
import StatsCards from './StatsCards';
import AnalyticsCharts from './AnalyticsCharts';

const AdminDashboard: React.FC = () => {
  const { adminUser, isAdmin, loading: authLoading } = useAdminAuth();
  const { 
    applications, 
    scheduledCalls, 
    platformStats, 
    loading: dataLoading,
    error 
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'calls' | 'analytics'>('overview');

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const todaysCalls = scheduledCalls.filter(call => {
    const callDate = new Date(call.scheduled_start_time);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'applications', label: `Applications (${pendingApplications.length})`, icon: UserCheck },
    { id: 'calls', label: `Calls (${todaysCalls.length})`, icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {adminUser?.name} ({adminUser?.role})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <StatsCards stats={platformStats} />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Applications</h3>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {pendingApplications.length} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {pendingApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={app.applicant?.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                          alt={app.applicant?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{app.applicant?.name}</p>
                          <p className="text-sm text-gray-600">{app.expertise_areas.join(', ')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
                {pendingApplications.length > 5 && (
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {pendingApplications.length} applications
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Calls</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {todaysCalls.length} scheduled
                  </span>
                </div>
                <div className="space-y-3">
                  {todaysCalls.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {call.mentor.name} ↔ {call.student.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(call.scheduled_start_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        call.booking_status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {call.booking_status}
                      </span>
                    </div>
                  ))}
                </div>
                {todaysCalls.length > 5 && (
                  <button
                    onClick={() => setActiveTab('calls')}
                    className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {todaysCalls.length} calls
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <ApplicationsTable applications={applications} />
        )}

        {activeTab === 'calls' && (
          <CallsCalendar calls={scheduledCalls} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts stats={platformStats} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;