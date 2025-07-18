import React, { useState } from 'react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  Plus,
  Filter
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useZoomMeetings } from '../hooks/useZoomMeetings';
import ZoomMeetingCard from './ZoomMeetingCard';

const MeetingDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { 
    meetings, 
    upcomingMeetings, 
    activeMeetings, 
    completedMeetings,
    loading, 
    error,
    joinMeeting,
    cancelMeeting
  } = useZoomMeetings(profile?.id);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week'>('all');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Meetings</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const filterMeetingsByPeriod = (meetings: any[]) => {
    if (filterPeriod === 'all') return meetings;
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_start_time);
      
      if (filterPeriod === 'today') {
        return isToday(meetingDate);
      }
      
      if (filterPeriod === 'week') {
        return isThisWeek(meetingDate);
      }
      
      return true;
    });
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return filterMeetingsByPeriod(upcomingMeetings);
      case 'active':
        return activeMeetings;
      case 'completed':
        return filterMeetingsByPeriod(completedMeetings);
      default:
        return [];
    }
  };

  const tabContent = getTabContent();

  const handleJoinMeeting = (meeting: any, isHost: boolean) => {
    joinMeeting(meeting, isHost);
  };

  const handleCancelMeeting = async (meetingId: string, reason?: string) => {
    try {
      await cancelMeeting(meetingId, reason);
    } catch (error) {
      console.error('Failed to cancel meeting:', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            My Meetings
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage your Zoom meetings and join scheduled sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{activeMeetings.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{completedMeetings.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 md:mb-8">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Upcoming ({upcomingMeetings.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active ({activeMeetings.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white text-gray-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Completed ({completedMeetings.length})
                </button>
              </div>

              {/* Filter */}
              {activeTab !== 'active' && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value as any)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {tabContent.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {tabContent.map((meeting) => (
                  <ZoomMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={profile?.id || ''}
                    onJoinMeeting={handleJoinMeeting}
                    onCancelMeeting={handleCancelMeeting}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'upcoming' && <Calendar className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'active' && <Video className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'completed' && <CheckCircle className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} meetings
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  {activeTab === 'upcoming' && "You don't have any upcoming meetings scheduled."}
                  {activeTab === 'active' && "No meetings are currently active."}
                  {activeTab === 'completed' && "You haven't completed any meetings yet."}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => window.location.href = '/mentors'}
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book a Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {meetings.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => window.location.href = '/mentors'}
                className="flex items-center justify-center bg-white text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New Session
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center justify-center bg-white text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Users className="w-4 h-4 mr-2" />
                View Dashboard
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="flex items-center justify-center bg-white text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Meetings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDashboard;