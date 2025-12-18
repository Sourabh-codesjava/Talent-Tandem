import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../services/api';
import './OtpVerification.css';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (timer <= 0) {
      setError('OTP expired. Please resend.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await ApiService.verifyOtp({ email, otp: otpString });

      setSuccess('Account created successfully! 🎉');
      
      setTimeout(() => {
        navigate('/login', { replace: true, state: { message: 'Account verified! Please login to continue.' } });
      }, 2000);

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Invalid OTP. Please try again.');
      } else if (error.response?.status === 410) {
        setError('OTP expired. Please resend.');
      } else if (error.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await ApiService.resendOtp({ email });

      setSuccess('OTP resent successfully! Check your email.');
      setTimer(300);
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 429) {
        setError('Resend limit reached. Please try again later.');
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="otp-verification-page">
      <div className="otp-background">
        <motion.div
          className="floating-shape shape-1"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="floating-shape shape-2"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="otp-container">
        <motion.div
          className="otp-card"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div
            className="otp-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="otp-icon">
              <span>📧</span>
            </div>
            <h2 className="otp-title">Verify Your Email</h2>
            <p className="otp-subtitle">
              Enter the 6-digit OTP sent to<br />
              <strong>{email}</strong>
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            className="otp-timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {timer > 0 ? (
              <span className={timer < 60 ? 'timer-warning' : ''}>
                ⏱️ OTP expires in {formatTime(timer)}
              </span>
            ) : (
              <span className="timer-expired">⚠️ OTP expired. Please resend.</span>
            )}
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="otp-message error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ❌ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className="otp-message success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input Form */}
          <motion.form
            onSubmit={handleVerifyOtp}
            className="otp-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-input"
                  disabled={isLoading || timer <= 0}
                  whileFocus={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            <motion.button
              type="submit"
              className="verify-btn"
              disabled={isLoading || timer <= 0 || otp.join('').length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Verify OTP'
              )}
            </motion.button>
          </motion.form>

          {/* Resend Section */}
          <motion.div
            className="otp-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="resend-text">Didn't receive OTP?</p>
            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOtp}
              disabled={!canResend || isLoading}
            >
              {canResend ? (
                '🔄 Resend OTP'
              ) : (
                `Resend in ${resendTimer}s`
              )}
            </button>
          </motion.div>

          {/* Change Email */}
          <motion.div
            className="otp-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="change-email-text">
              Wrong email?{' '}
              <button
                type="button"
                className="change-email-btn"
                onClick={() => navigate('/change-email', { state: { email } })}
              >
                Change Email
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OtpVerification;
