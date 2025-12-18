import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import NotificationCenter from '../../components/NotificationCenter';
import SessionRequestModal from '../../components/SessionRequestModal';
import WalletBalance from '../../components/WalletBalance';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import PreChatModal from '../../components/PreChatModal';
import RoleToggle from '../../components/RoleToggle';

import '../AdminDashboard.css';
import './MentorDashboard.css';
import socket from '../../socket';

const MentorDashboard = () => {
  const { user, logout } = useUser();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('mentorActiveTab') || 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [walletKey, setWalletKey] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [teachSkills, setTeachSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
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
  const [topMentors, setTopMentors] = useState([]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'skills', label: 'My Skills', icon: '🎯' },
    { id: 'requests', label: 'Requests', icon: '🔔' },
    { id: 'sessions', label: 'Sessions', icon: '📅' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('mentorActiveTab', tabId);
  };

  useEffect(() => {
    if (!user?.id) return;

    loadDashboardData();

    let sessionSub = null;

    const setupWebSocket = () => {
      console.log('🔌 Setting up WebSocket for Mentor:', user.id);
      
      sessionSub = socket.subscribe(
        `/queue/user/${user.id}/sessions`,
        (message) => {
          console.log('📨 Mentor received notification:', message);
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              console.log('📦 Notification data:', data);
              
              const notificationType = data.notificationType || data.type;
              
              if (data.message) {
                addNotification({
                  id: Date.now(),
                  title: notificationType === 'REQUESTED' ? 'New Session Request' : 'Session Update',
                  message: data.message,
                  timestamp: new Date(),
                  read: false,
                  notificationType: notificationType,
                  onClick: () => {
                    if (notificationType === 'REQUESTED') {
                      setActiveTab('requests');
                      localStorage.setItem('mentorActiveTab', 'requests');
                    } else {
                      setActiveTab('sessions');
                      localStorage.setItem('mentorActiveTab', 'sessions');
                    }
                  }
                });
              }
              
              if (notificationType === 'SESSION_AUTO_COMPLETED') {
                setWalletKey(prev => prev + 1);
                setTimeout(() => loadDashboardData(), 1000);
              } else {
                loadDashboardData();
              }
            } catch (e) {
              console.error('❌ Error parsing notification:', e);
            }
          }
        }
      );
      
      console.log('✅ WebSocket subscription active for mentor');
    };

    if (socket.connected) {
      setupWebSocket();
    } else {
      socket.onConnect = () => {
        console.log('✅ WebSocket connected for mentor');
        setupWebSocket();
      };
      
      if (!socket.active) {
        console.log('🔄 Activating WebSocket...');
        socket.activate();
      }
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket for mentor');
      if (sessionSub) {
        sessionSub.unsubscribe();
      }
    };
  }, [user?.id]);

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
      const [userSessions, userSkills, allSkills, mentors] = await Promise.all([
        ApiService.getUserSessions(user.id),
        ApiService.getTeachSkillsByUser(user.id),
        ApiService.getAllSkills(),
        ApiService.getTopMentors(5)
      ]);
      
      setSessions(userSessions);
      setTeachSkills(userSkills);
      setAvailableSkills(allSkills);
      setTopMentors(mentors);
      
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

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setProficiency(skill.proficiencyLevel);
    setConfidenceScore(skill.confidenceScore);
    setPreferredMode(skill.preferredMode);
    setShowEditModal(true);
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    const updateData = {
      userId: user.id,
      skillId: editingSkill.skillId,
      proficiencyLevel: proficiency,
      confidenceScore: parseInt(confidenceScore),
      preferredMode: preferredMode,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00'
    };

    try {
      await ApiService.deleteTeachSkill(editingSkill.teachId);
      await ApiService.addTeachSkill(updateData);
      await loadDashboardData();
      setShowEditModal(false);
      setEditingSkill(null);
      setProficiency('INTERMEDIATE');
      setConfidenceScore(5);
      setPreferredMode('ONE_TO_ONE');
      setNotification({ show: true, message: 'Skill updated successfully!', type: 'success' });
    } catch (error) {
      await loadDashboardData();
      setNotification({ show: true, message: error.message || 'Failed to update skill', type: 'error' });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    setTeachSkills(prev => prev.filter(skill => skill.teachId !== skillId));
    setNotification({ show: true, message: 'Teaching skill deleted successfully!', type: 'success' });
    
    try {
      await ApiService.deleteTeachSkill(skillId);
    } catch (error) {
      await loadDashboardData();
      setNotification({ show: true, message: error.message || 'Failed to delete skill', type: 'error' });
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
      (session.status === 'ACCEPTED' || session.status === 'LIVE' || session.status === 'IN_PROGRESS') &&
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
        setNotification({ show: true, message: 'Session ended! You earned 10 coins 🎉', type: 'success' });
      }

      if (status === 'ACCEPTED') {
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session && socket.connected) {
          socket.publish({
            destination: `/queue/user/${learnerId}/sessions`,
            body: JSON.stringify({
              notificationType: 'ACCEPTED',
              sessionId: sessionId,
              mentorName: session.mentorName,
              skillName: session.skillName
            })
          });
        }
      }

      await loadDashboardData();
    } catch (error) {
      setError('Failed to update session status');
    }
  };

  const handleCompleteSession = async (sessionId, learnerId) => {
    try {
      const response = await ApiService.completeSession(sessionId);
      setWalletKey(prev => prev + 1);
      
      setNotification({ 
        show: true, 
        message: 'Session ended! You earned 10 coins', 
        type: 'success' 
      });

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

      await loadDashboardData();
    } catch (error) {
      setNotification({ 
        show: true, 
        message: error.message || 'Failed to complete session', 
        type: 'error' 
      });
    }
  };

  const handleOpenChat = (sessionId, receiverId, mentorName, learnerName) => {
    setSelectedSessionId(sessionId);
    setSelectedReceiverId(receiverId);
    setSelectedMentorName(mentorName);
    setSelectedLearnerName(learnerName);
    setShowPreChat(true);
  };

  const handleStartSession = async (sessionId) => {
    try {
      await ApiService.startSession(sessionId);
      setNotification({ show: true, message: 'Session started successfully!', type: 'success' });
      await loadDashboardData();
      
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
      setNotification({ show: true, message: error.message || 'Failed to start session', type: 'error' });
    }
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = getSessionStats();
  const pendingRequests = getPendingRequests();
  const upcomingSessions = getUpcomingSessions();

  const getSessionStatusData = () => {
    const mentorSessions = sessions.filter(s => s.mentorId === user.id);
    return [
      { status: 'Completed', count: mentorSessions.filter(s => s.status === 'COMPLETED').length },
      { status: 'Accepted', count: mentorSessions.filter(s => s.status === 'ACCEPTED').length },
      { status: 'Requested', count: mentorSessions.filter(s => s.status === 'REQUESTED').length },
      { status: 'Cancelled', count: mentorSessions.filter(s => s.status === 'CANCELLED').length }
    ];
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard mentor-dashboard">
        <div className="loading-state">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard mentor-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            {!sidebarCollapsed && <span className="logo-text">TalentTandem</span>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        {!sidebarCollapsed && (
          <div style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Mentor Panel</h3>
          </div>
        )}

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚺</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
           <h1 style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              Mentor Panel
            </h1>
          </div>
          <div className="top-bar-right">
            <NotificationCenter />
            <WalletBalance key={walletKey} userId={user?.id} onZeroCoins={() => setShowZeroCoinsModal(true)} />
            <button
              onClick={() => navigate('/learner/dashboard')}
              className="icon-btn"
              title="Switch to Learner"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' }}
            >
              🎓
            </button>
            <div className="user-profile-container">
              <div 
                className="user-profile" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'Mentor'}&background=667eea&color=fff`} alt="Mentor" />
                <div className="user-info">
                  <span className="user-name">{user?.firstName || user?.username}</span>
                  <span className="user-role">Mentor</span>
                </div>
                <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
              </div>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'Mentor'}&background=667eea&color=fff`} alt="Mentor" />
                    <div>
                      <p className="dropdown-name">{user?.firstName || user?.username}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item" onClick={() => navigate(`/profile/${user?.id}`)}>
                    <span>👤</span>
                    <span>My Profile</span>
                  </button>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <span>🚺</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="content-area" style={{ marginTop: 0 }}>
          {activeTab === 'overview' && (
            <div className="overview-section">
              {error && <div className="error-message">{error}</div>}

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#667eea20', color: '#667eea' }}>🎯</div>
                  <div className="stat-content">
                    <p className="stat-label">Teaching Skills</p>
                    <h3 className="stat-value">{teachSkills.length}</h3>
                    <span className="stat-trend">Active skills</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>⏳</div>
                  <div className="stat-content">
                    <p className="stat-label">Pending Requests</p>
                    <h3 className="stat-value">{stats.pending}</h3>
                    <span className="stat-trend">Awaiting response</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>✅</div>
                  <div className="stat-content">
                    <p className="stat-label">Sessions Taught</p>
                    <h3 className="stat-value">{stats.completed}</h3>
                    <span className="stat-trend">Total completed</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>⏱️</div>
                  <div className="stat-content">
                    <p className="stat-label">Hours Taught</p>
                    <h3 className="stat-value">{Math.round(stats.totalHours)}</h3>
                    <span className="stat-trend">Total time</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>📊 Session Status Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getSessionStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="status" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #667eea', borderRadius: '10px' }} />
                      <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>🏆 Top Mentors</h3>
                  {topMentors.length > 0 ? (
                    <div style={{ padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {topMentors.map((mentor, index) => (
                        <div key={mentor.userId} style={{
                          padding: '0.75rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea' }}>#{index + 1}</span>
                          <img src={mentor.profilePhoto || `https://ui-avatars.com/api/?name=${mentor.firstName}&background=667eea&color=fff`} 
                               alt={mentor.firstName} 
                               style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{mentor.firstName} {mentor.lastName}</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                              {mentor.completedSessions} sessions • ⭐ {mentor.averageRating.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                      <p>No top mentors yet</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'skills' && (
            <div className="skills-section">
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>🎯 Your Teaching Skills ({teachSkills.length})</h3>
                  <button onClick={() => setShowAddModal(true)} className="action-btn">
                    ➕ Add New Skill
                  </button>
                </div>
                {teachSkills.length > 0 ? (
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Skill Name</th>
                          <th>Proficiency Level</th>
                          <th>Confidence Score</th>
                          <th>Preferred Mode</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachSkills.map(skill => (
                          <tr key={skill.teachId}>
                            <td><strong>📖 {skill.skillName}</strong></td>
                            <td>
                              <span style={{
                                padding: '0.4rem 0.8rem',
                                background: skill.proficiencyLevel === 'BEGINNER' ? '#6b7280' : skill.proficiencyLevel === 'INTERMEDIATE' ? '#3b82f6' : '#10b981',
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {skill.proficiencyLevel}
                              </span>
                            </td>
                            <td><strong>{skill.confidenceScore}/10</strong></td>
                            <td>{skill.preferredMode.replace('_', ' ')}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleEditSkill(skill)}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this skill?')) {
                                      handleDeleteSkill(skill.teachId);
                                    }
                                  }}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Teaching Skills Yet</h3>
                    <p style={{ marginBottom: '1.5rem' }}>Start your mentoring journey by adding your first skill</p>
                    <button onClick={() => setShowAddModal(true)} className="action-btn">
                      ➕ Add Your First Skill
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
              {/* Pending Requests */}
              {pendingRequests.length > 0 ? (
                <div className="chart-card">
                  <h3>🔔 Pending Session Requests ({pendingRequests.length})</h3>
                  <div style={{ marginTop: '1rem' }}>
                    {pendingRequests.map(session => (
                      <div key={session.sessionId} style={{
                        padding: '1rem',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        border: '2px solid #fbbf24'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ marginBottom: '0.25rem' }}>{session.skillName}</h4>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Request from {session.learnerName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 {formatDateTime(session.scheduledTime)}</p>
                            {session.agenda && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}><strong>Agenda:</strong> {session.agenda}</p>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => updateSessionStatus(session.sessionId, 'ACCEPTED', session.learnerId)}
                              className="action-btn"
                              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                              ✅ Accept
                            </button>
                            <button 
                              onClick={() => updateSessionStatus(session.sessionId, 'CANCELLED')}
                              className="action-btn"
                              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                            >
                              ❌ Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chart-card">
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <p>🎉 No pending requests</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="sessions-section">
              {upcomingSessions.length > 0 && (
                <div className="chart-card" style={{ marginBottom: '2rem' }}>
                  <h3>📅 Upcoming Sessions</h3>
                  <div style={{ marginTop: '1rem' }}>
                    {upcomingSessions.map(session => (
                      <div key={session.sessionId} style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h4 style={{ marginBottom: '0.25rem' }}>{session.skillName}</h4>
                          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>with {session.learnerName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 {formatDateTime(session.scheduledTime)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleOpenChat(session.sessionId, session.learnerId, session.mentorName, session.learnerName)}
                            className="action-btn"
                          >
                            💬 Open Chat
                          </button>
                          {session.status === 'ACCEPTED' && (
                            <button 
                              onClick={() => handleStartSession(session.sessionId)}
                              className="action-btn"
                              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                            >
                              ▶️ Start Session
                            </button>
                          )}
                          {(session.status === 'IN_PROGRESS' || session.status === 'LIVE') && (
                            <button 
                              onClick={() => handleCompleteSession(session.sessionId, session.learnerId)}
                              className="action-btn"
                              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                            >
                              ⏹️ End Session
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="chart-card">
                <h3>📊 All Sessions</h3>
                <div className="users-table" style={{ marginTop: '1rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Learner</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.filter(s => s.mentorId === user.id).map(session => (
                        <tr key={session.sessionId}>
                          <td><strong>{session.skillName}</strong></td>
                          <td>{session.learnerName}</td>
                          <td>{formatDateTime(session.scheduledTime)}</td>
                          <td>{session.durationMinutes} min</td>
                          <td>
                            <span className={`status-badge ${session.status === 'COMPLETED' ? 'active' : session.status === 'ACCEPTED' ? 'pending' : 'inactive'}`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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

      <Modal isOpen={showEditModal} onClose={() => {
        setShowEditModal(false);
        setEditingSkill(null);
        setProficiency('INTERMEDIATE');
        setConfidenceScore(5);
        setPreferredMode('ONE_TO_ONE');
      }} title="✏️ Edit Teaching Skill">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Skill Name</label>
            <input
              type="text"
              value={editingSkill?.skillName || ''}
              disabled
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                fontSize: '1rem',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed'
              }}
            />
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
            onClick={handleUpdateSkill}
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
          >
            ✅ Update Skill
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