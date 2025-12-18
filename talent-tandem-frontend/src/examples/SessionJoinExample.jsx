import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import ZeroCoinsModal from '../components/ZeroCoinsModal';
import { useWallet } from '../hooks/useWallet';

function SessionJoinExample({ session }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { refreshWallet } = useWallet(user?.id);
  const [showForceTeacherModal, setShowForceTeacherModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSession = async () => {
    setIsJoining(true);
    try {
      const response = await ApiService.joinSession(session.sessionId);
      
      refreshWallet();
      
      if (response.forceBecomeTeacher) {
        setShowForceTeacherModal(true);
      } else {
        alert(`Session joined! 10 coins deducted. Your balance: ${response.learnerCoins} coins`);
      }
    } catch (error) {
      if (error.message.includes('Insufficient coins')) {
        setShowForceTeacherModal(true);
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleJoinSession}
        disabled={isJoining}
      >
        {isJoining ? 'Joining...' : 'Join Session'}
      </button>

      <ZeroCoinsModal 
        isOpen={showForceTeacherModal}
        onClose={() => setShowForceTeacherModal(false)}
        onBecomeTeacher={() => navigate('/mentor/setup')}
      />
    </div>
  );
}

export default SessionJoinExample;
