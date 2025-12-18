import React from 'react';
import { motion } from 'framer-motion';
import './AcceptanceModal.css';

const AcceptanceModal = ({ isOpen, mentorName, onClose, onOpenChat }) => {
  if (!isOpen) return null;

  return (
    <div className="acceptance-overlay">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="acceptance-modal"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="success-icon"
        >
          ✅
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Request Accepted! 🎉
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="acceptance-message"
        >
          <strong>{mentorName}</strong> has accepted your session request!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="acceptance-actions"
        >
          <button onClick={onOpenChat} className="btn-chat">
            💬 Open Pre-Chat
          </button>
          <button onClick={onClose} className="btn-later">
            Later
          </button>
        </motion.div>

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="confetti"
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: [0, -150],
              x: [(i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
              opacity: [1, 0],
              rotate: [0, 360]
            }}
            transition={{
              delay: 0.3 + i * 0.1,
              duration: 1.2
            }}
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              left: '50%',
              top: '30%'
            }}
          >
            {['🎉', '✨', '🎊', '⭐', '💫', '🌟'][i]}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AcceptanceModal;
