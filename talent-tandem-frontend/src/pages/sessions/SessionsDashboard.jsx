import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import FeedbackForm from '../../components/FeedbackForm';

import PreChatButton from '../../components/PreChatButton';
import PreChatModal from '../../components/PreChatModal';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import SessionRequestModal from '../../components/SessionRequestModal';
import AcceptanceModal from '../../components/AcceptanceModal';
import { useNavigate } from 'react-router-dom';
import socket from '../../socket';
import './SessionsDashboard.css';

const SessionsDashboard = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [showPreChat, setShowPreChat] = useState(false);
  const [preChatSessionId, setPreChatSessionId] = useState(null);
  const [preChatStatus, setPreChatStatus] = useState(null);
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);
  const [walletKey, setWalletKey] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [acceptedSession, setAcceptedSession] = useState(null);
  const navigate = useNavigate();

  // Static upcoming sessions data
  const staticUpcomingSessions = [
    {
      sessionId: 'static-1',
      skillName: 'React Advanced Patterns',
      mentorName: 'Sarah Johnson',
      mentorImage: 'https://i.pravatar.cc/150?img=5',
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      status: 'ACCEPTED',
      agenda: 'Deep dive into React hooks, custom hooks, and performance optimization techniques'
    },
    {
      sessionId: 'static-2',
      skillName: 'Python Data Science',
      mentorName: 'Michael Chen',
      mentorImage: 'https://i.pravatar.cc/150?img=12',
      scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 90,
      status: 'ACCEPTED',
      agenda: 'Introduction to Pandas, NumPy, and data visualization with Matplotlib'
    },
    {
      sessionId: 'static-3',
      skillName: 'AWS Cloud Architecture',
      mentorName: 'David Martinez',
      mentorImage: 'https://i.pravatar.cc/150?img=8',
      scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 120,
      status: 'ACCEPTED',
      agenda: 'Building scalable applications with AWS services - EC2, S3, Lambda, and RDS'
    },
    {
      sessionId: 'static-4',
      skillName: 'UI/UX Design Principles',
      mentorName: 'Emily Davis',
      mentorImage: 'https://i.pravatar.cc/150?img=9',
      scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      status: 'ACCEPTED',
      agenda: 'User-centered design, wireframing, prototyping, and usability testing'
    }
  ];

  useEffect(() => {
    if (user?.id) {
      loadUserSessions();
    }
  }, [user]);





  const loadUserSessions = async () => {
    try {
      setIsLoading(true);
      const userSessions = await ApiService.getUserSessions(user.id);
      console.log('User sessions:', userSessions);
      setSessions(userSessions);
      
      // Check feedback status for completed sessions
      const feedbackStatus = {};
      for (const session of userSessions) {
        if (session.status === 'COMPLETED' && user.id === session.learnerId) {
          const feedback = await ApiService.getFeedbackBySession(session.sessionId);
          feedbackStatus[session.sessionId] = !!feedback;
        }
      }
      setFeedbackSubmitted(feedbackStatus);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      const response = await ApiService.updateSessionStatus(sessionId, status);
      await loadUserSessions();
      
      if (status === 'ACCEPTED') {
        setSuccessMessage('✅ Session request accepted!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Notify learner via WebSocket
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session && socket.connected) {
          socket.publish({
            destination: `/queue/user/${session.learnerId}/sessions`,
            body: JSON.stringify({
              notificationType: 'ACCEPTED',
              sessionId: sessionId,
              mentorName: session.mentorName,
              skillName: session.skillName
            })
          });
        }
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      setError('Failed to update session status');
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    try {
      await updateSessionStatus(selectedRequest.sessionId, 'ACCEPTED');
      setShowRequestModal(false);
      setSuccessMessage('Session request accepted!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSelectedRequest(null);
    } catch (error) {
      setError('Failed to accept request');
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;
    try {
      await updateSessionStatus(selectedRequest.sessionId, 'CANCELLED');
      setShowRequestModal(false);
      setSelectedRequest(null);
    } catch (error) {
      setError('Failed to decline request');
    }
  };

  const openRequestModal = (session) => {
    setSelectedRequest(session);
    setShowRequestModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'REQUESTED': 'status-requested',
      'ACCEPTED': 'status-accepted',
      'LIVE': 'status-live',
      'IN_PROGRESS': 'status-progress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return colors[status] || colors['REQUESTED'];
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const allSessions = [...sessions, ...staticUpcomingSessions];
  
  const filteredSessions = allSessions.filter(session => {
    if (filter === 'ALL') return true;
    return session.status === filter;
  });

  const handleGiveFeedback = (session) => {
    setSelectedSession(session);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const payload = {
        sessionId: selectedSession.sessionId,
        learnerId: user.id,
        mentorId: selectedSession.mentorId,
        ...feedbackData
      };
      
      await ApiService.submitFeedback(payload);
      
      setFeedbackSubmitted(prev => ({
        ...prev,
        [selectedSession.sessionId]: true
      }));
      
      setShowFeedbackForm(false);
      setSelectedSession(null);
      setSuccessMessage('Feedback submitted successfully!');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
      await loadUserSessions();
    } catch (error) {
      throw new Error(error.message || 'Failed to submit feedback');
    }
  };



  const handleOpenPreChat = (sessionRequestId, status) => {
    setPreChatSessionId(sessionRequestId);
    setPreChatStatus(status);
    setShowPreChat(true);
  };

  const handleStartSession = async (sessionId) => {
    try {
      await ApiService.startSession(sessionId);
      setSuccessMessage('▶️ Session started successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadUserSessions();
      
      // Notify learner via WebSocket
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session && socket.connected) {
        socket.publish({
          destination: `/queue/user/${session.learnerId}/sessions`,
          body: JSON.stringify({
            notificationType: 'IN_PROGRESS',
            sessionId: sessionId,
            mentorName: session.mentorName,
            skillName: session.skillName
          })
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to start session');
    }
  };

  const handleCompleteSession = async (sessionId, learnerId) => {
    try {
      const response = await ApiService.completeSession(sessionId);
      setWalletKey(prev => prev + 1);
      
      if (user.id === learnerId) {
        setSuccessMessage('✅ Session completed! Please provide feedback');
        const completedSession = sessions.find(s => s.sessionId === sessionId);
        if (completedSession) {
          setSelectedSession(completedSession);
          setShowFeedbackForm(true);
        }
      } else {
        setSuccessMessage('✅ Session ended! You earned 10 coins');
        
        // Notify learner via WebSocket
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session && socket.connected) {
          socket.publish({
            destination: `/queue/user/${learnerId}/sessions`,
            body: JSON.stringify({
              notificationType: 'COMPLETED',
              sessionId: sessionId,
              mentorName: session.mentorName,
              message: 'Session completed! Please provide feedback'
            })
          });
        }
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
      await loadUserSessions();

      if (response.learnerCoins === 0 && user.id === learnerId) {
        setShowZeroCoinsModal(true);
      }
    } catch (error) {
      setError(error.message || 'Failed to complete session');
    }
  };

  const statusOptions = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  if (isLoading) {
    return (
      <div className="sessions-dashboard">
        <div className="container">
          <div className="loading-state">Loading your sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-dashboard">
      <div className="container">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <button
            onClick={() => navigate('/learner/dashboard')}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">My Sessions</h1>
          <p className="page-subtitle">Manage your learning sessions</p>
        </motion.div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="filter-tabs"
        >
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sessions-section"
        >
          {filteredSessions.length > 0 ? (
            <div className="sessions-grid">
              {filteredSessions.map((session) => {
                console.log('Rendering session:', {
                  sessionId: session.sessionId,
                  status: session.status,
                  mentorId: session.mentorId,
                  learnerId: session.learnerId,
                  currentUserId: user?.id,
                  isMentor: user?.id === session.mentorId
                });
                return (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="session-card"
                >
                  <div className="session-header">
                    <div className="mentor-profile-section">
                      <div className="mentor-avatar-large">
                        {session.mentorImage ? (
                          <img src={session.mentorImage} alt={session.mentorName} />
                        ) : (
                          <div className="avatar-placeholder-large">
                            {(session.mentorName || 'M').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="session-info">
                        <h3>{session.skillName}</h3>
                        <p className="mentor-name-text">
                          {user.id === session.mentorId ? 
                            `with ${session.learnerName}` : 
                            `with ${session.mentorName}`
                          }
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusColor(session.status)} ${(session.status === 'LIVE' || session.status === 'IN_PROGRESS') ? 'pulse-animation' : ''}`}>
                      {session.status === 'LIVE' ? '🔴 LIVE' : session.status === 'IN_PROGRESS' ? '▶️ IN PROGRESS' : session.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="session-details">
                    <div className="session-time">
                      📅 {formatDateTime(session.scheduledTime)}
                    </div>
                    <div className="session-duration">
                      ⏱️ {session.durationMinutes} minutes
                    </div>
                  </div>

                  <div className="session-agenda">
                    <h4>Agenda:</h4>
                    <p>{session.agenda}</p>
                  </div>

                  <div className="session-actions">
                    {session.status === 'REQUESTED' && user.id === session.mentorId && (
                      <>
                        <button 
                          onClick={() => updateSessionStatus(session.sessionId, 'ACCEPTED')}
                          className="btn btn-primary"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateSessionStatus(session.sessionId, 'CANCELLED')}
                          className="btn btn-danger"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    
                    {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && (
                      <PreChatButton 
                        sessionRequestId={session.sessionId}
                        requestStatus={session.status === 'REQUESTED' ? 'PENDING' : 'ACCEPTED'}
                        onOpenChat={(id) => handleOpenPreChat(id, session.status)}
                      />
                    )}
                    
                    {session.status === 'ACCEPTED' && user?.id === session.mentorId && (
                      <button 
                        onClick={() => handleStartSession(session.sessionId)}
                        className="btn btn-primary"
                      >
                        ▶️ Start Session
                      </button>
                    )}
                    
                    {(session.status === 'IN_PROGRESS' || session.status === 'LIVE') && user?.id === session.mentorId && (
                      <button 
                        onClick={() => handleCompleteSession(session.sessionId, session.learnerId)}
                        className="btn btn-danger"
                      >
                        ⏹️ End Session
                      </button>
                    )}
                    
                    {(session.status === 'IN_PROGRESS' || session.status === 'LIVE') && user?.id === session.learnerId && (
                      <div className="session-live-indicator">
                        🔴 Session in progress
                      </div>
                    )}
                    
                    {session.status === 'COMPLETED' && user.id === session.learnerId && (
                      feedbackSubmitted[session.sessionId] ? (
                        <button className="btn btn-disabled" disabled>
                          ✓ Feedback Submitted
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleGiveFeedback(session)}
                          className="btn btn-feedback"
                        >
                          Give Feedback
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )})}
            </div>
          ) : (
            <div className="empty-state">
              <p>No sessions found.</p>
            </div>
          )}
        </motion.div>
      </div>

      {showFeedbackForm && selectedSession && (
        <FeedbackForm
          session={selectedSession}
          onClose={() => {
            setShowFeedbackForm(false);
            setSelectedSession(null);
          }}
          onSuccess={handleFeedbackSubmit}
        />
      )}



      {showPreChat && (
        <PreChatModal
          sessionRequestId={preChatSessionId}
          requestStatus={preChatStatus === 'REQUESTED' ? 'PENDING' : 'ACCEPTED'}
          onClose={() => {
            setShowPreChat(false);
            setPreChatSessionId(null);
            setPreChatStatus(null);
          }}
        />
      )}

      <ZeroCoinsModal
        isOpen={showZeroCoinsModal}
        onClose={() => setShowZeroCoinsModal(false)}
        onBecomeTeacher={() => navigate('/mentor/setup')}
      />

      {showRequestModal && selectedRequest && (
        <SessionRequestModal
          session={selectedRequest}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      <AcceptanceModal
        isOpen={showAcceptanceModal}
        mentorName={acceptedSession?.mentorName}
        onClose={() => {
          setShowAcceptanceModal(false);
          setAcceptedSession(null);
        }}
        onOpenChat={() => {
          setShowAcceptanceModal(false);
          handleOpenPreChat(acceptedSession.sessionId, 'ACCEPTED');
        }}
      />
    </div>
  );
};

export default SessionsDashboard;