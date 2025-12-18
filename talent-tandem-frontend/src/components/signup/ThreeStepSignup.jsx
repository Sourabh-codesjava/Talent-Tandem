import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import AuthService from '../../services/auth';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep3 from './SignupStep3';
import '../Login.css';

const ThreeStepSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user && AuthService.isAuthenticated()) {
      if (user.hasLearnerProfile) {
        navigate('/learner/dashboard', { replace: true });
      } else if (user.hasTeachProfile) {
        navigate('/mentor/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleStep1Next = (userEmail) => {
    setEmail(userEmail);
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <SignupStep1 onNext={handleStep1Next} />;
      case 2:
        return <SignupStep2 email={email} onNext={handleStep2Next} onBack={handleBack} />;
      case 3:
        return <SignupStep3 email={email} onBack={handleBack} />;
      default:
        return <SignupStep1 onNext={handleStep1Next} />;
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
          style={{ padding: '3rem' }}
        >
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
            <motion.button
              onClick={() => navigate('/')}
              style={{ position: 'static', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: '500', padding: '0.4rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
            {[1, 2, 3].map((step) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: currentStep >= step ? '#667eea' : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                  animate={{
                    background: currentStep >= step ? '#667eea' : '#e0e0e0',
                    scale: currentStep === step ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step}
                </motion.div>
                {step < 3 && (
                  <div
                    style={{
                      width: '60px',
                      height: '2px',
                      background: currentStep > step ? '#667eea' : '#e0e0e0',
                      margin: '0 10px'
                    }}
                  />
                )}
              </div>
            ))}
            </div>
          </div>

          {renderCurrentStep()}

          <motion.div 
            className="login-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>
              Already have an account?{' '}
              <Link to="/login" className="signup-link">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThreeStepSignup;