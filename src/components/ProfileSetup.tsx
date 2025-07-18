import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ProfileSetup: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '' as 'mentor' | 'learner',
    name: user?.user_metadata?.full_name || '',
    university: '',
    country: '',
    subject: '',
    bio: '',
    languages: ['Bengali', 'English'],
    experience: ''
  });

  const handleRoleSelect = (role: 'mentor' | 'learner') => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        name: formData.name,
        email: user?.email || '',
        role: formData.role,
        avatar_url: user?.user_metadata?.avatar_url,
        university: formData.role === 'mentor' ? formData.university : null,
        country: formData.role === 'mentor' ? formData.country : null,
        subject: formData.role === 'mentor' ? formData.subject : null,
        bio: formData.bio,
        languages: formData.languages,
        experience: formData.role === 'mentor' ? formData.experience : null
      });

      navigate(formData.role === 'mentor' ? '/mentor-dashboard' : '/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Disha!</h1>
            <p className="text-gray-600 mb-8">Let's set up your profile. Are you here to:</p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('learner')}
                className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 text-left transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Find a Mentor</h3>
                    <p className="text-sm text-gray-600">Get guidance for studying abroad</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleRoleSelect('mentor')}
                className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-xl p-6 text-left transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Become a Mentor</h3>
                    <p className="text-sm text-gray-600">Help students achieve their dreams</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-white/80">
              {formData.role === 'mentor' 
                ? 'Tell us about your academic journey to help students find you'
                : 'Set up your profile to connect with mentors'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {formData.role === 'mentor' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University *
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., University of Toronto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Canada"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="1st Year Undergraduate">1st Year Undergraduate</option>
                    <option value="2nd Year Undergraduate">2nd Year Undergraduate</option>
                    <option value="3rd Year Undergraduate">3rd Year Undergraduate</option>
                    <option value="4th Year Undergraduate">4th Year Undergraduate</option>
                    <option value="Masters Student">Masters Student</option>
                    <option value="PhD Student">PhD Student</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  formData.role === 'mentor' 
                    ? "Tell students about your journey, what you can help with, and your interests..."
                    : "Tell us about yourself and what you're looking for in a mentor..."
                }
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Complete Setup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;