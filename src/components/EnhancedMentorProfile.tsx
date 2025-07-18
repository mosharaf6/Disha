import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, GraduationCap, Star, Clock, Calendar, MessageCircle, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAvailability } from '../hooks/useAvailability';
import { Profile } from '../types';
import { format } from 'date-fns';

const EnhancedMentorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { availability } = useAvailability(id);

  useEffect(() => {
    if (id) {
      fetchMentor();
    }
  }, [id]);

  const fetchMentor = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'mentor')
        .single();

      if (error) throw error;
      setMentor(data);
    } catch (error) {
      console.error('Error fetching mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor not found</h2>
          <Link
            to="/mentors"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/mentors"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 md:mb-6 group touch-manipulation py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to mentors
        </Link>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 md:px-8 py-8 md:py-12 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={mentor.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300`}
                alt={mentor.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/20"
              />
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{mentor.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-white/90">
                  <div className="flex items-center justify-center md:justify-start">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    <span className="text-sm md:text-base">{mentor.university}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm md:text-base">{mentor.country}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-block bg-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium">
                    {mentor.subject}
                  </span>
                </div>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm font-medium bg-green-500 text-white">
                Available
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 md:px-8 py-4 md:py-6 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mr-1" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900">4.8</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-1" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900">{availability.length}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Slots</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1" />
                  <span className="text-lg md:text-2xl font-bold text-gray-900 truncate">{mentor.experience || 'New'}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">Experience</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-8">
            <div className="space-y-8">
              {/* About */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">About {mentor.name}</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {mentor.bio || 'This mentor is passionate about helping students achieve their study abroad dreams and is ready to share their experience and insights.'}
                </p>
              </div>

              {/* Languages */}
              {mentor.languages && mentor.languages.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((language, index) => (
                      <span
                        key={index}
                        className="flex items-center bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Time Slots */}
              {availability.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Available Time Slots</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {availability.slice(0, 6).map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm md:text-base">
                              {format(new Date(slot.start_time), 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0">
                          {slot.duration} min
                        </span>
                      </div>
                    ))}
                  </div>
                  {availability.length > 6 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{availability.length - 6} more slots available
                    </p>
                  )}
                </div>
              )}

              {/* Education */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Education</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">{mentor.subject}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{mentor.university}</p>
                      <p className="text-xs md:text-sm text-gray-500">{mentor.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                  Ready to get guidance from {mentor.name}?
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Book a call to discuss your study abroad journey, application process, and get personalized advice.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to={`/book/${mentor.id}`}
                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 touch-manipulation min-h-[44px]"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book a Call
                  </Link>
                  <button className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-gray-400 transition-colors">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMentorProfile;