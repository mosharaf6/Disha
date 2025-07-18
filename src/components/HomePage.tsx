import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Users, Calendar, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Active Mentors', value: '500+' },
    { icon: Globe, label: 'Countries', value: '25+' },
    { icon: Calendar, label: 'Sessions Completed', value: '2,000+' },
    { icon: Star, label: 'Average Rating', value: '4.8' }
  ];

  const features = [
    {
      title: 'Find Your Perfect Mentor',
      description: 'Connect with Bangladeshi students studying at top universities worldwide',
      icon: '🎯'
    },
    {
      title: 'Get Expert Guidance',
      description: 'Receive personalized advice on applications, scholarships, and student life',
      icon: '💡'
    },
    {
      title: 'Schedule Flexible Calls',
      description: 'Book convenient time slots that work for both you and your mentor',
      icon: '📅'
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-8 md:pt-20 pb-12 md:pb-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Your Gateway to
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Study Abroad Success
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
              Connect with experienced Bangladeshi students currently studying at top universities worldwide. 
              Get personalized guidance for your journey abroad.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16 px-4">
              <Link
                to="/mentors"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center touch-manipulation"
              >
                <span>Find Mentors</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/become-mentor"
                className="group border-2 border-green-600 text-green-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:bg-green-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center touch-manipulation"
              >
                Become a Mentor
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto px-2">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Why Choose Disha?
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              We make it easy to connect with the right mentor and get the guidance you need for your study abroad journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
              >
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-white mx-2 md:mx-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90">
              Join thousands of students who have successfully connected with mentors through Disha.
            </p>
            <Link
              to="/mentors"
              className="inline-flex items-center bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 touch-manipulation"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;