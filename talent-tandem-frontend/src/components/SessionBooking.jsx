import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { useUser } from '../context/UserContext';
import socket from '../socket';
import ZeroCoinsModal from './ZeroCoinsModal';
import './SessionBooking.css';

const SessionBooking = ({ mentor, skill, onClose, onSuccess }) => {
  const { user, triggerWalletUpdate } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    agenda: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    learningOutcomes: '',
    sessionType: 'ONE_TO_ONE'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userCoins, setUserCoins] = useState(null);
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const wallet = await ApiService.getWallet();
        console.log('Wallet loaded:', wallet);
        setUserCoins(wallet.coins);
      } catch (error) {
        console.error('Error fetching wallet:', error);
        setUserCoins(0); // Default to 0 if error
      }
    };
    fetchWallet();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!user?.id) return;

    // Re-fetch wallet to ensure latest balance
    try {
      const wallet = await ApiService.getWallet();
      console.log('Current wallet:', wallet);

      if (wallet.coins < 10) {
        console.log('Not enough coins, showing modal');
        setShowZeroCoinsModal(true);
        return;
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
      setError('Failed to check wallet balance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate fields
      if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) {
        setError('Please fill all required fields');
        return;
      }

      // Calculate duration
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

      if (durationMinutes <= 0) {
        setError('End time must be after start time');
        return;
      }

      if (durationMinutes < 15) {
        setError('Session duration must be at least 15 minutes');
        return;
      }

      if (durationMinutes > 180) {
        setError('Session duration cannot exceed 180 minutes (3 hours)');
        return;
      }

      // Create a future date for the selected day
      const today = new Date();
      const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(formData.dayOfWeek);
      const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7 || 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      targetDate.setHours(startHour, startMin, 0, 0);

      const sessionRequest = {
        mentorId: mentor.mentorId,
        learnerId: user.id,
        skillId: skill.skillId,
        agenda: formData.agenda || 'Session booking',
        scheduledTime: targetDate.toISOString(),
        durationMinutes: durationMinutes,
        learningOutcomes: formData.learningOutcomes || '',
        sessionType: formData.sessionType,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime
      };

      console.log('Booking session with data:', sessionRequest);
      const response = await ApiService.bookSession(sessionRequest);
      console.log('Session booked successfully:', response);

      // Send WebSocket notification to mentor
      try {
        if (socket && socket.connected) {
          socket.publish({
            destination: `/queue/user/${mentor.mentorId}/sessions`,
            body: JSON.stringify({
              notificationType: 'REQUESTED',
              sessionId: response.sessionId,
              mentorId: mentor.mentorId,
              learnerId: user.id,
              learnerName: user.firstName || user.username,
              skillName: skill.skillName,
              scheduledTime: sessionRequest.scheduledTime,
              durationMinutes: durationMinutes,
              agenda: formData.agenda,
              message: `New session request from ${user.firstName || user.username} for ${skill.skillName}`
            })
          });
          console.log('✅ Notification sent to mentor');
        } else {
          console.warn('⚠️ WebSocket not connected');
        }
      } catch (error) {
        console.warn('❌ WebSocket notification failed:', error);
      }

      // Instead of closing immediately, show success state
      setIsSuccess(true);
      triggerWalletUpdate();
      // We will call onSuccess when user closes the success modal
      // onSuccess(response); 
    } catch (error) {
      console.error('Error booking session:', error);
      const errorMsg = error.message || 'Failed to book session';
      setError(errorMsg);

      // Show detailed error in console for debugging
      if (error.response) {
        console.error('Backend error response:', error.response);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots for next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour <= 18; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);

        const dateStr = slotTime.toISOString().slice(0, 16);
        const displayStr = slotTime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });

        slots.push({ value: dateStr, label: displayStr });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();
  const durationOptions = [30, 45, 60, 90, 120];

  const handleBecomeMentor = () => {
    setShowZeroCoinsModal(false);
    onClose();
    navigate('/mentor/setup');
  };

  const handleSuccessClose = () => {
    onSuccess(); // Call existing onSuccess which likely closes the modal or refreshes data
    onClose();
  };

  return (
    <>
      {showZeroCoinsModal && (
        <ZeroCoinsModal
          isOpen={showZeroCoinsModal}
          onClose={() => setShowZeroCoinsModal(false)}
          onBecomeTeacher={handleBecomeMentor}
        />
      )}
      <div className="session-booking-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="session-booking-modal"
        >
          {isSuccess ? (
            <div className="success-content" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ color: '#2d3748', marginBottom: '1rem' }}>Request Sent!</h2>
              <p style={{ color: '#718096', marginBottom: '2rem', lineHeight: '1.5' }}>
                Your session request has been sent to <strong>{mentor.mentorName}</strong>.<br />
                You will be notified once they accept it.
              </p>
              <button
                onClick={handleSuccessClose}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
              >
                Okay, Got it!
              </button>
            </div>
          ) : (
            <>
              <div className="modal-header">
                <h2>Book Session with {mentor.mentorName}</h2>
                <button onClick={onClose} className="close-btn">×</button>
              </div>

              <div className="mentor-info">
                <div className="mentor-details">
                  <h3>{skill.skillName}</h3>
                  <p>Proficiency: {mentor.proficiencyLevel}</p>
                  <p>Confidence: {mentor.confidenceScore}/10</p>
                </div>
              </div>

              {error && (
                <div className="error-message" style={{ whiteSpace: 'pre-line' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label>Session Agenda *</label>
                  <textarea
                    name="agenda"
                    value={formData.agenda}
                    onChange={handleInputChange}
                    placeholder="What would you like to learn in this session?"
                    required
                    maxLength={500}
                  />
                  <small>{formData.agenda.length}/500 characters</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Day *</label>
                    <select
                      name="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Day</option>
                      <option value="MONDAY">Monday</option>
                      <option value="TUESDAY">Tuesday</option>
                      <option value="WEDNESDAY">Wednesday</option>
                      <option value="THURSDAY">Thursday</option>
                      <option value="FRIDAY">Friday</option>
                      <option value="SATURDAY">Saturday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#fff'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Learning Outcomes (Optional)</label>
                  <textarea
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleInputChange}
                    placeholder="What do you hope to achieve from this session?"
                    maxLength={1000}
                  />
                  <small>{formData.learningOutcomes.length}/1000 characters</small>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.agenda.trim()}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Booking...' : 'Book Session'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default SessionBooking;