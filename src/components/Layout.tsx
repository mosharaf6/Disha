import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, User, LogOut, Home, Search, Calendar, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  // Bottom navigation items for mobile
  const bottomNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/mentors', icon: Search, label: 'Mentors' },
    { path: user && profile ? '/meetings' : '/auth/google', icon: Calendar, label: 'Meetings' },
    { path: '/become-mentor', icon: UserPlus, label: 'Mentor' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-16 md:pb-0">
      {/* Mobile-optimized header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 md:relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Disha
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/mentors"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive('/mentors') 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Find Mentors
              </Link>
              {!user && (
                <Link
                  to="/become-mentor"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/become-mentor') 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Become a Mentor
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {user && profile ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={profile.role === 'mentor' ? '/mentor-dashboard' : '/dashboard'}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <img
                      src={profile.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                      alt={profile.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700">{profile.name}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/google"
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`;
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors touch-manipulation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 absolute top-full left-0 right-0 shadow-lg">
            <div className="px-3 py-3 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
              <Link
                to="/"
                className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors touch-manipulation ${
                  isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/mentors"
                className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors touch-manipulation ${
                  isActive('/mentors') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Find Mentors
              </Link>
              {!user && (
                <Link
                  to="/become-mentor"
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors touch-manipulation ${
                    isActive('/become-mentor') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Become a Mentor
                </Link>
              )}
              <div className="pt-3 border-t border-gray-200 mt-3">
                {user && profile ? (
                  <div className="space-y-1">
                    <Link
                      to={profile.role === 'mentor' ? '/mentor-dashboard' : '/dashboard'}
                      className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-xl touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="flex items-center space-x-3 px-4 py-3">
                      <img
                        src={profile.avatar_url || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150`}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-base font-medium text-gray-700">{profile.name}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl touch-manipulation"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`;
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 touch-manipulation"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActiveNav = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.path === '/auth/google' && !user) {
                    e.preventDefault();
                    window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}/auth/callback`;
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 touch-manipulation min-w-[60px] ${
                  isActiveNav 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActiveNav ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${isActiveNav ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;