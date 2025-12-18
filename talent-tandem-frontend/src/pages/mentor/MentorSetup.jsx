import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import Notification from '../../components/Notification';
import SearchableSelect from '../../components/SearchableSelect';
import './MentorSetup.css';

const MentorSetup = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [teachSkills, setTeachSkills] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: '',
    rate: '',
    githubLink: '',
    notes: '',
    availability: [],
    sessionTypes: []
  });
  const [expandedSkill, setExpandedSkill] = useState(null);

  React.useEffect(() => {
    // Refresh user context to ensure we have the latest user
    refreshUser();
  }, []);

  React.useEffect(() => {
    console.log('MentorSetup - Current user:', user);
    loadAvailableSkills();
    if (user?.id) {
      console.log('Loading teach skills for user ID:', user.id);
      loadUserTeachSkills();
    }
    
    // Skills will be loaded from backend only

    const tempSkillData = localStorage.getItem('tempSkill');
    const returnToForm = localStorage.getItem('returnToForm');
    
    if (tempSkillData) {
      const skillData = JSON.parse(tempSkillData);
      
      if (returnToForm === 'true') {
        // Return to form with skill data
        setNewSkill(skillData);
        setShowAddSkill(true);
        localStorage.removeItem('returnToForm');
      } else if (skillData.availability && skillData.availability.length > 0) {
        // Auto-add skill if availability is set
        // Load skills from backend instead of localStorage
        if (user?.id) {
          loadUserTeachSkills();
        }
        setNewSkill({
          name: '',
          proficiency: '',
          rate: '',
          githubLink: '',
          notes: '',
          availability: [],
          sessionTypes: []
        });
        setShowAddSkill(true);
      } else {
        setNewSkill(skillData);
      }
      localStorage.removeItem('tempSkill');
    }
  }, [user]);

  const loadAvailableSkills = async () => {
    try {
      const skillsData = await ApiService.getAllSkills();
      setAvailableSkills(skillsData);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to load skills',
        type: 'error'
      });
    }
  };

  const loadUserTeachSkills = async () => {
    try {
      const userSkills = await ApiService.getTeachSkillsByUser(user.id);
      setTeachSkills(userSkills);
      // Sync with local skills for UI
      const backendSkills = userSkills.map(skill => ({
        id: skill.teachId,
        name: skill.skillName,
        proficiency: skill.proficiencyLevel,
        githubLink: '',
        notes: '',
        sessionTypes: [skill.preferredMode],
        availability: [`${skill.dayOfWeek} ${skill.startTime} - ${skill.endTime}`]
      }));
      setSkills(backendSkills);
    } catch (error) {
      console.log('No teaching skills found');
      setTeachSkills([]);
    }
  };

  const skillSuggestions = availableSkills.map(skill => skill.name || skill.skillName);

  const proficiencyLevels = [
    { value: 'BEGINNER', label: 'Beginner', stars: 1 },
    { value: 'INTERMEDIATE', label: 'Intermediate', stars: 2 },
    { value: 'ADVANCE', label: 'Advanced', stars: 4 }
  ];

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const sessionTypeOptions = [
    { value: 'ONE_TO_ONE', label: 'One to One', icon: '👤' },
    { value: 'LONG_FORM_MENTORSHIP', label: 'Long Form Mentorship', icon: '📚' },
    { value: 'GROUP', label: 'Group Sessions', icon: '👥' }
  ];

  const handleNewSkillChange = (field, value) => {
    setNewSkill({ ...newSkill, [field]: value });
  };

  const handleArrayToggle = (field, value) => {
    const currentArray = newSkill[field];
    if (currentArray.includes(value)) {
      setNewSkill({
        ...newSkill,
        [field]: currentArray.filter(item => item !== value)
      });
    } else {
      setNewSkill({
        ...newSkill,
        [field]: [...currentArray, value]
      });
    }
  };

  const addSkill = async () => {
    if (!newSkill.name || !newSkill.proficiency || !newSkill.rate || newSkill.availability.length === 0 || !user?.id) {
      setNotification({
        show: true,
        message: 'Please fill all required fields including rate and availability',
        type: 'error'
      });
      return;
    }

    if (newSkill.rate < 1 || newSkill.rate > 10) {
      setNotification({
        show: true,
        message: 'Rate must be between 1 and 10',
        type: 'error'
      });
      return;
    }

    console.log('Current user context:', user);
    console.log('Using user ID:', user.id);

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedSkillObj = availableSkills.find(s => (s.name || s.skillName) === newSkill.name);
      if (!selectedSkillObj) {
        throw new Error('Selected skill not found');
      }

      // Parse availability format: "Monday 09:00 - 17:00"
      const firstAvailability = newSkill.availability[0];
      const parts = firstAvailability.split(' ');
      
      if (parts.length < 4) {
        throw new Error('Invalid availability format. Please set availability properly.');
      }
      
      const dayPart = parts[0];
      const startTime = parts[1];
      const endTime = parts[3]; // Skip the '-' separator
      
      if (!startTime || !endTime) {
        throw new Error('Start time and end time are required');
      }

      // Ensure day is in correct backend enum format
      const dayOfWeek = dayPart.toUpperCase();

      const teachSkillData = {
        userId: user.id,
        skillId: selectedSkillObj.id,
        proficiencyLevel: newSkill.proficiency,
        confidenceScore: parseInt(newSkill.rate),
        preferredMode: newSkill.sessionTypes[0] || 'ONE_TO_ONE',
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime
      };

      console.log('Sending teachSkillData:', teachSkillData);

      if (newSkill.isEditing && newSkill.originalId) {
        await ApiService.deleteTeachSkill(newSkill.originalId);
      }

      const response = await ApiService.addTeachSkill(teachSkillData);
      
      // Update user context to reflect mentor profile completion
      if (user && !user.hasTeachProfile) {
        const updatedUser = { ...user, hasTeachProfile: true };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        refreshUser();
      }
      
      // Reload user skills from backend to stay in sync
      await loadUserTeachSkills();
      setNewSkill({
        name: '',
        proficiency: '',
        rate: '',
        githubLink: '',
        notes: '',
        availability: [],
        sessionTypes: []
      });
      setShowAddSkill(true);
      setNotification({
        show: true,
        message: 'Teaching skill added successfully!',
        type: 'success'
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to add teaching skill',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSkill = (skillId) => {
    // TODO: Implement delete API call
    const updatedSkills = skills.filter(skill => skill.id !== skillId);
    setSkills(updatedSkills);
  };

  const renderStars = (count) => {
    return '⭐'.repeat(count);
  };

  const handleSubmit = () => {
    console.log('Mentor skills:', skills);
    
    // Update user context to reflect mentor profile completion
    if (user && !user.hasTeachProfile) {
      const updatedUser = { ...user, hasTeachProfile: true };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      refreshUser();
    }
    
    navigate('/mentor/dashboard');
  };

  return (
    <div className="mentor-setup-page">
      <div className="mentor-hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ color: '#000000' }}>Setup Your Mentor Profile</h1>
          <p style={{ color: '#000000' }}>Add your skills and expertise to help learners find you</p>

        </motion.div>
      </div>

      <div className="container">


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
              Your Skills ({skills.length})
            </h2>
            <div className="skills-tags">
              {skills.map((skill) => (
                <span 
                  key={skill.id} 
                  className={`skill-tag ${expandedSkill === skill.id ? 'active' : ''}`}
                  onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Expanded Skill Details */}
        {expandedSkill && (
          <motion.div
            className="form-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: '2rem', marginBottom: '2rem' }}
          >
            {(() => {
              const skill = skills.find(s => s.id === expandedSkill);
              if (!skill) return null;
              return (
                <>
                  <div className="skill-header">
                    <div className="skill-info">
                      <h3 className="skill-name">🎯 {skill.name}</h3>
                      <div className="skill-proficiency">
                        {renderStars(proficiencyLevels.find(p => p.value === skill.proficiency)?.stars || 1)} {skill.proficiency}
                      </div>
                    </div>
                    <div className="skill-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          setNewSkill({ ...skill, isEditing: true, originalId: skill.id });
                          setShowAddSkill(true);
                          setExpandedSkill(null);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => {
                          removeSkill(skill.id);
                          setExpandedSkill(null);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {skill.githubLink && (
                    <div className="detail-section">
                      <div className="detail-label">Portfolio/GitHub:</div>
                      <div className="detail-content">
                        <a href={skill.githubLink} target="_blank" rel="noopener noreferrer">
                          {skill.githubLink}
                        </a>
                      </div>
                    </div>
                  )}

                  {skill.notes && (
                    <div className="detail-section">
                      <div className="detail-label">Notes:</div>
                      <div className="detail-content">{skill.notes}</div>
                    </div>
                  )}

                  <div className="detail-section">
                    <div className="detail-label">Session Types:</div>
                    <div className="tags">
                      {skill.sessionTypes.map(type => {
                        const typeOption = sessionTypeOptions.find(opt => opt.value === type);
                        return (
                          <span key={type} className="tag">
                            {typeOption ? typeOption.label : type}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Availability:</div>
                    <div className="availability-tags tags">
                      {skill.availability.map((slot, idx) => (
                        <span key={idx} className="tag">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Add New Skill Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="form-card"
          style={{ padding: '2rem', marginBottom: '2rem' }}
        >
          <h2 className="section-title">
            {newSkill.isEditing ? 'Edit Skill' : 'Add New Skill'}
          </h2>

          {!showAddSkill ? (
            <div style={{ textAlign: 'center' }}>
              <motion.button
                className="add-skill-btn"
                onClick={() => setShowAddSkill(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Add Skill
              </motion.button>
            </div>
          ) : (
            <div>

              <div className="form-group">
                <label>Select Skill *</label>
                <SearchableSelect
                  options={skillSuggestions.map(suggestion => {
                    const isAlreadyAdded = skills.some(skill => 
                      skill.name.toLowerCase() === suggestion.toLowerCase() && 
                      (!newSkill.isEditing || skill.id !== newSkill.originalId)
                    );
                    return {
                      value: suggestion,
                      label: `${suggestion}${isAlreadyAdded ? ' ✓' : ''}`,
                      disabled: isAlreadyAdded
                    };
                  })}
                  value={newSkill.name}
                  onChange={(value) => handleNewSkillChange('name', value)}
                  placeholder="Search and select a skill"
                />
              </div>

              <div className="form-group">
                <label>Proficiency Level *</label>
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => handleNewSkillChange('proficiency', e.target.value)}
                >
                  <option value="">Select your proficiency</option>
                  {proficiencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {renderStars(level.stars)} {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rate Yourself (1-10) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newSkill.rate}
                  onChange={(e) => handleNewSkillChange('rate', e.target.value)}
                  placeholder="Rate your skill level from 1 to 10"
                />
              </div>

              <div className="form-group">
                <label>🔗 GitHub/Portfolio Link (Optional)</label>
                <input
                  type="url"
                  value={newSkill.githubLink}
                  onChange={(e) => handleNewSkillChange('githubLink', e.target.value)}
                  placeholder="https://github.com/username or portfolio link"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={newSkill.notes}
                  onChange={(e) => handleNewSkillChange('notes', e.target.value)}
                  placeholder="Add any additional details about your expertise in this skill..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>What can you offer for this skill? *</label>
                <div className="session-type-options">
                  {sessionTypeOptions.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`session-type-card ${
                        newSkill.sessionTypes.includes(type.value) ? 'selected' : ''
                      }`}
                      onClick={() => handleArrayToggle('sessionTypes', type.value)}
                    >
                      <span className="session-icon">{type.icon}</span>
                      <span className="session-label">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Availability Schedule *</label>
                <button
                  type="button"
                  className="availability-btn"
                  onClick={() => {
                    const skillData = { ...newSkill, tempId: Date.now() };
                    localStorage.setItem('tempSkill', JSON.stringify(skillData));
                    navigate('/mentor/availability');
                  }}
                >
                  📅 Set Availability Schedule
                </button>
                {newSkill.availability.length > 0 && (
                  <div className="availability-preview">
                    ✅ Availability set for {newSkill.availability.length} time slots
                  </div>
                )}
              </div>

              <button
                type="button"
                className="add-skill-btn-full"
                onClick={addSkill}
                disabled={!newSkill.name || !newSkill.proficiency || !newSkill.rate || newSkill.sessionTypes.length === 0 || newSkill.availability.length === 0 || isLoading || (!newSkill.isEditing && skills.some(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase()))}
              >
                {isLoading ? 'Adding...' : (newSkill.isEditing ? 'Update Skill' : 'Add Skill')}
              </button>
            </div>
          )}
        </motion.div>

        {skills.length > 0 && (
          <div className="complete-setup">
            <motion.button
              className="complete-btn"
              onClick={handleSubmit}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Complete Mentor Setup
            </motion.button>
          </div>
        )}
      </div>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
};

export default MentorSetup;