import React from 'react';
import { motion } from 'framer-motion';
import './SessionRequestModal.css';

const SessionRequestModal = ({ session, onAccept, onDecline, onClose }) => {
  if (!session) return null;

  return (
    <div className="session-request-overlay" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="session-request-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="request-header">
          <h2>📅 Session Request</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="request-body">
          <div className="learner-info">
            <div className="learner-avatar">
              {session.learnerName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{session.learnerName}</h3>
              <p className="skill-name">{session.skillName}</p>
            </div>
          </div>

          <div className="session-details">
            <div className="detail-row">
              <span className="label">📅 Date & Time:</span>
              <span className="value">{new Date(session.scheduledTime).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">⏱️ Duration:</span>
              <span className="value">{session.durationMinutes} minutes</span>
            </div>
            <div className="detail-row">
              <span className="label">📝 Agenda:</span>
              <span className="value">{session.agenda}</span>
            </div>
          </div>
        </div>

        <div className="request-actions">
          <button onClick={onDecline} className="btn-decline">
            ❌ Decline
          </button>
          <button onClick={onAccept} className="btn-accept">
            ✅ Accept
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionRequestModal;
