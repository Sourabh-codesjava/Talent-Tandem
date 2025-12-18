import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

import Notification from './Notification';
import ApiService from '../services/api';
import AuthService from '../services/auth';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();
  const { updateUser, user } = useUser();

  useEffect(() => {
    if (user && AuthService.isAuthenticated()) {
      if (user.role === 'ADMIN' || user.username === 'jyoti_930244') {
        navigate('/admin', { replace: true });
      } else if (user.hasLearnerProfile) {
        navigate('/learner/dashboard', { replace: true });
      } else if (user.hasTeachProfile) {
        navigate('/mentor/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ApiService.login(formData);
      
      if (!response.status) {
        throw new Error(response.message || 'Login failed');
      }
      
      if (!AuthService.isAuthenticated()) {
        throw new Error('Authentication failed - no valid token received');
      }
      
      // Handle null/undefined profile flags
      const hasMentorProfile = response.hasMentorProfile === true;
      const hasLearnerProfile = response.hasLearnerProfile === true;
      
      // Store user data in context and localStorage
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        profilePhoto: response.profilePhoto,
        role: response.role,
        hasTeachProfile: hasMentorProfile,
        hasLearnerProfile: hasLearnerProfile
      };

      updateUser(userData);
      setNotification({
        show: true,
        message: 'Login Successfully! Redirecting...',
        type: 'success'
      });
      
      setTimeout(() => {
        // Check if admin user
        if (response.role === 'ADMIN' || response.username === 'jyoti_930244') {
          navigate('/admin', { replace: true });
        } else if (!response.firstName || !response.lastName) {
          navigate('/profile-setup', { replace: true });
        } else if (hasLearnerProfile) {
          navigate('/learner/dashboard', { replace: true });
        } else if (hasMentorProfile) {
          navigate('/mentor/dashboard', { replace: true });
        } else {
          navigate('/learner/dashboard', { replace: true });
        }
      }, 2000);
      
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Login failed. Please check your credentials.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="hero-background">
        <motion.div
          className="floating-shape shape-1"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: '10%', left: '10%' }}
        />
        <motion.div
          className="floating-shape shape-2"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', bottom: '20%', right: '15%' }}
        />
      </div>
      <div className="login-container" style={{ flex: 1 }}>
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="back-button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </motion.button>

          <motion.div 
            className="login-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="profile-image-container">
              <div className="profile-icon">
                <svg viewBox="0 0 24 24" fill="white" width="80" height="80">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>

            {error && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                marginTop: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
          </motion.div>

          <motion.form 
            className="login-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <motion.input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <motion.input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>



            <motion.button
              type="submit"
              className="login-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Sign in'
              )}
            </motion.button>


          </motion.form>

          <motion.div 
            className="login-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="signup-link">
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Login;