import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const PreChatButton = ({ sessionRequestId, requestStatus, onOpenChat }) => {
  if (requestStatus === 'PENDING') {
    return (
      <div style={{ padding: '8px', color: '#f59e0b', fontSize: '14px' }}>
        ⏳ Wait for mentor approval
      </div>
    );
  }

  if (requestStatus === 'ACCEPTED') {
    return (
      <button 
        onClick={() => onOpenChat(sessionRequestId)}
        className="btn btn-primary"
        style={{ fontSize: '14px', padding: '8px 16px' }}
      >
        💬 Start Pre-Chat
      </button>
    );
  }

  return null;
};

export default PreChatButton;
