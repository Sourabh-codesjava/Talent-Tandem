import React from 'react';
import './ZeroCoinsModal.css';

const ZeroCoinsModal = ({ isOpen, onClose, onBecomeTeacher }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">💰❌</div>
        <h2>Out of Coins!</h2>
        <p>You don't have enough coins to book a session. Become a mentor and teach learners to earn coins!</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>You'll earn 10 coins for each completed session as a mentor.</p>
        <div className="modal-actions">
          <button className="btn-primary" onClick={onBecomeTeacher}>
            Become a Mentor
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZeroCoinsModal;
