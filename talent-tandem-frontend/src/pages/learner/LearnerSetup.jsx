import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import Notification from '../../components/Notification';
import CoinRewardModal from '../../components/CoinRewardModal';
import SearchableSelect from '../../components/SearchableSelect';
import './LearnerSetup.css';

const LearnerSetup = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [learningModes, setLearningModes] = useState([]);
  const [currentAvailability, setCurrentAvailability] = useState([]);
  const [priority, setPriority] = useState('INTERMEDIATE');
  const [currentLevel, setCurrentLevel] = useState('BEGINNER');
  const [learningGoal, setLearningGoal] = useState('');
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [isFirstSkill, setIsFirstSkill] = useState(true);

  useEffect(() => {
    // Refresh user context to ensure we have the latest user
    refreshUser();
  }, []);

  useEffect(() => {
    console.log('LearnerSetup - Current user:', user);
    

    
    loadAvailableSkills();
    if (user?.id) {
      console.log('Loading learn skills for user ID:', user.id);
      loadUserLearnSkills();
    }
    
    const tempSkill = localStorage.getItem('tempLearnerSkill');
    if (tempSkill) {
      const parsed = JSON.parse(tempSkill);
      if (parsed.availability) {
        setCurrentAvailability(parsed.availability);
      }
      if (parsed.skillName) {
        setSelectedSkill(parsed.skillName);
      }
      if (parsed.priority) {
        setPriority(parsed.priority);
      }
      if (parsed.currentLevel) {
        setCurrentLevel(parsed.currentLevel);
      }
      if (parsed.learningGoal) {
        setLearningGoal(parsed.learningGoal);
      }
      if (parsed.learningModes) {
        setLearningModes(parsed.learningModes);
      }
      if (parsed.editingId) {
        setEditingSkillId(parsed.editingId);
      }
    }

    // Skills will be loaded from backend only
  }, [user]);

  const loadAvailableSkills = async () => {
    try {
      const skillsData = await ApiService.getAllSkills();
      console.log('Raw skills from API:', skillsData);
      setAvailableSkills(skillsData);
      console.log('Available skills set:', skillsData);
    } catch (error) {
      console.error('Error loading skills:', error);
      setNotification({
        show: true,
        message: 'Failed to load skills',
        type: 'error'
      });
    }
  };

  const loadUserLearnSkills = async () => {
    try {
      const userSkills = await ApiService.getLearnSkillsByUser(user.id);
      console.log('Loaded learn skills from backend:', userSkills);
      setLearnSkills(userSkills);
      
      // Sync with local skills for UI
      const backendSkills = userSkills.map(skill => ({
        id: skill.id,
        name: skill.skillName,
        skillName: skill.skillName,
        priority: skill.priorityLevel,
        currentLevel: skill.priorityLevel,
        learningGoal: '',
        learningModes: [skill.preferredMode],
        availability: [{
          day: skill.dayOfWeek,
          startTime: skill.startTime,
          endTime: skill.endTime
        }]
      }));
      setSkills(backendSkills);
    } catch (error) {
      console.log('Error loading learning skills:', error);
      setLearnSkills([]);
      setSkills([]);
    }
  };

  // Remove localStorage dependency - backend is source of truth

  const skillOptions = availableSkills.map(skill => skill.name || skill.skillName);
  console.log('Skill options for dropdown:', skillOptions);

  const learningModeOptions = [
    { id: 'ONE_TO_ONE', label: '1-on-1 Mentoring', icon: '👤', emoji: '👤' },
    { id: 'GROUP', label: 'Group Sessions', icon: '👥', emoji: '👥' },
    { id: 'LONG_FORM_MENTORSHIP', label: 'Long Form Mentorship', icon: '🎯', emoji: '🎯' }
  ];

  const priorityLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCE'];
  const currentLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCE'];

  const toggleLearningMode = (modeId) => {
    setLearningModes(prev => 
      prev.includes(modeId) 
        ? prev.filter(id => id !== modeId)
        : [...prev, modeId]
    );
  };

  const isSkillAlreadyAdded = (skillName) => {
    return skills.some(s => (s.name || s.skillName) === skillName && s.id !== editingSkillId);
  };

  const canAddSkill = () => {
    const hasValidAvailability = currentAvailability.length > 0 && 
      currentAvailability[0]?.startTime && 
      currentAvailability[0]?.endTime;
    
    return (
      selectedSkill &&
      learningModes.length > 0 &&
      hasValidAvailability &&
      !isSkillAlreadyAdded(selectedSkill)
    );
  };

  const addSkill = async () => {
    if (!canAddSkill() || !user?.id) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedSkillObj = availableSkills.find(s => (s.name || s.skillName) === selectedSkill);
      if (!selectedSkillObj) {
        throw new Error('Selected skill not found');
      }

      // Validate availability data
      if (!currentAvailability[0]?.startTime || !currentAvailability[0]?.endTime) {
        throw new Error('Please set your availability with valid start and end times');
      }

      // Convert day to backend enum format
      let dayOfWeek = currentAvailability[0].day || 'MONDAY';
      if (typeof dayOfWeek === 'string') {
        dayOfWeek = dayOfWeek.toUpperCase();
      }
      
      const startTime = currentAvailability[0].startTime;
      const endTime = currentAvailability[0].endTime;
      const preferredMode = learningModes[0] || 'ONE_TO_ONE';
      const priorityLevel = priority;

      const learnSkillData = {
        userId: user.id,
        skillId: selectedSkillObj.id,
        priorityLevel: priorityLevel,
        preferredMode: preferredMode,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime
      };

      console.log('Current user context:', user);
      console.log('Sending learnSkillData:', learnSkillData);
      
      if (editingSkillId) {
        await ApiService.deleteLearnSkill(editingSkillId);
      }
      
      const response = await ApiService.addLearnSkill(learnSkillData);
      
      const isFirstSkillAdded = skills.length === 0;
      
      // Reload user skills from backend to stay in sync
      await loadUserLearnSkills();
      
      // Update user context to reflect learner profile completion
      if (user && !user.hasLearnerProfile) {
        const updatedUser = { ...user, hasLearnerProfile: true };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        refreshUser();
      }
      
      setNotification({
        show: true,
        message: 'Learning skill added successfully!',
        type: 'success'
      });
      resetForm();
      localStorage.removeItem('tempLearnerSkill');
      
      // Show coin modal if first skill
      if (isFirstSkillAdded) {
        setTimeout(() => setShowCoinModal(true), 500);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to add learning skill',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSkill('');
    setPriority('INTERMEDIATE');
    setCurrentLevel('BEGINNER');
    setLearningGoal('');
    setLearningModes([]);
    setCurrentAvailability([]);
    setEditingSkillId(null);
  };

  const editSkill = (skill) => {
    setEditingSkillId(skill.id);
    setSelectedSkill(skill.name);
    setPriority(skill.priority);
    setCurrentLevel(skill.currentLevel);
    setLearningGoal(skill.learningGoal || '');
    setLearningModes(skill.learningModes);
    setCurrentAvailability(skill.availability);
    setExpandedSkill(null);
  };

  const deleteSkill = (skillId) => {
    // TODO: Implement delete API call
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleSetAvailability = () => {
    localStorage.setItem('tempLearnerSkill', JSON.stringify({
      skillName: selectedSkill,
      priority,
      currentLevel,
      learningGoal,
      learningModes,
      availability: currentAvailability,
      editingId: editingSkillId
    }));
    navigate('/learner/availability');
  };

  const formatAvailability = (availability) => {
    return availability.map(a => `${a.day}: ${a.startTime}-${a.endTime}`).join(', ');
  };

  const getLearningModeLabel = (modeId) => {
    const mode = learningModeOptions.find(m => m.id === modeId);
    return mode ? `${mode.emoji} ${mode.label}` : modeId;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'BEGINNER': 'bg-gray-100 text-gray-700',
      'INTERMEDIATE': 'bg-blue-100 text-blue-700', 
      'ADVANCE': 'bg-orange-100 text-orange-700'
    };
    return colors[priority] || colors['INTERMEDIATE'];
  };

  return (
    <div className="learner-setup">
      <div className="container">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <button
            onClick={() => navigate('/learner/dashboard')}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fade-in"
        >
          <h1 className="page-title" style={{ color: 'white' }}>
            Set Up Your Learning Profile
          </h1>
          <p className="page-subtitle" style={{ color: 'white' }}>
            Add the skills you want to learn and set your preferences
          </p>
        </motion.div>

        {/* Skills Summary */}
        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="form-card"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 className="section-title">
              Your Learning Goals ({skills.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {skills.map(skill => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="skill-card"
                >
                  {/* Skill Header */}
                  <div
                    className="skill-header"
                    onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                  >
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <div className="skill-meta">
                        <span className={`priority-badge priority-${skill.priority.toLowerCase()}`}>
                          {skill.priority}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{skill.currentLevel}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="tag">
                        {skill.availability.length} slots
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        {expandedSkill === skill.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSkill === skill.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="skill-details"
                    >
                      {skill.learningGoal && (
                        <div className="detail-section">
                          <div className="detail-label">Goal:</div>
                          <div className="detail-content">{skill.learningGoal}</div>
                        </div>
                      )}

                      <div className="detail-section">
                        <div className="detail-label">Learning Modes:</div>
                        <div className="tags">
                          {skill.learningModes.map(modeId => (
                            <span key={modeId} className="tag">
                              {getLearningModeLabel(modeId)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="detail-section">
                        <div className="detail-label">Availability:</div>
                        <div className="availability-tags tags">
                          {skill.availability.map((avail, idx) => (
                            <span key={idx} className="tag">
                              {avail.day}: {avail.startTime}-{avail.endTime}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="skill-actions">
                        <button
                          onClick={() => editSkill(skill)}
                          className="btn btn-outline"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="btn btn-danger"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add Learning Goal Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="form-card slide-up"
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            <h2 className="section-title">
              {editingSkillId ? 'Edit Learning Goal' : 'Add a New Learning Goal'}
            </h2>

            {/* Skill Selection */}
            <div className="form-group">
              <label className="form-label">Select Skill *</label>
              <SearchableSelect
                options={skillOptions.map(skill => {
                  const isAdded = isSkillAlreadyAdded(skill);
                  return {
                    value: skill,
                    label: `${skill}${isAdded ? ' ✓' : ''}`,
                    disabled: isAdded
                  };
                })}
                value={selectedSkill}
                onChange={setSelectedSkill}
                placeholder="Search and select a skill to learn"
              />
            </div>

            {/* Priority & Current Level */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority Level *</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                >
                  {priorityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Level *</label>
                <select 
                  value={currentLevel} 
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="form-select"
                >
                  {currentLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Learning Goal */}
            <div className="form-group">
              <label className="form-label">Learning Goal (Optional)</label>
              <textarea
                placeholder="What do you want to achieve with this skill?"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Learning Modes */}
            <div className="form-group">
              <label className="form-label">Preferred Learning Modes *</label>
              <div className="learning-modes-grid">
                {learningModeOptions.map(mode => {
                  const isSelected = learningModes.includes(mode.id);
                  return (
                    <motion.div
                      key={mode.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleLearningMode(mode.id)}
                      className={`learning-mode-card ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="mode-icon">{mode.emoji}</span>
                      <span className="mode-label">{mode.label}</span>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#22c55e' }}>✓</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div className="form-group">
              <label className="form-label">Learning Schedule *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSetAvailability}
                  className="schedule-btn"
                >
                  📅 Set Learning Schedule
                </button>
                {currentAvailability.length > 0 && (
                  <div className="availability-indicator">
                    ⏰ {currentAvailability.length} time slot(s) set
                  </div>
                )}
              </div>
              {currentAvailability.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #22c55e' }}>
                  <p style={{ fontSize: '0.9rem', color: '#374151' }}>
                    {formatAvailability(currentAvailability)}
                  </p>
                </div>
              )}
            </div>

            {/* Add/Update Button */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem' }}>
              {editingSkillId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={addSkill}
                disabled={!canAddSkill()}
                className={`btn btn-primary ${!canAddSkill() ? 'disabled' : ''}`}
                style={{ flex: 1 }}
              >
                ➕ {editingSkillId ? 'Update Learning Goal' : 'Add Learning Goal'}
              </button>
            </div>
          </motion.div>



        {/* Complete Setup Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: '2rem' }}
        >
          <button
            onClick={async () => {
              if (skills.length > 0) {
                try {
                  await ApiService.completeLearnerSetup(user.id);
                  setShowCoinModal(true);
                } catch (error) {
                  setNotification({
                    show: true,
                    message: 'Failed to complete setup',
                    type: 'error'
                  });
                }
              }
            }}
            disabled={skills.length === 0}
            className={`complete-btn ${skills.length === 0 ? 'disabled' : ''}`}
            style={{ padding: '1.5rem 3rem', fontSize: '1.2rem', borderRadius: '50px' }}
          >
            ✅ Complete Learner Setup
          </button>
          {skills.length === 0 && (
            <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '0.9rem' }}>
              Add at least one learning goal to complete your profile
            </p>
          )}
        </motion.div>
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <CoinRewardModal
        isOpen={showCoinModal}
        coins={100}
        message="Welcome to your learning journey! You've earned 100 coins to book your first session."
        onClose={() => {
          setShowCoinModal(false);
          navigate('/learner/dashboard');
        }}
      />
    </div>
  );
};

export default LearnerSetup;