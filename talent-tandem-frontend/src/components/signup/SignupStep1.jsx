import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import Notification from '../Notification';
import '../Login.css';

const SignupStep1 = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await ApiService.request('/auth/signup/step1', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (response.status === 'success') {
        onNext(email);
      } else {
        setNotification({
          show: true,
          message: response.message || 'Failed to send OTP',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to send OTP. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        className="login-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="profile-image-container">
          <motion.div 
            className="profile-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
          >
            <svg viewBox="0 0 24 24" fill="white" width="80" height="80">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </motion.div>
        </div>
        <h2 className="login-title">Join Talent Tandem!</h2>
        <p className="login-subtitle">Step 1: Enter your email address</p>
      </motion.div>

      <motion.form 
        className="login-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <motion.input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
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
            'Send OTP'
          )}
        </motion.button>
      </motion.form>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </>
  );
};

export default SignupStep1;