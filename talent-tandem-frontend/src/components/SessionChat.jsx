import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { getChatStatus, getChatMessage } from '../utils/chatHelper';

const SessionChat = ({ sessionId, sessionTime, userId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatStatus, setChatStatus] = useState(null);
  const apiService = new ApiService();

  useEffect(() => {
    const updateStatus = () => {
      const status = getChatStatus(sessionTime);
      setChatStatus(status);

      // Auto-start session when time reaches
      if (status.isSessionStarted && !sessionStarted) {
        handleSessionStart();
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sessionTime]);

  useEffect(() => {
    if (chatStatus?.isChatEnabled) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [chatStatus?.isChatEnabled]);

  const loadMessages = async () => {
    try {
      const data = await apiService.getChatMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSessionStart = async () => {
    try {
      await apiService.startSession(sessionId);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatStatus?.isChatEnabled) return;

    try {
      await apiService.sendChatMessage(sessionId, {
        message: newMessage,
        senderId: userId,
        receiverId: otherUserId,
        sessionTime
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!chatStatus) return <div>Loading...</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        {getChatMessage(chatStatus)}
        {chatStatus.isPreSession && ' (Pre-session chat)'}
      </div>

      {!chatStatus.isChatEnabled ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Chat will be available 5 minutes before session
        </div>
      ) : (
        <>
          <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '10px', textAlign: msg.senderId === userId ? 'right' : 'left' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '8px 12px', 
                  borderRadius: '12px',
                  backgroundColor: msg.senderId === userId ? '#007bff' : '#e9ecef',
                  color: msg.senderId === userId ? 'white' : 'black'
                }}>
                  {msg.message}
                  {msg.isPreSession && <span style={{ fontSize: '10px', opacity: 0.7 }}> (pre-session)</span>}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '8px 20px', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default SessionChat;
