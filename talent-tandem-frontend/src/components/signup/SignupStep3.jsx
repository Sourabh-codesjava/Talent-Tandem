import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import Notification from '../Notification';
import '../Login.css';

const SignupStep3 = ({ email, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await ApiService.request('/auth/signup/complete', {
        method: 'POST',
        body: JSON.stringify({
          email,
          username: formData.username,
          password: formData.password
        })
      });
      
      if (response.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setNotification({
          show: true,
          message: response.message || 'Failed to complete signup',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Signup failed. Please try again.',
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
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21Z"/>
            </svg>
          </motion.div>
        </div>
        <h2 className="login-title">Complete Your Account</h2>
        <p className="login-subtitle">Step 3: Create username and password</p>
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
            placeholder="Choose a username"
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
            placeholder="Create a password"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            type="button"
            onClick={onBack}
            className="login-btn"
            style={{ background: '#6c757d', flex: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
          
          <motion.button
            type="submit"
            className="login-btn"
            disabled={isLoading || success}
            style={{ flex: 2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            style={{
              marginTop: '1.5rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 15px 40px rgba(102, 126, 234, 0.5)',
              border: '3px solid white'
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              style={{ fontSize: '4rem', marginBottom: '1rem' }}
            >
              🎉
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '0.5rem',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}
            >
              Account Created Successfully!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ 
                color: 'rgba(255, 255, 255, 0.95)', 
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            >
              Redirecting to login...
            </motion.p>
          </motion.div>
        )}
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

export default SignupStep3;