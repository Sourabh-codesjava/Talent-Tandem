import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ message, type = 'success', isVisible, onClose, autoClose = true, duration = 5000, actions = null }) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: '#ffffff', border: '#10b981', text: '#065f46' };
      case 'error':
        return { bg: '#ffffff', border: '#ef4444', text: '#991b1b' };
      case 'warning':
        return { bg: '#ffffff', border: '#f59e0b', text: '#92400e' };
      default:
        return { bg: '#ffffff', border: '#3b82f6', text: '#1e40af' };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: colors.bg,
          color: colors.text,
          padding: '12px 16px',
          borderRadius: '8px',
          border: `2px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px',
          minWidth: '300px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{getIcon()}</span>
          <span style={{ flex: 1, fontWeight: '500' }}>{message}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {actions}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Notification;