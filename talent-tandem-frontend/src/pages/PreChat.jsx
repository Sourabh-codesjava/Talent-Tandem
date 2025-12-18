import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import socket from '../socket';

const PreChat = () => {
  const { sessionId } = useParams();
  const { user } = useUser();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!sessionId || !user?.id) return;

    // ✅ WebSocket Connect & Subscribe to COMMON SESSION ROOM
    socket.onConnect = () => {
      console.log("✅ Connected to chat for session:", sessionId);

      socket.subscribe(`/topic/chat/${sessionId}`, (msg) => {
        const data = JSON.parse(msg.body);
        setMessages(prev => [...prev, data]);
      });
    };

    if (!socket.active) {
      socket.activate();
    }

    // ✅ CLEANUP (important for avoiding duplicate messages)
    return () => {
      socket.deactivate();
    };

  }, [sessionId, user?.id]);

  // ✅ SEND MESSAGE to BACKEND CHAT ENDPOINT
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.publish({
      destination: `/app/chat/${sessionId}`,   // ✅ Backend @MessageMapping("/chat/{sessionId}")
      body: JSON.stringify({
        sessionId: sessionId,
        senderId: user.id,
        senderName: user.username,
        message: message,
        timestamp: new Date().toISOString()
      })
    });

    setMessage('');
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat - Session {sessionId}</h2>

      <div
        style={{
          height: 300,
          border: "1px solid #ccc",
          overflowY: "auto",
          marginBottom: 10,
          padding: 10
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <b>{m.senderName || m.senderId}:</b> {m.message}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type message..."
        style={{ width: "75%", marginRight: 8 }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default PreChat;
