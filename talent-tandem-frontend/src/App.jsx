import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import useTokenRefresh from './hooks/useTokenRefresh';
import AuthRedirect from './components/AuthRedirect';
import HomePage from './HomePage';
import Login from './components/Login';
import ThreeStepSignup from './components/signup/ThreeStepSignup';
import EmailVerification from './components/EmailVerification';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OtpVerification from './components/OtpVerification';
import ProfileSetup from './pages/auth/ProfileSetup';
import RoleSelection from './pages/auth/RoleSelection';
import MentorSetup from './pages/mentor/MentorSetup';
import MentorAvailability from './pages/mentor/MentorAvailability';
import LearnerSetup from './pages/learner/LearnerSetup';
import LearnerAvailability from './pages/learner/LearnerAvailability';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import MatchingEngine from './pages/learner/MatchingEngine';
import MentorDashboard from './pages/mentor/MentorDashboard';
import SessionsDashboard from './pages/sessions/SessionsDashboard';
import SkillsTagsDashboard from './pages/SkillsTagsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PreChat from './pages/PreChat';
import SkillSwapHome from './components/skillswap/SkillSwapHome';
import UserProfile from './pages/UserProfile';  


function App() {
  useTokenRefresh(); // Enable automatic token refresh
  
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/skillswap" element={<SkillSwapHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<ThreeStepSignup />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/verify-email-prompt" element={<VerifyEmailPage />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/dashboard" element={<AuthRedirect />} />
              <Route path="/pre-chat/:sessionId" element={<PreChat />} />
              {/* Protected Routes */}
              <Route path="/profile-setup" element={
                <ProtectedRoute requireAuth={true}>
                
                  <ProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/role-selection" element={
                <ProtectedRoute requireAuth={true} requireProfile={false}>
                  <RoleSelection />
                </ProtectedRoute>
              } />
              
              {/* Mentor Routes */}
              <Route path="/mentor/setup" element={
                <ProtectedRoute requireAuth={true}>
                  <MentorSetup />
                </ProtectedRoute>
              } />
              <Route path="/mentor/availability" element={
                <ProtectedRoute requireAuth={true}>
                  <MentorAvailability />
                </ProtectedRoute>
              } />
              <Route path="/mentor/dashboard" element={
                <ProtectedRoute requireAuth={true} requireProfile={true} profileType="mentor">
                  <MentorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Learner Routes */}
              <Route path="/learner/setup" element={
                <ProtectedRoute requireAuth={true}>
                  <LearnerSetup />
                </ProtectedRoute>
              } />
              <Route path="/learner/availability" element={
                <ProtectedRoute requireAuth={true}>
                  <LearnerAvailability />
                </ProtectedRoute>
              } />
              <Route path="/learner/dashboard" element={
                <ProtectedRoute requireAuth={true} requireProfile={true} profileType="learner">
                  <LearnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/learner/matching" element={
                <ProtectedRoute requireAuth={true} requireProfile={true} profileType="learner">
                  <MatchingEngine />
                </ProtectedRoute>
              } />
              
              {/* Other Protected Routes */}
              <Route path="/sessions" element={
                <ProtectedRoute requireAuth={true} requireProfile={true}>
                  <SessionsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/skills-tags" element={
                <ProtectedRoute requireAuth={true}>
                  <SkillsTagsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/profile/:userId" element={
                <ProtectedRoute requireAuth={true}>
                  <UserProfile />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;