import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import { useUser } from '../context/UserContext';
import './PreChatModal.css';

const PreChatModal = ({ sessionRequestId, requestStatus, onClose, receiverId, mentorName, learnerName, currentUserRole }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Simulate receiving typing indicator from other user
  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  // Handle typing detection
  const handleTypingStart = () => {
    // In real implementation, send WebSocket message to other user
    console.log('User started typing');
    // socket.send({ type: 'typing', sessionId, userId: user.id });
  };

  const handleTypingStop = () => {
    // In real implementation, send WebSocket message to other user
    console.log('User stopped typing');
    // socket.send({ type: 'stop_typing', sessionId, userId: user.id });
  };

  useEffect(() => {
    loadMessages();
  }, [sessionRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!sessionRequestId) return;
    
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionRequestId]);

  const loadMessages = async () => {
    try {
      const data = await ApiService.getPreChatMessages(sessionRequestId);
      setMessages(data || []);
      
      // Load session details to get participant info
      const session = await ApiService.getSession(sessionRequestId);
      
      const participantsMap = {
        [session.mentorId]: { name: session.mentorName, role: 'Mentor', mentorId: session.mentorId },
        [session.learnerId]: { name: session.learnerName, role: 'Learner', learnerId: session.learnerId }
      };
      
      setParticipants(participantsMap);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || requestStatus !== 'ACCEPTED') return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Optimistic UI update
    const tempMessage = {
      senderId: user.id,
      message: messageText,
      sentAt: new Date().toISOString(),
      temp: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      console.log('Sending message:', {
        sessionId: sessionRequestId,
        receiverId: receiverId,
        senderId: user.id,
        message: messageText
      });
      
      await ApiService.sendPreChatMessage({
        sessionId: sessionRequestId,
        receiverId: receiverId,
        message: messageText,
      });
      // Refresh messages immediately after sending
      setTimeout(() => loadMessages(), 500);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => !m.temp));
      setNewMessage(messageText);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Typing indicator logic
    if (e.target.value.trim()) {
      handleTypingStart();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 2000);
    } else {
      handleTypingStop();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
      handleTypingStop();
    }
  };

  const isDisabled = requestStatus !== 'ACCEPTED';

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <div className="chat-icon">💬</div>
            <div className="chat-title-text">
              <h3>Pre-Session Chat</h3>
              <p>
                {isTyping ? (
                  <span style={{ color: '#10b981', fontStyle: 'italic' }}>typing...</span>
                ) : (
                  <>
                    <span className={`online-indicator ${onlineStatus ? 'online' : 'offline'}`}></span>
                    {onlineStatus ? 'Active now' : 'Offline'}
                  </>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="chat-close-btn">×</button>
        </div>

        <div className="chat-messages-area">
          {loading ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">⏳</div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💭</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSent = msg.senderId === user.id;
              const sender = {
                name: msg.senderName || participants[msg.senderId]?.name || 'User',
                role: msg.senderRole || participants[msg.senderId]?.role || 'Unknown'
              };
              
              // Debug log for all messages
              console.log(`🔍 Message ${idx}:`, {
                senderId: msg.senderId,
                senderName: msg.senderName,
                senderRole: msg.senderRole,
                isSent: isSent,
                displayRole: sender.role
              });
              
              return (
                <div 
                  key={idx} 
                  className={`chat-message ${isSent ? 'sent' : 'received'}`}
                >
                  <div className={`message-sender ${isSent ? 'sent' : 'received'}`}>
                    {isSent ? 'You' : sender.name}
                    <span className={`role-badge ${(sender.role || '').toLowerCase()}`}>
                      {sender.role}
                    </span>
                  </div>
                  <div className="message-bubble">
                    <p className="message-text">{msg.message}</p>
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(msg.sentAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isSent && (
                        <span className="message-status">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="chat-message received typing-indicator">
              <div className="message-bubble typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={isDisabled ? 'Chat disabled - waiting for approval' : 'Type your message... (Press Enter to send)'}
                disabled={isDisabled}
                className="chat-input"
                autoFocus
                maxLength={500}
              />
              {newMessage.trim() && (
                <div className="char-counter">
                  {newMessage.length}/500
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={!newMessage.trim() || isDisabled}
              className="chat-send-btn"
              title="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreChatModal;
