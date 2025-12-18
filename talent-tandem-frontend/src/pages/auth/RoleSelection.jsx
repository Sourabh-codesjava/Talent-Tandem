import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import Footer from '../../components/Footer';
import ApiService from '../../services/api';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    // If user already has both profiles, redirect to dashboard
    if (user?.hasTeachProfile && user?.hasLearnerProfile) {
      navigate('/learner/dashboard');
    }
  }, [user, navigate]);

  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    if (!user || !user.id) {
      alert('User not found. Please login again.');
      navigate('/login');
      return;
    }
    
    if (selectedRole === 'mentor') {
      // If already has mentor profile, go to dashboard
      if (user.hasTeachProfile) {
        navigate('/mentor/dashboard');
      } else {
        navigate('/mentor/setup');
      }
    } else {
      // If already has learner profile, go to dashboard
      if (user.hasLearnerProfile) {
        navigate('/learner/dashboard');
      } else {
        navigate('/learner/setup');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '2rem 0', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Shapes */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.6), transparent)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(80px)',
          opacity: 0.4,
          animation: 'float1 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.5), transparent)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(80px)',
          opacity: 0.4,
          animation: 'float2 8s ease-in-out infinite'
        }} />
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem', textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
            How do you want to get started?
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '2rem' }}>
            Choose your primary role to get started.
          </p>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(10px)',
            padding: '1.25rem 2.5rem', 
            borderRadius: '50px', 
            display: 'inline-block',
            fontSize: '0.95rem',
            color: '#667eea',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            fontWeight: '500'
          }}>
            <strong style={{ color: '#764ba2' }}>Note:</strong> You can play both roles, but primarily select one role first. Later you can complete your second profile and switch between them anytime.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <motion.div 
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '3rem 2rem',
              borderRadius: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: selectedRole === 'mentor' ? '3px solid #667eea' : '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: selectedRole === 'mentor' ? '0 20px 60px rgba(102, 126, 234, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('mentor')}
          >
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#3b82f6">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>I'm a Mentor</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>Share your expertise and guide others on their learning journey</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
              <li style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>• Set your availability and rates</li>
              <li style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>• Connect with eager learners</li>
              <li style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>• Track your impact and earnings</li>
            </ul>
            <button style={{
              backgroundColor: selectedRole === 'mentor' ? '#3b82f6' : 'transparent',
              color: selectedRole === 'mentor' ? 'white' : '#3b82f6',
              border: '1px solid #3b82f6',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              {selectedRole === 'mentor' ? '✓ Selected' : 'Build your reputation →'}
            </button>
          </motion.div>

          <motion.div 
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '3rem 2rem',
              borderRadius: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: selectedRole === 'learner' ? '3px solid #667eea' : '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: selectedRole === 'learner' ? '0 20px 60px rgba(102, 126, 234, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('learner')}
          >
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>I'm a Learner</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>Find expert mentors and accelerate your skills development</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left' }}>
              <li style={{ color: '#10b981', marginBottom: '0.5rem' }}>• Browse qualified mentors</li>
              <li style={{ color: '#10b981', marginBottom: '0.5rem' }}>• Book sessions at your pace</li>
              <li style={{ color: '#10b981', marginBottom: '0.5rem' }}>• Track your progress and growth</li>
            </ul>
            <button style={{
              backgroundColor: selectedRole === 'learner' ? '#10b981' : 'transparent',
              color: selectedRole === 'learner' ? 'white' : '#10b981',
              border: '1px solid #10b981',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              {selectedRole === 'learner' ? '✓ Selected' : 'Start learning today →'}
            </button>
          </motion.div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.button 
            style={{
              background: selectedRole ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
              color: selectedRole ? 'white' : '#9ca3af',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '50px',
              fontSize: '17px',
              fontWeight: '600',
              cursor: selectedRole ? 'pointer' : 'not-allowed',
              boxShadow: selectedRole ? '0 8px 30px rgba(102, 126, 234, 0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}
            onClick={handleContinue}
            disabled={!selectedRole}
            whileHover={selectedRole ? { scale: 1.05 } : {}}
            whileTap={selectedRole ? { scale: 0.95 } : {}}
          >
            {!selectedRole ? 'Select a role to continue' : `Continue as ${selectedRole === 'mentor' ? 'Mentor' : 'Learner'}`}
          </motion.button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoleSelection;