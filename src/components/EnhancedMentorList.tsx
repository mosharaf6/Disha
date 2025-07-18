import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, GraduationCap, Star, Clock, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

const EnhancedMentorList: React.FC = () => {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [countries, setCountries] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .not('university', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMentors(data || []);
      
      // Extract unique values for filters
      const uniqueCountries = [...new Set(data?.map(m => m.country).filter(Boolean))] as string[];
      const uniqueUniversities = [...new Set(data?.map(m => m.university).filter(Boolean))] as string[];
      const uniqueSubjects = [...new Set(data?.map(m => m.subject).filter(Boolean))] as string[];
      
      setCountries(uniqueCountries);
      setUniversities(uniqueUniversities);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || mentor.country === selectedCountry;
    const matchesUniversity = !selectedUniversity || mentor.university === selectedUniversity;
    const matchesSubject = !selectedSubject || mentor.subject === selectedSubject;

    return matchesSearch && matchesCountry && matchesUniversity && matchesSubject;
  });

  const clearFilters = () => {
    setSelectedCountry('');
    setSelectedUniversity('');
    setSelectedSubject('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MentorCard: React.FC<{ mentor: Profile }> = ({ mentor }) => (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-start space-x-3 md:space-x-4 mb-4">
          <img
            src={mentor.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
            alt={mentor.name}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 leading-tight">{mentor.name}</h3>
            <div className="flex items-center text-gray-600 text-xs md:text-sm mb-2">
              <GraduationCap className="w-4 h-4 mr-1" />
              <span className="truncate">{mentor.university}</span>
            </div>
            <div className="flex items-center text-gray-600 text-xs md:text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="truncate">{mentor.country}</span>
            </div>
          </div>
          <div className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
            Available
          </div>
        </div>

        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
            {mentor.subject}
          </span>
        </div>

        <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-3 leading-relaxed">
          {mentor.bio || 'Experienced mentor ready to help with your study abroad journey.'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 md:space-x-4 text-xs md:text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>4.8</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span className="truncate">{mentor.experience || 'New'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Link
            to={`/mentor/${mentor.id}`}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center hover:shadow-lg transition-all duration-200 text-sm md:text-base touch-manipulation min-h-[44px] flex items-center justify-center"
          >
            View Profile
          </Link>
          <Link
            to={`/book/${mentor.id}`}
            className="flex-1 border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg font-medium text-center hover:bg-blue-600 hover:text-white transition-all duration-200 text-sm md:text-base touch-manipulation min-h-[44px] flex items-center justify-center"
          >
            Book Call
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Find Your Perfect Mentor
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Connect with experienced Bangladeshi students studying at top universities worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentors, universities, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-3 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation min-h-[44px]"
            >
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation min-h-[44px]"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation min-h-[44px]"
            >
              <option value="">All Universities</option>
              {universities.map(university => (
                <option key={university} value={university}>{university}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base touch-manipulation min-h-[44px]"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {(selectedCountry || selectedUniversity || selectedSubject || searchQuery) && (
            <div className="mt-3 md:mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation py-1 px-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredMentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-10 h-10 md:w-12 md:h-12 mx-auto" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 px-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMentorList;