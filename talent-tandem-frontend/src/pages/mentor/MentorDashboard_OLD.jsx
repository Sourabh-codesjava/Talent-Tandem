import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import SessionRequestModal from '../../components/SessionRequestModal';
import WalletBalance from '../../components/WalletBalance';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import PreChatModal from '../../components/PreChatModal';

import './MentorDashboard.css';
import socket from '../../socket';

const MentorDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [walletKey, setWalletKey] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [teachSkills, setTeachSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [confidenceScore, setConfidenceScore] = useState(5);
  const [preferredMode, setPreferredMode] = useState('ONE_TO_ONE');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);
  const [showPreChat, setShowPreChat] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedMentorName, setSelectedMentorName] = useState(null);
  const [selectedLearnerName, setSelectedLearnerName] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    loadDashboardData();

    // WebSocket subscription for new session requests
    if (!socket.active) {
      socket.activate();
    }

    const sessionSub = socket.subscribe(
      `/queue/user/${user.id}/sessions`,
      (message) => {
        console.log("🔔 New session request received", message);
        loadDashboardData();
      }
    );

    return () => {
      console.log("❌ WebSocket Cleanup for Mentor");
      sessionSub?.unsubscribe();
    };
  }, [user?.id, sessions]);

  const loadDashboardData = async () => {
    try {
      // Load cached data immediately
      const cacheKey = `mentorDashboard_${user.id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { sessions: cachedSessions, teachSkills: cachedSkills } = JSON.parse(cached);
        setSessions(cachedSessions);
        setTeachSkills(cachedSkills);
        setIsLoading(false);
      }

      // Fetch fresh data in background
      const [userSessions, userSkills, allSkills] = await Promise.all([
        ApiService.getUserSessions(user.id),
        ApiService.getTeachSkillsByUser(user.id),
        ApiService.getAllSkills()
      ]);
      
      setSessions(userSessions);
      setTeachSkills(userSkills);
      setAvailableSkills(allSkills);
      
      // Cache the fresh data
      localStorage.setItem(cacheKey, JSON.stringify({
        sessions: userSessions,
        teachSkills: userSkills,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill || !user?.id) return;

    try {
      const selectedSkillObj = availableSkills.find(s => (s.name || s.skillName) === selectedSkill);
      if (!selectedSkillObj) throw new Error('Selected skill not found');

      const teachSkillData = {
        userId: user.id,
        skillId: selectedSkillObj.id,
        proficiencyLevel: proficiency,
        confidenceScore: parseInt(confidenceScore),
        preferredMode: preferredMode,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00'
      };

      await ApiService.addTeachSkill(teachSkillData);
      await loadDashboardData();
      setShowAddModal(false);
      setSelectedSkill('');
      setProficiency('INTERMEDIATE');
      setConfidenceScore(5);
      setPreferredMode('ONE_TO_ONE');
      setNotification({ show: true, message: 'Teaching skill added successfully!', type: 'success' });
    } catch (error) {
      setNotification({ show: true, message: error.message || 'Failed to add teaching skill', type: 'error' });
    }
  };

  const getPendingRequests = () => {
    return sessions.filter(session => 
      session.status === 'REQUESTED' && session.mentorId === user.id
    );
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => 
      new Date(session.scheduledTime) > now && 
      session.status === 'ACCEPTED' &&
      session.mentorId === user.id
    );
  };

  const getSessionStats = () => {
    const mentorSessions = sessions.filter(s => s.mentorId === user.id);
    const total = mentorSessions.length;
    const completed = mentorSessions.filter(s => s.status === 'COMPLETED').length;
    const pending = getPendingRequests().length;
    const totalHours = mentorSessions
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + (s.durationMinutes / 60), 0);

    return { total, completed, pending, totalHours };
  };

  const updateSessionStatus = async (sessionId, status, learnerId) => {
    try {
      await ApiService.updateSessionStatus(sessionId, status);

      if (status === 'COMPLETED') {
        setWalletKey(prev => prev + 1);
        setNotification({ show: true, message: 'Session completed! You earned 10 coins 🎉', type: 'success' });
      }

      socket.publish({
        destination: "/queue/user/" + learnerId + "/sessions",
        body: JSON.stringify({
          sessionId,
          status
        })
      });

      await loadDashboardData();
    } catch (error) {
      setError('Failed to update session status');
    }
  };

  const handleCompleteSession = async (sessionId, learnerId) => {
    try {
      const response = await ApiService.completeSession(sessionId);
      
      // Refresh wallet from database
      setWalletKey(prev => prev + 1);
      
      setNotification({ 
        show: true, 
        message: 'Session completed successfully. Coins updated.', 
        type: 'success' 
      });

      // Check if learner has 0 coins
      if (response.learnerCoins === 0) {
        setShowZeroCoinsModal(true);
      }

      await loadDashboardData();
    } catch (error) {
      setNotification({ 
        show: true, 
        message: error.message || 'Failed to complete session', 
        type: 'error' 
      });
    }
  };

  const handleStartSession = (sessionId, receiverId, mentorName, learnerName) => {
    setSelectedSessionId(sessionId);
    setSelectedReceiverId(receiverId);
    setSelectedMentorName(mentorName);
    setSelectedLearnerName(learnerName);
    setShowPreChat(true);
  };

  const openRequestModal = (session) => {
    setSelectedRequest(session);
    setShowRequestModal(true);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    try {
      await updateSessionStatus(selectedRequest.sessionId, 'ACCEPTED', selectedRequest.learnerId);
      setShowRequestModal(false);
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

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = getSessionStats();
  const pendingRequests = getPendingRequests();
  const upcomingSessions = getUpcomingSessions();

  if (isLoading) {
    return (
      <div className="mentor-dashboard">
        <div className="container">
          <div className="loading-state">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-dashboard">
      {/* Modern Navbar */}
      <nav className="modern-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-logo">🎓</span>
            <span className="brand-text">Talent Tandem</span>
          </div>
          <div className="navbar-menu">
            <button onClick={() => navigate('/mentor/dashboard')} className="nav-item active">
              🏠 Dashboard
            </button>
            <button onClick={() => navigate('/sessions')} className="nav-item">
              📋 My Sessions
            </button>
            <button onClick={() => navigate('/sessions')} className="nav-item">
              🔔 Notifications
              {pendingRequests.length > 0 && (
                <span className="nav-badge">{pendingRequests.length}</span>
              )}
            </button>
            <button onClick={() => navigate(`/profile/${user?.id}`)} className="nav-item">
              👤 Profile
            </button>
            <WalletBalance key={walletKey} userId={user?.id} />
          </div>
        </div>
      </nav>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <h1>Welcome, Mentor {user?.firstName || user?.username}!</h1>
          <p>Manage your teaching sessions and help learners grow</p>
        </motion.div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stats-grid"
        >
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{teachSkills.length}</div>
              <div className="stat-label">Teaching Skills</div>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Sessions Taught</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{Math.round(stats.totalHours)}</div>
              <div className="stat-label">Hours Taught</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="quick-actions"
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button 
              onClick={() => setShowAddModal(true)}
              className="action-card"
            >
              <div className="action-icon">➕</div>
              <div className="action-content">
                <h3>Add Teaching Skill</h3>
                <p>Quick add a new skill to teach</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/mentor/setup')}
              className="action-card"
            >
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <h3>Manage Skills</h3>
                <p>View and update your teaching expertise</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/sessions')}
              className="action-card"
            >
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h3>View All Sessions</h3>
                <p>Manage your session history</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/mentor/availability')}
              className="action-card"
            >
              <div className="action-icon">📅</div>
              <div className="action-content">
                <h3>Update Availability</h3>
                <p>Set your teaching schedule</p>
              </div>
            </button>
            
            {user?.hasLearnerProfile && (
              <button 
                onClick={() => navigate('/learner/dashboard')}
                className="action-card switch-role"
              >
                <div className="action-icon">🔄</div>
                <div className="action-content">
                  <h3>Switch to Learner</h3>
                  <p>View your learning dashboard</p>
                </div>
              </button>
            )}
          </div>
        </motion.div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-section urgent"
          >
            <h2>🔔 Pending Session Requests</h2>
            <div className="requests-list">
              {pendingRequests.map(session => (
                <div key={session.sessionId} className="request-item">
                  <div className="request-info">
                    <h3>{session.skillName}</h3>
                    <p>Request from {session.learnerName}</p>
                    <div className="session-time">
                      📅 {formatDateTime(session.scheduledTime)}
                    </div>
                    <div className="session-agenda">
                      <strong>Agenda:</strong> {session.agenda}
                    </div>
                  </div>
                  <div className="request-actions">
                    <button 
  onClick={() => updateSessionStatus(session.sessionId, 'ACCEPTED', session.learnerId)}
  className="btn btn-success"
>
  Accept
</button>

                    <button 
                      onClick={() => updateSessionStatus(session.sessionId, 'CANCELLED')}
                      className="btn btn-danger"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dashboard-section"
          >
            <h2>Upcoming Sessions</h2>
            <div className="sessions-list">
              {upcomingSessions.map(session => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-info">
                    <h3>{session.skillName}</h3>
                    <p>with {session.learnerName}</p>
                    <div className="session-time">
                      📅 {formatDateTime(session.scheduledTime)}
                    </div>
                  </div>
                  <div className="session-actions">
                    <button 
                      onClick={() => handleStartSession(
                        session.sessionId, 
                        session.learnerId, 
                        session.mentorName, 
                        session.learnerName
                      )}
                      className="btn btn-primary"
                      style={{ fontSize: '14px', padding: '8px 16px', marginRight: '8px' }}
                    >
                      💬 Open Pre-Chat
                    </button>
                    <button 
                      onClick={() => handleCompleteSession(session.sessionId, session.learnerId)}
                      className="btn btn-success"
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      ✅ Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Teaching Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="dashboard-section"
        >
          <h2>Your Teaching Skills</h2>
          {teachSkills.length > 0 ? (
            <div className="skills-grid">
              {teachSkills.map(skill => (
                <div key={skill.teachId} className="skill-item">
                  <h3>{skill.skillName}</h3>
                  <div className="skill-details">
                    <span className="proficiency-badge">
                      {skill.proficiencyLevel}
                    </span>
                    <span className="confidence-badge">
                      {skill.confidenceScore}/10
                    </span>
                    <span className="mode-badge">
                      {skill.preferredMode.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No teaching skills yet</p>
              <button 
                onClick={() => navigate('/mentor/setup')}
                className="btn btn-primary"
              >
                Add Teaching Skills
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Teaching Skill">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Select Skill *</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            >
              <option value="">Choose a skill to teach</option>
              {availableSkills.map(skill => (
                <option key={skill.id} value={skill.name || skill.skillName}>
                  {skill.name || skill.skillName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Proficiency Level *</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCE">Advanced</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Confidence Score (1-10) *</label>
            <input
              type="number"
              min="1"
              max="10"
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Preferred Mode *</label>
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            >
              <option value="ONE_TO_ONE">One-to-One</option>
              <option value="GROUP">Group Sessions</option>
              <option value="LONG_FORM_MENTORSHIP">Long Form Mentorship</option>
            </select>
          </div>

          <button
            onClick={handleAddSkill}
            disabled={!selectedSkill}
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
          >
            Add Teaching Skill
          </button>
        </div>
      </Modal>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <ZeroCoinsModal
        isOpen={showZeroCoinsModal}
        onClose={() => setShowZeroCoinsModal(false)}
        onBecomeTeacher={() => navigate('/mentor/setup')}
      />

      {showPreChat && selectedSessionId && selectedReceiverId && (
        <PreChatModal
          sessionRequestId={selectedSessionId}
          receiverId={selectedReceiverId}
          mentorName={selectedMentorName}
          learnerName={selectedLearnerName}
          requestStatus="ACCEPTED"
          onClose={() => {
            setShowPreChat(false);
            setSelectedSessionId(null);
            setSelectedReceiverId(null);
            setSelectedMentorName(null);
            setSelectedLearnerName(null);
          }}
        />
      )}

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
    </div>
  );
};

export default MentorDashboard;