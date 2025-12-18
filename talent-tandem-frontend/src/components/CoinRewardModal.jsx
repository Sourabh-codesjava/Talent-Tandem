import React from 'react';
import { motion } from 'framer-motion';
import './CoinRewardModal.css';

const CoinRewardModal = ({ isOpen, coins = 100, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="coin-modal-overlay">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="coin-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="coin-icon"
        >
          🪙
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="coin-title"
        >
          Congratulations! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="coin-message"
        >
          You've earned
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: "spring" }}
          className="coin-amount"
        >
          {coins} Coins
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="coin-subtitle"
        >
          {message || 'for completing your learner profile!'}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="coin-close-btn"
          style={{ position: 'relative', zIndex: 10 }}
        >
          Start Learning! 🚀
        </motion.button>

        {/* Floating coins animation */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-coin"
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: [-20, -100],
              x: [0, (i % 2 === 0 ? 1 : -1) * (50 + i * 10)],
              opacity: [1, 0],
              rotate: [0, 360]
            }}
            transition={{
              delay: 0.8 + i * 0.1,
              duration: 1.5,
              ease: "easeOut"
            }}
            style={{
              position: 'absolute',
              fontSize: '2rem',
              left: '50%',
              top: '40%'
            }}
          >
            🪙
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CoinRewardModal;
