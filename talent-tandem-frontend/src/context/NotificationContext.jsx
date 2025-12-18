import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import WebSocketService from '../services/websocket';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectWebSocket();
      requestNotificationPermission();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user?.id]);



  const connectWebSocket = async () => {
    try {
      await WebSocketService.connect(user.id);
      setIsConnected(true);
      console.log('WebSocket connected for user:', user.id);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    WebSocketService.disconnect();
    setIsConnected(false);
  };

  const requestNotificationPermission = () => {
    WebSocketService.requestNotificationPermission();
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    connectWebSocket,
    disconnectWebSocket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};