import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import SessionBooking from '../../components/SessionBooking';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import MentorProfileModal from '../../components/MentorProfileModal';
import BackButton from '../../components/BackButton';
import { useWallet } from '../../hooks/useWallet';
import './MatchingEngine.css';

const MatchingEngine = () => {
  const { user } = useUser();
  const { coins, debitCoins, checkSufficientCoins } = useWallet(user?.id);
  const [learnSkills, setLearnSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [success, setSuccess] = useState('');
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [showNoMentorsModal, setShowNoMentorsModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserLearnSkills();
    }
  }, [user]);

  const loadUserLearnSkills = async () => {
    try {
      const userSkills = await ApiService.getLearnSkillsByUser(user.id);
      console.log('User learn skills:', userSkills);
      setLearnSkills(userSkills);
    } catch (error) {
      console.error('Error loading learn skills:', error);
      setError('Failed to load your learning skills');
    }
  };

  const findMentors = async (skill) => {
    setIsLoading(true);
    setError('');
    setSelectedSkill(skill);

    try {
      const matchRequest = {
        skillId: skill.skillId,
        preferredMode: skill.preferredMode,
        priorityLevel: skill.priorityLevel,
        dayOfWeek: skill.dayOfWeek || 'MONDAY',
        startTime: skill.startTime || '09:00',
        endTime: skill.endTime || '17:00',
        profileImage: user.profilePhoto || ''
      };

      console.log('Sending match request:', matchRequest);
      const matchedMentors = await ApiService.findMentors(matchRequest);
      console.log('Matched mentors:', matchedMentors);
      setMentors(matchedMentors || []);
      if (!matchedMentors || matchedMentors.length === 0) {
        setShowNoMentorsModal(true);
      }
    } catch (error) {
      console.error('Error finding mentors:', error);
      setError(error.message || 'Failed to find mentors. Please try again.');
      setMentors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'BEGINNER': 'bg-gray-100 text-gray-700',
      'INTERMEDIATE': 'bg-blue-100 text-blue-700',
      'ADVANCE': 'bg-green-100 text-green-700'
    };
    return colors[level] || colors['INTERMEDIATE'];
  };

  const getModeLabel = (mode) => {
    const labels = {
      'ONE_TO_ONE': '1-on-1',
      'GROUP': 'Group',
      'LONG_FORM_MENTORSHIP': 'Long-term'
    };
    return labels[mode] || mode;
  };

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setShowBooking(true);
  };

  const handleBookingSuccess = async (session) => {
    try {
      setShowBooking(false);
      setSelectedMentor(null);
      setSuccess(`Session booked successfully! Session ID: ${session.sessionId}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Failed to book session: ' + error.message);
    }
  };

  const handleBookingClose = () => {
    setShowBooking(false);
    setSelectedMentor(null);
  };

  return (
    <div className="matching-engine">
      <div className="container">
        <BackButton to="/learner/dashboard" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">Find Your Perfect Mentor</h1>
          <p className="page-subtitle">
            Select a skill you want to learn and discover amazing mentors
          </p>
        </motion.div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Your Learning Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="skills-section"
        >
          <h2 className="section-title">Your Learning Goals</h2>
          {learnSkills.length > 0 ? (
            <div className="skills-grid">
              {learnSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => findMentors(skill)}
                  className={`skill-card ${selectedSkill?.id === skill.id ? 'selected' : ''}`}
                >
                  <div className="skill-header">
                    <h3 className="skill-name">{skill.skillName}</h3>
                    <span className={`priority-badge ${skill.priorityLevel.toLowerCase()}`}>
                      {skill.priorityLevel}
                    </span>
                  </div>
                  <div className="skill-details">
                    <div className="skill-meta">
                      <span className="mode-tag">{getModeLabel(skill.preferredMode)}</span>
                      <span className="time-tag">
                        {skill.dayOfWeek}: {skill.startTime}-{skill.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="skill-action">
                    <span>Find Mentors →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No learning skills found. Please add some skills first.</p>
            </div>
          )}
        </motion.div>

        {/* Matched Mentors */}
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mentors-section"
          >
            <h2 className="section-title">
              Mentors for {selectedSkill.skillName}
              {isLoading && <span className="loading-spinner">🔄</span>}
            </h2>
            
            {isLoading ? (
              <div className="loading-state">
                <p>Finding the best mentors for you...</p>
              </div>
            ) : mentors.length > 0 ? (
              <div className="mentors-grid">
                {mentors.map((mentor) => (
                  <motion.div
                    key={mentor.mentorId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mentor-card"
                  >
                    <div className="mentor-header">
                      <div className="mentor-avatar">
                        {mentor.profileImage ? (
                          <img src={mentor.profileImage} alt={mentor.mentorName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {mentor.mentorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="mentor-info">
                        <h3 className="mentor-name">{mentor.mentorName}</h3>
                        <p className="mentor-location">{mentor.city}</p>
                      </div>
                    </div>
                    
                    <div className="mentor-skills">
                      <div className="skill-level">
                        <span className={`level-badge ${getProficiencyColor(mentor.proficiencyLevel)}`}>
                          {mentor.proficiencyLevel}
                        </span>
                        <span className="confidence-score">
                          Confidence: {mentor.confidenceScore}/10
                        </span>
                      </div>
                      <div className="preferred-mode">
                        <span className="mode-badge">
                          {getModeLabel(mentor.preferredMode)}
                        </span>
                      </div>
                    </div>

                    {mentor.matchExplanation && (
                      <div className="match-explanation">
                        <p>{mentor.matchExplanation}</p>
                      </div>
                    )}

                    <div className="mentor-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleBookSession(mentor)}
                      >
                        Request Session (10 coins)
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          setSelectedMentorId(mentor.mentorId);
                          setShowProfileModal(true);
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No mentors found for this skill. Try adjusting your preferences.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Session Booking Modal */}
        {showBooking && selectedMentor && (
          <SessionBooking
            mentor={selectedMentor}
            skill={selectedSkill}
            onClose={handleBookingClose}
            onSuccess={handleBookingSuccess}
          />
        )}

        <ZeroCoinsModal 
          isOpen={showZeroCoinsModal}
          onClose={() => setShowZeroCoinsModal(false)}
          onBecomeTeacher={() => window.location.href = '/mentor/setup'}
        />

        {showProfileModal && selectedMentorId && (
          <MentorProfileModal
            mentorId={selectedMentorId}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedMentorId(null);
            }}
          />
        )}
      </div>

      {/* No Mentors Found Modal */}
      {showNoMentorsModal && (
        <div className="modal-overlay" onClick={() => setShowNoMentorsModal(false)}>
          <div className="modal-content no-mentors-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Mentors Found</h3>
            <p>No mentors found for the specified criteria. Try adjusting your preferences or check back later.</p>
            <button className="btn btn-primary" onClick={() => setShowNoMentorsModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingEngine;