import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAvailability } from '../hooks/useAvailability';
import { useBookings } from '../hooks/useBookings';
import { Profile } from '../types';
import { format } from 'date-fns';

const EnhancedBookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { availability } = useAvailability(id);
  const { createBooking } = useBookings(profile?.id);
  
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    message: ''
  });

  const topics = [
    'University Applications',
    'Scholarship Guidance',
    'Visa Process',
    'Student Life Abroad',
    'Career Advice',
    'Academic Planning',
    'General Guidance'
  ];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !mentor || !selectedSlot) return;

    try {
      const slot = availability.find(s => s.id === selectedSlot);
      if (!slot) return;

      await createBooking({
        mentor_id: mentor.id,
        availability_slot_id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        topic: formData.topic,
        message: formData.message
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error creating booking:', error);
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to book a session</h2>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Booked Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your session with {mentor.name} has been confirmed. You'll receive a video call link and can access it from your dashboard.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <Link
                to="/mentors"
                className="block w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:border-gray-400 transition-colors"
              >
                Find More Mentors
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          to={`/mentor/${mentor.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 md:mb-6 group touch-manipulation py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to profile
        </Link>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-4 md:px-6 py-6 md:py-8 text-white">
            <div className="flex items-center space-x-4">
              <img
                src={mentor.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt={mentor.name}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-1">Book a Call with {mentor.name}</h1>
                <p className="text-white/80 text-sm md:text-base">{mentor.university} • {mentor.subject}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Available Time Slots */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Select Available Time Slot
                </h3>
                
                {availability.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {availability.map((slot) => (
                      <label
                        key={slot.id}
                        className={`flex items-center justify-between p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 touch-manipulation ${
                          selectedSlot === slot.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot.id}
                          checked={selectedSlot === slot.id}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
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
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                          {slot.duration} min
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                    <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm md:text-base text-gray-600">No available time slots</p>
                    <p className="text-xs md:text-sm text-gray-500">This mentor hasn't set up their availability yet</p>
                  </div>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Discussion Topic *
                </label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation min-h-[44px]"
                >
                  <option value="">Select a topic</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation resize-none"
                  placeholder="Tell your mentor what specific guidance you're looking for..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!selectedSlot || !formData.topic}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-base md:text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation min-h-[48px]"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Session
                </button>
                <p className="text-xs md:text-sm text-gray-500 text-center mt-3">
                  A video call link will be automatically generated for your session
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingForm;