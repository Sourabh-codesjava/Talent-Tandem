import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import './RoleToggle.css';

const RoleToggle = ({ currentRole, userId, onRoleChange }) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  const isMentor = currentRole === 'MENTOR';

  const handleToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    const newRole = isMentor ? 'LEARNER' : 'MENTOR';
    
    try {
      // Call backend API to update role
      await ApiService.selectRole({ userId, role: newRole });
      
      // Store role preference in localStorage
      localStorage.setItem('preferredRole', newRole);
      
      // Call parent callback if provided
      if (onRoleChange) {
        await onRoleChange(newRole);
      }
      
      // Navigate to appropriate dashboard with smooth transition
      setTimeout(() => {
        if (newRole === 'MENTOR') {
          navigate('/mentor/dashboard');
        } else {
          navigate('/learner/dashboard');
        }
        setIsToggling(false);
      }, 300);
    } catch (error) {
      console.error('Error switching role:', error);
      setIsToggling(false);
    }
  };

  return (
    <div className="role-toggle-container">
      <span className={`role-label ${!isMentor ? 'active' : ''}`}>
        🎓 Learner
      </span>
      <div 
        className={`toggle-switch ${isMentor ? 'mentor' : 'learner'} ${isToggling ? 'toggling' : ''}`}
        onClick={handleToggle}
      >
        <div className="toggle-slider">
          <span className="toggle-icon">{isMentor ? '👨🏫' : '🎓'}</span>
        </div>
      </div>
      <span className={`role-label ${isMentor ? 'active' : ''}`}>
        👨🏫 Mentor
      </span>
    </div>
  );
};

export default RoleToggle;
