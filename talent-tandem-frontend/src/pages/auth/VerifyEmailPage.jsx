import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import Footer from '../../components/Footer';
import '../../components/Login.css';

const VerifyEmailPage = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage('');
    try {
      await ApiService.resendVerification(email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="hero-background"></div>
      <div className="login-container" style={{ flex: 1 }}>
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="login-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ textAlign: 'center' }}
          >
            <div className="profile-image-container">
              <motion.div
                className="profile-icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
              >
                <motion.svg 
                  viewBox="0 0 24 24" 
                  fill="white" 
                  width="80" 
                  height="80"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </motion.svg>
              </motion.div>
            </div>

            <h2 className="login-title">Check Your Email!</h2>
            <p className="login-subtitle" style={{ marginBottom: '1rem' }}>
              We've sent a verification link to
            </p>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                padding: '1rem',
                borderRadius: '15px',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                marginBottom: '1.5rem'
              }}
            >
              <p style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '700', 
                fontSize: '1.1rem',
                margin: 0
              }}>
                📧 {email}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}
            >
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '1rem'
              }}>
                ✨ Next Steps:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📬</span>
                  <span style={{ color: '#475569', fontSize: '0.95rem' }}>Check your inbox for verification email</span>
                </motion.div>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🔗</span>
                  <span style={{ color: '#475569', fontSize: '0.95rem' }}>Click the verification link</span>
                </motion.div>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🚀</span>
                  <span style={{ color: '#475569', fontSize: '0.95rem' }}>Complete your profile setup</span>
                </motion.div>
              </div>
            </motion.div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: message.includes('Failed') ? '#fee2e2' : '#dcfce7',
                  color: message.includes('Failed') ? '#dc2626' : '#16a34a',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                {message}
              </motion.div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <motion.button
                onClick={handleResendEmail}
                disabled={isResending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="login-btn"
                style={{
                  cursor: isResending ? 'not-allowed' : 'pointer',
                  opacity: isResending ? 0.6 : 1
                }}
              >
                {isResending ? (
                  <div className="loading-spinner"></div>
                ) : (
                  '📨 Resend Verification Email'
                )}
              </motion.button>

              <Link to="/login" style={{ textDecoration: 'none' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Back to Login
                </motion.button>
              </Link>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ 
                  fontSize: '0.9rem', 
                  color: '#64748b', 
                  margin: '0.5rem 0',
                  textAlign: 'center'
                }}
              >
                🔍 Didn't receive the email? Check your spam folder!
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="login-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginTop: '2rem', textAlign: 'center' }}
          >
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Wrong email?{' '}
              <Link to="/signup" className="signup-link">
                Sign up again
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
