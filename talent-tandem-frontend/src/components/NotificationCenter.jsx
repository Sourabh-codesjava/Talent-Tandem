import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    isConnected,
    removeNotification, 
    markAsRead, 
    clearAllNotifications 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationIcon = (notification) => {
    const notificationType = notification.notificationType || notification.type;
    
    switch (notificationType) {
      case 'PRE_SESSION_REMINDER': return '🔔';
      case 'SESSION_AUTO_COMPLETED': return '✅';
      case 'STARTED':
      case 'LIVE':
      case 'IN_PROGRESS': return '🔴';
      case 'ACCEPTED': return '✓';
      case 'REQUEST': return '📩';
      case 'CANCELLED_BY_MENTOR':
      case 'CANCELLED_BY_LEARNER': return '❌';
      case 'session': return '📅';
      case 'session_request': return '🔔';
      case 'match': return '🎯';
      default: return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.onClick) {
      notification.onClick();
    }
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '●' : '○'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="notification-dropdown"
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="clear-all-btn"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.onClick ? 'clickable' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="remove-notification"
                    >
                      ×
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No notifications yet</p>
                  <small>You'll see session requests and matches here</small>
                </div>
              )}
            </div>

            <div className="notification-footer">
              <small>
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;