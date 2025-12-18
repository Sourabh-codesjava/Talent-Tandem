import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthService from '../services/auth';

const ProtectedRoute = ({ children, requireAuth = true, requireProfile = false, profileType = null }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authentication is required but user is not logged in or token is invalid
  if (requireAuth && (!user || !AuthService.isAuthenticated())) {
    return <Navigate to="/login" replace />;
  }

  // If user has profiles but tries to access role-selection, redirect to dashboard
  if (user && window.location.pathname === '/role-selection' && (user.hasTeachProfile || user.hasLearnerProfile)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If profile is required, check profile completion and redirect accordingly
  if (requireProfile && user) {
    // Wait for profile status to load (hasLearnerProfile/hasTeachProfile)
    if (user.hasLearnerProfile === undefined || user.hasTeachProfile === undefined) {
      return <div>Loading...</div>;
    }

    // If no profiles exist, go to role selection
    if (!user.hasTeachProfile && !user.hasLearnerProfile) {
      return <Navigate to="/role-selection" replace />;
    }
    
    // If specific profile type is required but user doesn't have it
    if (profileType === 'learner' && !user.hasLearnerProfile) {
      return <Navigate to="/learner/setup" replace />;
    }
    if (profileType === 'mentor' && !user.hasTeachProfile) {
      return <Navigate to="/mentor/setup" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;