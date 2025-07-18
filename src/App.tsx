import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import EnhancedMentorList from './components/EnhancedMentorList';
import EnhancedMentorProfile from './components/EnhancedMentorProfile';
import EnhancedBookingForm from './components/EnhancedBookingForm';
import BecomeMentor from './components/BecomeMentor';
import AuthCallback from './components/AuthCallback';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import MentorDashboard from './components/MentorDashboard';
import MeetingDashboard from './components/MeetingDashboard';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import AdminAuthCallback from './components/admin/AdminAuthCallback';

// Legacy components for backward compatibility
import MentorList from './components/MentorList';
import MentorProfile from './components/MentorProfile';
import BookingForm from './components/BookingForm';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Enhanced routes with database integration */}
          <Route path="/mentors" element={<EnhancedMentorList />} />
          <Route path="/mentor/:id" element={<EnhancedMentorProfile />} />
          <Route path="/book/:id" element={<EnhancedBookingForm />} />
          
          {/* Authentication and profile routes */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/meetings" element={<MeetingDashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/auth/callback" element={<AdminAuthCallback />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/legacy/mentors" element={<MentorList />} />
          <Route path="/legacy/mentor/:id" element={<MentorProfile />} />
          <Route path="/legacy/book/:id" element={<BookingForm />} />
          
          <Route path="/become-mentor" element={<BecomeMentor />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;