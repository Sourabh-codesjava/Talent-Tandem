import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import Notification from '../Notification';
import '../Login.css';

const SignupStep2 = ({ email, onNext, onBack }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Show initial notification when page loads
    setNotification({
      show: true,
      message: `📧 Check your email! OTP has been sent to ${email}`,
      type: 'success'
    });
  }, [email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await ApiService.verifyOtp({ email, otp });
      
      if (response.status === 'success') {
        setNotification({
          show: true,
          message: 'OTP Verified Successfully! ✨',
          type: 'success'
        });
        setTimeout(() => onNext(), 1500);
      } else {
        setNotification({
          show: true,
          message: 'OTP Invalid! Please check and try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'OTP Invalid! Please check and try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      const response = await ApiService.resendOtp({ email });
      
      if (response.status === 'success') {
        setCountdown(60);
        setNotification({
          show: true,
          message: 'OTP sent successfully!',
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: response.message || 'Failed to resend OTP',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to resend OTP. Please try again.',
        type: 'error'
      });
    } finally {
      setIsResending(false);
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
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </motion.div>
        </div>
        <h2 className="login-title">Verify Your Email</h2>
        <p className="login-subtitle">Step 2: Enter the OTP sent to {email}</p>
      </motion.div>

      <motion.form 
        className="login-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="form-group">
          <label htmlFor="otp">Enter OTP</label>
          <motion.input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
            disabled={isLoading || otp.length !== 6}
            style={{ flex: 2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Verify OTP'
            )}
          </motion.button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {countdown > 0 ? (
            <p style={{ color: '#666' }}>Resend OTP in {countdown}s</p>
          ) : (
            <motion.button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </motion.button>
          )}
        </div>
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

export default SignupStep2;