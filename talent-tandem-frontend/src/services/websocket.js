import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(userId) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      console.log('Attempting WebSocket connection for user:', userId);
      const socket = new SockJS('http://localhost:8080/ws');
      
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log('STOMP Debug:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('WebSocket Connected:', frame);
        this.connected = true;
        
        // Subscribe to user-specific notifications
        this.subscribeToUserNotifications(userId);
        
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('WebSocket Error:', frame);
        this.connected = false;
        reject(new Error('WebSocket connection failed'));
      };

      this.client.onDisconnect = () => {
        console.log('WebSocket Disconnected');
        this.connected = false;
        this.subscriptions.clear();
      };

      this.client.activate();
    });
  }

  subscribeToUserNotifications(userId) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    // Subscribe to session booking notifications (for mentors)
    const sessionSub = this.client.subscribe(
      `/queue/user/${userId}/sessions`,
      (message) => {
        const notification = JSON.parse(message.body);
        console.log('Session notification received:', notification);
        this.handleSessionNotification(notification);
      }
    );

    // Subscribe to match notifications (for learners)
    const matchSub = this.client.subscribe(
      `/queue/user/${userId}/matches`,
      (message) => {
        const notification = JSON.parse(message.body);
        console.log('Match notification received:', notification);
        this.handleMatchNotification(notification);
      }
    );

    this.subscriptions.set('sessions', sessionSub);
    this.subscriptions.set('matches', matchSub);
  }

  subscribeToSession(sessionId, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(
      `/topic/session/${sessionId}`,
      (message) => {
        const chatMessage = JSON.parse(message.body);
        callback(chatMessage);
      }
    );

    this.subscriptions.set(`session-${sessionId}`, subscription);
    return subscription;
  }

  subscribeToSessionStatus(sessionId, callback) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(
      `/topic/session/${sessionId}/status`,
      (message) => {
        const statusUpdate = JSON.parse(message.body);
        callback(statusUpdate);
      }
    );

    this.subscriptions.set(`session-status-${sessionId}`, subscription);
    return subscription;
  }

  sendChatMessage(sessionId, message) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: '/app/session.sendMessage',
      body: JSON.stringify({
        sessionId: sessionId,
        content: message.content,
        senderId: message.senderId,
        senderName: message.senderName
      })
    });
  }

  notifySessionBooked(sessionData) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected - cannot send notification');
      return;
    }

    console.log('Sending session notification via WebSocket:', sessionData);
    this.client.publish({
      destination: '/app/session.book',
      body: JSON.stringify(sessionData)
    });
    console.log('Session notification sent successfully');
  }

  handleSessionNotification(notification) {
    const notificationType = notification.notificationType || notification.type;
    let toastMessage = '';
    
    switch(notificationType) {
      case 'REQUEST':
        toastMessage = `📩 New session request from ${notification.learnerName} for ${notification.skillName}`;
        break;
      case 'ACCEPTED':
        toastMessage = `✅ ${notification.mentorName} accepted your session request!`;
        break;
      case 'STARTED':
      case 'LIVE':
      case 'IN_PROGRESS':
        toastMessage = `🔴 Your session with ${notification.mentorName || notification.learnerName} is now live!`;
        break;
      case 'COMPLETED':
        toastMessage = notification.message || 'Session completed successfully';
        break;
      case 'CANCELLED_BY_MENTOR':
      case 'CANCELLED_BY_LEARNER':
        toastMessage = `❌ Session cancelled`;
        break;
      case 'PRE_SESSION_REMINDER':
        toastMessage = `⏰ Your session starts in 10 minutes!`;
        break;
      default:
        toastMessage = notification.message || 'Session update received';
    }
    
    window.dispatchEvent(new CustomEvent('sessionNotification', {
      detail: { ...notification, toastMessage, notificationType }
    }));
  }

  handleMatchNotification(notification) {
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('matchNotification', {
      detail: notification
    }));
  }

  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  disconnect() {
    if (this.client && this.connected) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission);
      });
    }
  }
}

export default new WebSocketService();