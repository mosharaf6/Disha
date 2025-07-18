import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, GraduationCap, Star, Clock, Calendar, MessageCircle, Globe } from 'lucide-react';
import { mentors } from '../data/mentors';

const MentorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mentor = mentors.find(m => m.id === id);

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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/mentors"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to mentors
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={mentor.photo}
                alt={mentor.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-white/90">
                  <div className="flex items-center justify-center md:justify-start">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    <span>{mentor.university}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{mentor.location}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                    {mentor.subject}
                  </span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                mentor.availability === 'Available' 
                  ? 'bg-green-500 text-white' 
                  : mentor.availability === 'Busy'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
                {mentor.availability}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{mentor.rating}</span>
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{mentor.totalSessions}</span>
                </div>
                <p className="text-sm text-gray-600">Sessions Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-green-500 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">{mentor.experience}</span>
                </div>
                <p className="text-sm text-gray-600">Experience</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* About */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About {mentor.name}</h2>
                <p className="text-gray-600 leading-relaxed">{mentor.bio}</p>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.languages.map((language, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{mentor.subject}</h4>
                      <p className="text-gray-600">{mentor.university}</p>
                      <p className="text-sm text-gray-500">{mentor.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ready to get guidance from {mentor.name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  Book a call to discuss your study abroad journey, application process, and get personalized advice.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/book/${mentor.id}`}
                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
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

export default MentorProfile;