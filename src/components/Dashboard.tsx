import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, User, Clock, Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { bookings, loading } = useBookings(profile?.id);

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.start_time) > new Date() && booking.status === 'confirmed'
  );

  const pastBookings = bookings.filter(booking => 
    new Date(booking.start_time) < new Date() || booking.status === 'completed'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {profile?.role === 'learner' 
              ? 'Here are your upcoming mentoring sessions and booking history.'
              : 'Manage your mentoring sessions and help students succeed.'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Upcoming Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{pastBookings.length}</p>
                <p className="text-xs md:text-sm text-gray-600">Completed Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile?.role === 'learner' ? 'Learner' : 'Mentor'}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Your Role</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {profile?.role === 'learner' ? (
              <>
                <Link
                  to="/mentors"
                  className="flex items-center space-x-3 p-3 md:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 text-sm md:text-base">Find Mentors</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm md:text-base">Edit Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/mentor-dashboard"
                  className="flex items-center space-x-3 p-3 md:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors touch-manipulation"
                >
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 text-sm md:text-base">Manage Availability</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm md:text-base">Edit Profile</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        {upcomingBookings.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {profile?.role === 'learner' 
                            ? `Session with ${booking.mentor?.name}`
                            : `Session with ${booking.learner?.name}`
                          }
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {format(new Date(booking.start_time), 'MMM d, yyyy • h:mm a')}
                          </div>
                          {booking.topic && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mt-1 sm:mt-0 inline-block w-fit">
                              {booking.topic}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {booking.video_call_link && (
                      <a
                        href={booking.video_call_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 md:space-x-2 bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors touch-manipulation text-sm flex-shrink-0"
                      >
                        <Video className="w-4 h-4" />
                        <span className="hidden sm:inline">Join Call</span>
                        <span className="sm:hidden">Join</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {pastBookings.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Recent Sessions</h2>
            <div className="space-y-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          {profile?.role === 'learner' 
                            ? `Session with ${booking.mentor?.name}`
                            : `Session with ${booking.learner?.name}`
                          }
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {format(new Date(booking.start_time), 'MMM d, yyyy')}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          } mt-1 sm:mt-0 inline-block w-fit`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              {profile?.role === 'learner' 
                ? "Start by finding a mentor who can help guide your study abroad journey."
                : "Students will be able to book sessions with you once you set up your availability."
              }
            </p>
            <Link
              to={profile?.role === 'learner' ? '/mentors' : '/mentor-dashboard'}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              {profile?.role === 'learner' ? 'Find Mentors' : 'Set Up Availability'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;