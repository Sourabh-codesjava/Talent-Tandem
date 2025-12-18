import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useUser } from '../context/UserContext';

const ProfileIntegrationStatus = () => {
  const { user } = useUser();
  const [learnSkills, setLearnSkills] = useState([]);
  const [teachSkills, setTeachSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [learnData, teachData] = await Promise.all([
        ApiService.getLearnSkillsByUser(user.id).catch(() => []),
        ApiService.getTeachSkillsByUser(user.id).catch(() => [])
      ]);
      
      setLearnSkills(learnData);
      setTeachSkills(teachData);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile status...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #e2e8f0', 
      borderRadius: '0.5rem',
      backgroundColor: '#f8fafc',
      margin: '1rem 0'
    }}>
      <h3>Profile Integration Status</h3>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <div>
          <h4>Learning Profile</h4>
          <p>Skills to Learn: <strong>{learnSkills.length}</strong></p>
          {learnSkills.length > 0 && (
            <ul style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {learnSkills.map(skill => (
                <li key={skill.id}>
                  {skill.skillName} ({skill.priorityLevel})
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h4>Teaching Profile</h4>
          <p>Skills to Teach: <strong>{teachSkills.length}</strong></p>
          {teachSkills.length > 0 && (
            <ul style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {teachSkills.map(skill => (
                <li key={skill.teachId}>
                  {skill.skillName} ({skill.proficiencyLevel})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <button 
        onClick={loadProfileData}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer'
        }}
      >
        Refresh Status
      </button>
    </div>
  );
};

export default ProfileIntegrationStatus;