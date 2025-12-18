import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApiService from '../services/api';
import Footer from './Footer';
import './Login.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await ApiService.verifyEmail(token);
      if (response.status === 'success') {
        setStatus('success');
        setMessage(response.message);
      } else {
        setStatus('error');
        setMessage(response.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (userData.email) {
        await ApiService.resendVerification(userData.email);
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      setMessage('Failed to resend verification email.');
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
          >
            <Link to="/" className="logo-link">
              <h2 style={{ color: '#3b82f6', margin: 0, fontSize: '2rem', fontWeight: 'bold', textDecoration: 'none' }}>Talent Tandem</h2>
            </Link>
            <h1>Email Verification</h1>
            
            {status === 'verifying' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p>Verifying your email...</p>
              </div>
            )}
            
            {status === 'success' && (
              <div style={{ 
                backgroundColor: '#dcfce7', 
                color: '#16a34a', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ margin: '0 auto 1rem', display: 'block' }}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <p style={{ margin: 0, fontWeight: '600' }}>{message}</p>
                <Link to="/login" style={{ 
                  display: 'inline-block', 
                  marginTop: '1rem', 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '0.375rem' 
                }}>
                  Continue to Login
                </Link>
              </div>
            )}
            
            {status === 'error' && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#dc2626', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                marginTop: '1rem',
                textAlign: 'center'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ margin: '0 auto 1rem', display: 'block' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <p style={{ margin: '0 0 1rem', fontWeight: '600' }}>{message}</p>
                <button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend Email'}
                </button>
                <Link to="/signup" style={{ 
                  display: 'inline-block', 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '0.375rem' 
                }}>
                  Back to Signup
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default EmailVerification;