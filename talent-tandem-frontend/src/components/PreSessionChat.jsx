import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../services/api';
import WebSocketService from '../services/websocket';
import { useUser } from '../context/UserContext';
import './PreSessionChat.css';

const PreSessionChat = ({ session, onClose, onStartSession }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [canStartSession, setCanStartSession] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadChatMessages();
    subscribeToChat();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanStartSession(true);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      WebSocketService.unsubscribe(`session-${session.sessionId}`);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatMessages = async () => {
    try {
      setIsLoading(true);
      const chatMessages = await ApiService.getChatMessages(session.sessionId);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setMessages([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChat = () => {
    try {
      if (WebSocketService.connected) {
        WebSocketService.subscribeToSession(session.sessionId, (message) => {
          setMessages(prev => [...prev, message]);
        });
      }
    } catch (error) {
      console.error('WebSocket subscription error:', error);
      // Continue without WebSocket - polling can be added later
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sessionId: session.sessionId,
      senderId: user.id,
      content: newMessage.trim(),
      type: 'TEXT'
    };

    try {
      // Save to database via API
      const savedMessage = await ApiService.sendChatMessage(messageData);
      
      // Add to local state immediately
      setMessages(prev => [...prev, savedMessage]);

      // Try to send via WebSocket (optional)
      try {
        if (WebSocketService.connected) {
          WebSocketService.sendChatMessage(session.sessionId, {
            ...messageData,
            senderName: user.firstName || user.username
          });
        }
      } catch (wsError) {
        console.log('WebSocket send failed, message saved to DB');
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMentor = user.id === session.mentorId;
  const otherPersonName = isMentor ? session.learnerName : session.mentorName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="chat-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="chat-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-header">
          <div className="chat-info">
            <h3>Pre-Session Chat</h3>
            <p>{session.skillName} with {otherPersonName}</p>
            {!canStartSession && (
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                ⏱️ Time remaining: {formatTimerTime(timeRemaining)}
              </small>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {isLoading ? (
            <div className="loading-messages">Loading messages...</div>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-time">{formatMessageTime(msg.sentAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <p>👋 Start the conversation!</p>
              <small>Discuss session goals and expectations</small>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>

        <div className="chat-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Close Chat
          </button>
          {isMentor && canStartSession && (
            <button onClick={onStartSession} className="btn btn-primary">
              Start Session →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PreSessionChat;
