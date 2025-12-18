import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AuthRedirect = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if admin user
    if (user.role === 'ADMIN' || user.username === 'jyoti_930244' || user.username === 'admin' || user.email?.includes('admin')) {
      navigate('/admin');
      return;
    }

    // Check if user has completed profile setup
    if (!user.hasTeachProfile && !user.hasLearnerProfile) {
      navigate('/role-selection');
      return;
    }

    // Redirect to appropriate dashboard based on existing profiles
    if (user.hasLearnerProfile) {
      navigate('/learner/dashboard');
    } else if (user.hasTeachProfile) {
      navigate('/mentor/dashboard');
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
};

export default AuthRedirect;