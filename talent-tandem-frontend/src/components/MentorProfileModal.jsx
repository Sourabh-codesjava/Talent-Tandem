import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../services/api';
import './MentorProfileModal.css';

const MentorProfileModal = ({ mentorId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [teachSkills, setTeachSkills] = useState([]);
  const [mentorRating, setMentorRating] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMentorProfile();
  }, [mentorId]);

  const loadMentorProfile = async () => {
    try {
      setIsLoading(true);
      const [profileData, skills, rating, receivedFeedbacks] = await Promise.all([
        ApiService.getUserProfile(mentorId),
        ApiService.getTeachSkillsByUser(mentorId),
        ApiService.getMentorRating(mentorId).catch(() => null),
        ApiService.getFeedbacksReceivedByUser(mentorId).catch(() => [])
      ]);
      setProfile(profileData);
      setTeachSkills(skills);
      setMentorRating(rating);
      setFeedbacks(receivedFeedbacks);
    } catch (error) {
      setError('Failed to load mentor profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mentor-profile-overlay" onClick={onClose}>
        <div className="mentor-profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mentor-profile-overlay" onClick={onClose}>
        <div className="mentor-profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="error-message">{error || 'Profile not found'}</div>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-profile-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="mentor-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="close-btn">×</button>
        
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            {profile.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white'
              }}>
                {(profile.firstName || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ color: 'white' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '700' }}>{profile.firstName} {profile.lastName}</h2>
            <p style={{ margin: '0.25rem 0', fontSize: '0.95rem', opacity: 0.9 }}>@{profile.username}</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', opacity: 0.85 }}>{profile.email}</p>
          </div>
        </div>

        <div className="profile-details">
          {profile.city && (
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{profile.city}{profile.country && `, ${profile.country}`}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className="detail-item">
              <span className="detail-icon">📞</span>
              <span>{profile.phoneNumber}</span>
            </div>
          )}
        </div>

        {mentorRating && (
          <div className="profile-section" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>⭐ Ratings & Reviews</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#92400e' }}>
                  {mentorRating.averageRating ? mentorRating.averageRating.toFixed(1) : 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: '600' }}>Overall Rating</div>
                <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                  {'⭐'.repeat(Math.round(mentorRating.averageRating || 0))}
                </div>
              </div>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {mentorRating.totalFeedbacks || 0}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '600' }}>Total Reviews</div>
              </div>
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#065f46' }}>
                  {mentorRating.averageClarityScore ? mentorRating.averageClarityScore.toFixed(1) : 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#064e3b', fontWeight: '600' }}>Clarity Score</div>
              </div>
            </div>
            
            {feedbacks.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>💬 Recent Feedback</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {feedbacks.slice(0, 5).map((feedback, idx) => (
                    <div key={idx} style={{
                      padding: '1.25rem',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                            {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#3b82f6' }}>📊 Difficulty: {feedback.difficultyLevel}/5</span>
                        <span style={{ color: '#10b981' }}>💡 Clarity: {feedback.clarityScore}/5</span>
                        <span style={{ color: '#8b5cf6' }}>💎 Value: {feedback.valueScore}/5</span>
                      </div>
                      {feedback.comments && (
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>
                          "{feedback.comments}"
                        </p>
                      )}
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        - {feedback.fromUserName || 'Anonymous'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="profile-section">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>🎯 Teaching Skills</h3>
          {teachSkills.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {teachSkills.map((skill) => (
                <div key={skill.teachId} style={{
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>📚</span>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{skill.skillName}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      background: skill.proficiencyLevel === 'BEGINNER' ? '#6b7280' : skill.proficiencyLevel === 'INTERMEDIATE' ? '#3b82f6' : '#10b981',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {skill.proficiencyLevel}
                    </span>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ⭐ {skill.confidenceScore}/10
                    </span>
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600'
                  }}>
                    🎯 {skill.preferredMode.replace(/_/g, ' ')}
                  </div>
                  {skill.dayOfWeek && skill.startTime && skill.endTime && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: '#e0f2fe',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: '#0369a1',
                      fontWeight: '600'
                    }}>
                      📅 {skill.dayOfWeek}: {skill.startTime} - {skill.endTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
              <p style={{ margin: 0 }}>No teaching skills listed</p>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </motion.div>
    </div>
  );
};

export default MentorProfileModal;
