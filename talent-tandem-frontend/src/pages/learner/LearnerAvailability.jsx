import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';
import './LearnerAvailability.css';

const LearnerAvailability = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [tempSkill, setTempSkill] = useState(null);
  const [sameTimingsEnabled, setSameTimingsEnabled] = useState(false);
  const [weekendsOff, setWeekendsOff] = useState(false);
  const [weekendFlexibleTime, setWeekendFlexibleTime] = useState({ start: '10:00', end: '16:00' });

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const skillData = localStorage.getItem('tempLearnerSkill');
    if (skillData) {
      const skill = JSON.parse(skillData);
      setTempSkill(skill);
      
      // Pre-populate availability if it exists
      if (skill.availability && skill.availability.length > 0) {
        const availabilityObj = {};
        skill.availability.forEach(slot => {
          availabilityObj[slot.day] = { start: slot.startTime, end: slot.endTime };
        });
        setAvailability(availabilityObj);
      }
    }
  }, []);

  const handleTimeChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const toggleSameTimings = () => {
    setSameTimingsEnabled(!sameTimingsEnabled);
    if (!sameTimingsEnabled) {
      const selectedDayTiming = availability[selectedDay];
      if (selectedDayTiming?.start && selectedDayTiming?.end) {
        const newAvailability = {};
        weekdays.forEach(day => {
          if (weekendsOff && (day === 'Saturday' || day === 'Sunday')) {
            newAvailability[day] = availability[day] || {};
          } else {
            newAvailability[day] = { ...selectedDayTiming };
          }
        });
        setAvailability(newAvailability);
      }
    } else {
      setAvailability({});
    }
  };

  const toggleWeekendsOff = () => {
    setWeekendsOff(!weekendsOff);
    if (!weekendsOff) {
      setAvailability(prev => ({
        ...prev,
        Saturday: {},
        Sunday: {}
      }));
    }
  };

  const applyWeekendFlexible = () => {
    setAvailability(prev => ({
      ...prev,
      Saturday: { ...weekendFlexibleTime },
      Sunday: { ...weekendFlexibleTime }
    }));
  };

  const handleSubmit = () => {
    const availabilityArray = Object.entries(availability)
      .filter(([day, times]) => times.start && times.end)
      .map(([day, times]) => ({ day, startTime: times.start, endTime: times.end }));
    
    if (tempSkill) {
      const updatedSkill = { ...tempSkill, availability: availabilityArray };
      localStorage.setItem('tempLearnerSkill', JSON.stringify(updatedSkill));
    }
    
    navigate('/learner/setup');
  };

  const handleBack = () => {
    if (tempSkill) {
      const availabilityArray = Object.entries(availability)
        .filter(([day, times]) => times.start && times.end)
        .map(([day, times]) => ({ day, startTime: times.start, endTime: times.end }));
      
      const updatedSkill = { ...tempSkill, availability: availabilityArray };
      localStorage.setItem('tempLearnerSkill', JSON.stringify(updatedSkill));
    }
    navigate('/learner/setup');
  };

  return (
    <div className="learner-availability-page">
      <div className="learner-hero-section">
        <BackButton to="/learner/setup" />
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Set Your Learning Schedule</h1>
          <p>When are you available to learn?</p>
        </motion.div>
      </div>

      <div className="learner-content">
        <div className="availability-section">
          <div className="calendar-container">
            <div className="calendar-grid">
              {weekdays.map(day => {
                const isSelected = selectedDay === day;
                const hasTime = availability[day]?.start && availability[day]?.end;
                const isWeekendOff = weekendsOff && (day === 'Saturday' || day === 'Sunday') && !hasTime;
                return (
                  <motion.div
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${hasTime ? 'has-time' : ''} ${isWeekendOff ? 'weekend-off' : ''}`}
                    onClick={() => setSelectedDay(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="day-name">{day.slice(0, 3)}</div>
                    <div className="day-time">
                      {isWeekendOff ? 'Off' : hasTime ? `${availability[day].start}-${availability[day].end}` : 'Set time'}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="time-setter">
              <h3>Set time for {selectedDay}</h3>
              <div className="time-inputs">
                <input 
                  type="time"
                  className="time-input"
                  value={availability[selectedDay]?.start || ''}
                  onChange={(e) => handleTimeChange(selectedDay, 'start', e.target.value)}
                  placeholder="Start time"
                />
                <span className="time-separator">to</span>
                <input 
                  type="time"
                  className="time-input"
                  value={availability[selectedDay]?.end || ''}
                  onChange={(e) => handleTimeChange(selectedDay, 'end', e.target.value)}
                  placeholder="End time"
                  disabled={!availability[selectedDay]?.start}
                />
              </div>
            </div>

            <div className="quick-actions">
              <div className={`quick-option ${sameTimingsEnabled ? 'active' : ''}`}>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={sameTimingsEnabled}
                    onChange={toggleSameTimings}
                  />
                  📋 Apply same timings to all days
                </label>
              </div>
              
              <div className={`quick-option ${weekendsOff ? 'weekends-off' : ''}`}>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={weekendsOff}
                    onChange={toggleWeekendsOff}
                  />
                  🚫 Weekends off
                </label>
              </div>
              
              <div className={`weekend-flexible ${weekendsOff ? 'disabled' : ''}`}>
                <div className="flexible-header">
                  🔄 Weekend flexible
                </div>
                <div className="flexible-inputs">
                  <input 
                    type="time"
                    className="time-input-small"
                    value={weekendFlexibleTime.start}
                    onChange={(e) => !weekendsOff && setWeekendFlexibleTime(prev => ({ ...prev, start: e.target.value }))}
                    disabled={weekendsOff}
                  />
                  <span>to</span>
                  <input 
                    type="time"
                    className="time-input-small"
                    value={weekendFlexibleTime.end}
                    onChange={(e) => !weekendsOff && setWeekendFlexibleTime(prev => ({ ...prev, end: e.target.value }))}
                    disabled={weekendsOff}
                  />
                  <button 
                    className="apply-btn" 
                    onClick={applyWeekendFlexible}
                    disabled={weekendsOff}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-secondary"
              onClick={handleBack}
            >
              Back to Skills
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAvailability;