import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaGraduationCap, FaBook, FaCalendarAlt, FaSearch, FaChartBar, FaCheckCircle, FaClock, FaPlus, FaEdit, FaTrash, FaUser, FaDoorOpen, FaCog, FaChartPie, FaComments, FaRocket, FaLightbulb, FaRedo, FaThumbsUp, FaSeedling, FaLeaf, FaTree, FaUsers, FaUserFriends, FaCalendarCheck } from 'react-icons/fa';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import NotificationCenter from '../../components/NotificationCenter';
import WalletBalance from '../../components/WalletBalance';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import PreChatModal from '../../components/PreChatModal';
import RoleToggle from '../../components/RoleToggle';
import SessionBooking from '../../components/SessionBooking';
import MentorProfileModal from '../../components/MentorProfileModal';
import FeedbackForm from '../../components/FeedbackForm';
import '../AdminDashboard.css';
import './LearnerDashboard.css';
import socket from '../../socket';

const LearnerDashboard = () => {
  const { user, logout } = useUser();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('learnerActiveTab') || 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [priority, setPriority] = useState('INTERMEDIATE');
  const [preferredMode, setPreferredMode] = useState('ONE_TO_ONE');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);
  const [walletKey, setWalletKey] = useState(0);
  const [showPreChat, setShowPreChat] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedMentorName, setSelectedMentorName] = useState(null);
  const [selectedLearnerName, setSelectedLearnerName] = useState(null);
  // Find Mentors state
  const [selectedSkillForMentors, setSelectedSkillForMentors] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [isFindingMentors, setIsFindingMentors] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState(null);
  const [feedbackMentorId, setFeedbackMentorId] = useState(null);


  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'skills', label: 'My Skills', icon: <FaBook /> },
    { id: 'sessions', label: 'Sessions', icon: <FaCalendarAlt /> },
    { id: 'mentors', label: 'Find Mentors', icon: <FaSearch /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('learnerActiveTab', tabId);
  };

  useEffect(() => {
    if (!user?.id) return;

    loadDashboardData();

    let sessionSub = null;
    let feedbackSub = null;

    const setupWebSocket = () => {
      console.log('🔌 Setting up WebSocket for Learner:', user.id);
      
      sessionSub = socket.subscribe(
        `/queue/user/${user.id}/sessions`,
        (message) => {
          console.log('📨 Learner received notification:', message);
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              console.log('📦 Notification data:', data);
              
              const notificationType = data.notificationType || data.type;
              
              if (data.message) {
                addNotification({
                  id: Date.now(),
                  title: notificationType === 'ACCEPTED' ? 'Request Accepted' : notificationType === 'CANCELLED' ? 'Request Declined' : 'Session Update',
                  message: data.message,
                  timestamp: new Date(),
                  read: false,
                  notificationType: notificationType,
                  onClick: () => {
                    setActiveTab('sessions');
                    localStorage.setItem('learnerActiveTab', 'sessions');
                  }
                });
              }
              
              if (notificationType === 'SESSION_AUTO_COMPLETED') {
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

      feedbackSub = socket.subscribe(
        `/queue/user/${user.id}/feedback`,
        async (message) => {
          console.log('📨 Learner received feedback notification:', message);
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              if (data.action === 'OPEN_FEEDBACK_FORM') {
                const latestSessions = await ApiService.getUserSessions(user.id);
                const session = latestSessions.find(s => s.sessionId === data.sessionId);
                
                setFeedbackSessionId(data.sessionId);
                setFeedbackMentorId(session?.mentorId || data.mentorId);
                setShowFeedbackForm(true);
                setNotification({ 
                  show: true, 
                  message: 'Session completed! Please provide feedback.', 
                  type: 'info' 
                });
                setSessions(latestSessions);
              }
            } catch (e) {
              console.error('❌ Error parsing feedback notification:', e);
            }
          }
        }
      );
      
      console.log('✅ WebSocket subscriptions active for learner');
    };

    if (socket.connected) {
      setupWebSocket();
    } else {
      socket.onConnect = () => {
        console.log('✅ WebSocket connected for learner');
        setupWebSocket();
      };
      
      if (!socket.active) {
        console.log('🔄 Activating WebSocket...');
        socket.activate();
      }
    }

    return () => {
      console.log('🧹 Cleaning up WebSocket for learner');
      if (sessionSub) {
        sessionSub.unsubscribe();
      }
      if (feedbackSub) {
        feedbackSub.unsubscribe();
      }
    };
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      // Load from cache first
      const cachedSessions = sessionStorage.getItem(`sessions-${user.id}`);
      const cachedSkills = sessionStorage.getItem(`learnSkills-${user.id}`);
      
      if (cachedSessions && cachedSkills) {
        setSessions(JSON.parse(cachedSessions));
        setLearnSkills(JSON.parse(cachedSkills));
        setIsLoading(false);
      }
      
      // Fetch fresh data in background
      const [userSessions, userSkills, allSkills] = await Promise.all([
        ApiService.getUserSessions(user.id),
        ApiService.getLearnSkillsByUser(user.id),
        ApiService.getAllSkills()
      ]);
      
      setSessions(userSessions);
      setLearnSkills(userSkills);
      setAvailableSkills(allSkills);
      
      // Update cache
      sessionStorage.setItem(`sessions-${user.id}`, JSON.stringify(userSessions));
      sessionStorage.setItem(`learnSkills-${user.id}`, JSON.stringify(userSkills));
    } catch (error) {
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

      // Check if skill already exists
      const skillExists = learnSkills.some(skill => skill.skillId === selectedSkillObj.id);
      if (skillExists) {
        setNotification({ show: true, message: 'This skill is already added to your learning goals!', type: 'error' });
        return;
      }

      const learnSkillData = {
        userId: user.id,
        skillId: selectedSkillObj.id,
        priorityLevel: priority,
        preferredMode: preferredMode,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00'
      };

      await ApiService.addLearnSkill(learnSkillData);
      await loadDashboardData();
      setShowAddModal(false);
      setSelectedSkill('');
      setPriority('INTERMEDIATE');
      setPreferredMode('ONE_TO_ONE');
      setNotification({ show: true, message: 'Learning goal added successfully!', type: 'success' });
    } catch (error) {
      setNotification({ show: true, message: error.message || 'Failed to add learning goal', type: 'error' });
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setPriority(skill.priorityLevel);
    setPreferredMode(skill.preferredMode);
    setDayOfWeek(skill.dayOfWeek || 'MONDAY');
    setStartTime(skill.startTime || '09:00');
    setEndTime(skill.endTime || '17:00');
    setShowEditModal(true);
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    const updateData = {
      userId: user.id,
      skillId: editingSkill.skillId,
      priorityLevel: priority,
      preferredMode: preferredMode,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      endTime: endTime
    };

    try {
      await ApiService.deleteLearnSkill(editingSkill.id);
      await ApiService.addLearnSkill(updateData);
      await loadDashboardData();
      setShowEditModal(false);
      setEditingSkill(null);
      setPriority('INTERMEDIATE');
      setPreferredMode('ONE_TO_ONE');
      setDayOfWeek('MONDAY');
      setStartTime('09:00');
      setEndTime('17:00');
      setNotification({ show: true, message: 'Skill updated successfully!', type: 'success' });
    } catch (error) {
      await loadDashboardData();
      setNotification({ show: true, message: error.message || 'Failed to update skill', type: 'error' });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    // Immediately update UI
    setLearnSkills(prev => prev.filter(skill => skill.id !== skillId));
    setNotification({ show: true, message: 'Learning skill deleted successfully!', type: 'success' });
    
    try {
      await ApiService.deleteLearnSkill(skillId);
    } catch (error) {
      // If API fails, reload data to restore correct state
      await loadDashboardData();
      setNotification({ show: true, message: error.message || 'Failed to delete skill', type: 'error' });
    }
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => 
      new Date(session.scheduledTime) > now && 
      (session.status === 'ACCEPTED' || session.status === 'REQUESTED' || session.status === 'LIVE' || session.status === 'IN_PROGRESS')
    );
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    const upcoming = getUpcomingSessions().length;
    const totalHours = sessions
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + (s.durationMinutes / 60), 0);

    return { total, completed, upcoming, totalHours };
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

  const handleBecomeMentor = () => {
    setShowZeroCoinsModal(false);
    navigate('/mentor/setup');
      navigate('/mentor/setup');
  };

  const handleOpenChat = (sessionId, receiverId, mentorName, learnerName) => {
    setSelectedSessionId(sessionId);
    setSelectedReceiverId(receiverId);
    setSelectedMentorName(mentorName);
    setSelectedLearnerName(learnerName);
    setShowPreChat(true);
  };

  const findMentors = async (skill) => {
    setIsFindingMentors(true);
    setSelectedSkillForMentors(skill);
    setMentors([]);

    try {
      const matchRequest = {
        skillId: skill.skillId,
        preferredMode: skill.preferredMode,
        priorityLevel: skill.priorityLevel,
        dayOfWeek: skill.dayOfWeek || 'MONDAY',
        startTime: skill.startTime || '09:00',
        endTime: skill.endTime || '17:00',
        profileImage: user.profilePhoto || ''
      };

      const matchedMentors = await ApiService.findMentors(matchRequest);
      setMentors(matchedMentors || []);
    } catch (error) {
      console.error('Error finding mentors:', error);
      setMentors([]);
    } finally {
      setIsFindingMentors(false);
    }
  };

  const handleBookSession = (mentor) => {
    console.log('Booking session with mentor:', mentor);
    console.log('Selected skill:', selectedSkillForMentors);
    setSelectedMentor(mentor);
    setShowBooking(true);
  };

  const handleBookingSuccess = async (session) => {
    setShowBooking(false);
    setSelectedMentor(null);
    
    // Show toast notification
    window.dispatchEvent(new CustomEvent('sessionNotification', {
      detail: { 
        toastMessage: `📩 Session request sent to ${selectedMentor.mentorName}!`,
        notificationType: 'BOOKING_SUCCESS'
      }
    }));
    
    loadDashboardData();
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'BEGINNER': '#6b7280',
      'INTERMEDIATE': '#3b82f6', 
      'ADVANCE': '#10b981'
    };
    return colors[level] || colors['INTERMEDIATE'];
  };

  const getModeLabel = (mode) => {
    const labels = {
      'ONE_TO_ONE': '1-on-1',
      'GROUP': 'Group',
      'LONG_FORM_MENTORSHIP': 'Long-term'
    };
    return labels[mode] || mode;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = getSessionStats();
  const upcomingSessions = getUpcomingSessions();

  const getLearningProgressData = () => {
    return learnSkills.map(skill => {
      const skillSessions = sessions.filter(s => s.learnerId === user.id && s.skillName === skill.skillName && s.status === 'COMPLETED');
      return {
        skill: skill.skillName,
        sessions: skillSessions.length,
        hours: Math.round(skillSessions.reduce((sum, s) => sum + (s.durationMinutes / 60), 0) * 10) / 10
      };
    });
  };

  const getSessionStatusData = () => {
    const learnerSessions = sessions.filter(s => s.learnerId === user.id);
    return [
      { name: 'Completed', value: learnerSessions.filter(s => s.status === 'COMPLETED').length, color: '#10b981' },
      { name: 'Accepted', value: learnerSessions.filter(s => s.status === 'ACCEPTED').length, color: '#3b82f6' },
      { name: 'Requested', value: learnerSessions.filter(s => s.status === 'REQUESTED').length, color: '#f59e0b' },
      { name: 'Cancelled', value: learnerSessions.filter(s => s.status === 'CANCELLED').length, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard learner-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"><FaGraduationCap /></span>
            {!sidebarCollapsed && <span className="logo-text">TalentTandem</span>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>


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
            <span>🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
          </div>
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <h1 style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Learner Panel
            </h1>
          </div>
          <div className="top-bar-right">
            <NotificationCenter />
            <WalletBalance key={walletKey} userId={user?.id} onZeroCoins={() => setShowZeroCoinsModal(true)} />
            <button
              onClick={() => navigate('/mentor/dashboard')}
              className="icon-btn"
              title="Switch to Mentor"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' }}
            >
              👨‍🏫
            </button>
            <div className="user-profile-container">
              <div 
                className="user-profile" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=6A5AE0&color=fff`} alt="User" />
                <div className="user-info">
                  <span className="user-name">{user?.firstName || user?.username}</span>
                  <span className="user-role">Learner</span>
                </div>
                <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
              </div>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <img src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=6A5AE0&color=fff`} alt="User" />
                    <div>
                      <p className="dropdown-name">{user?.firstName || user?.username}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item" onClick={() => navigate(`/profile/${user?.id}`)}>
                    <span><FaUser /></span>
                    <span>My Profile</span>
                  </button>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'overview' && (
            <div className="overview-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Stats Cards */}
              <div className="stats-grid" style={{ marginBottom: '0.75rem' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#6A5AE020', color: '#6A5AE0' }}><FaBook /></div>
                  <div className="stat-content">
                    <p className="stat-label">Learning Skills</p>
                    <h3 className="stat-value">{learnSkills.length}</h3>
                    <span className="stat-trend">Active goals</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}><FaCalendarAlt /></div>
                  <div className="stat-content">
                    <p className="stat-label">Upcoming Sessions</p>
                    <h3 className="stat-value">{stats.upcoming}</h3>
                    <span className="stat-trend">Scheduled</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}><FaCheckCircle /></div>
                  <div className="stat-content">
                    <p className="stat-label">Completed Sessions</p>
                    <h3 className="stat-value">{stats.completed}</h3>
                    <span className="stat-trend">Total</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}><FaClock /></div>
                  <div className="stat-content">
                    <p className="stat-label">Hours Learned</p>
                    <h3 className="stat-value">{Math.round(stats.totalHours)}</h3>
                    <span className="stat-trend">Total time</span>
                  </div>
                </div>
              </div>

              {/* Charts with Real API Data */}
              <div className="charts-grid" style={{ flex: 1, minHeight: 0 }}>
                <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}><FaChartBar /></div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Learning Skills Progress</h3>
                  </div>
                  {getLearningProgressData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getLearningProgressData()} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#764ba2" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f093fb" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#f5576c" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="skill" stroke="#64748b" style={{ fontSize: '0.8rem', fontWeight: '600' }} tick={{ fill: '#475569' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '0.8rem', fontWeight: '600' }} tick={{ fill: '#475569' }} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
                            border: '2px solid #667eea', 
                            borderRadius: '12px', 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                          }} 
                          cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.875rem', fontWeight: '600' }} />
                        <Bar dataKey="sessions" fill="url(#sessionsGradient)" radius={[10, 10, 0, 0]} name="Sessions" maxBarSize={60} />
                        <Bar dataKey="hours" fill="url(#hoursGradient)" radius={[10, 10, 0, 0]} name="Hours" maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><FaBook /></div>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>No learning progress yet. Add skills and complete sessions!</p>
                    </div>
                  )}
                </div>

                <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaChartPie /> Session Status Distribution</h3>
                  {getSessionStatusData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getSessionStatusData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {getSessionStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '0.875rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><FaChartPie /></div>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>No sessions yet. Book your first session to see statistics!</p>
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
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBook /> Your Learning Skills ({learnSkills.length})</h3>
                  <button onClick={() => setShowAddModal(true)} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaPlus /> Add New Skill
                  </button>
                </div>
                {learnSkills.length > 0 ? (
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Skill Name</th>
                          <th>Priority Level</th>
                          <th>Preferred Mode</th>
                          <th>Schedule</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learnSkills.map(skill => (
                          <tr key={skill.id}>
                            <td><strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBook /> {skill.skillName}</strong></td>
                            <td>
                              <span style={{
                                padding: '0.4rem 0.8rem',
                                background: skill.priorityLevel === 'BEGINNER' ? '#6b7280' : skill.priorityLevel === 'INTERMEDIATE' ? '#3b82f6' : '#10b981',
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {skill.priorityLevel}
                              </span>
                            </td>
                            <td>{getModeLabel(skill.preferredMode)}</td>
                            <td style={{ fontSize: '0.875rem' }}>{skill.dayOfWeek}: {skill.startTime}-{skill.endTime}</td>
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
                                  <FaEdit /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this skill?')) {
                                      handleDeleteSkill(skill.id);
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
                                  <FaTrash /> Delete
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
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><FaBook /></div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Learning Skills Yet</h3>
                    <p style={{ marginBottom: '1.5rem' }}>Start your learning journey by adding your first skill</p>
                    <button onClick={() => setShowAddModal(true)} className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <FaPlus /> Add Your First Skill
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="sessions-section">
              {upcomingSessions.length > 0 && (
                <div className="chart-card" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCalendarAlt /> Upcoming Sessions</h3>
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
                          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>with {session.mentorName}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FaCalendarAlt /> {formatDateTime(session.scheduledTime)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(session.status === 'ACCEPTED' || session.status === 'IN_PROGRESS' || session.status === 'LIVE') && (
                            <button 
                              onClick={() => handleOpenChat(session.sessionId, session.mentorId, session.mentorName, session.learnerName)}
                              className="action-btn"
                              style={{ fontSize: '0.875rem' }}
                            >
                              <FaComments /> Pre Chat
                            </button>
                          )}
                          {(session.status === 'IN_PROGRESS' || session.status === 'LIVE') && (
                            <span style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: '#fff',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              🔴 Live
                            </span>
                          )}
                          {session.status === 'REQUESTED' && (
                            <span style={{
                              padding: '0.5rem 1rem',
                              background: '#fef3c7',
                              color: '#92400e',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="chart-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaChartBar /> All Sessions</h3>
                <div className="users-table" style={{ marginTop: '1rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Mentor</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(session => (
                        <tr key={session.sessionId}>
                          <td><strong>{session.skillName}</strong></td>
                          <td>{session.mentorName}</td>
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

          {activeTab === 'mentors' && (
            <div className="mentors-section">
              <div className="chart-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaSearch /> Find Mentors</h3>
                
                {/* Your Learning Skills */}
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Select a skill to find mentors:</h4>
                  {learnSkills.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {learnSkills.map((skill) => (
                        <div
                          key={skill.id}
                          onClick={() => findMentors(skill)}
                          style={{
                            padding: '1rem',
                            background: selectedSkillForMentors?.id === skill.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                            color: selectedSkillForMentors?.id === skill.id ? '#fff' : '#1e293b',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedSkillForMentors?.id !== skill.id) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h5 style={{ margin: 0, fontWeight: '600' }}>{skill.skillName}</h5>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              background: selectedSkillForMentors?.id === skill.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {skill.priorityLevel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                            {getModeLabel(skill.preferredMode)} • {skill.dayOfWeek}: {skill.startTime}-{skill.endTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      <p>No learning skills found. Please add some skills first.</p>
                      <button onClick={() => setActiveTab('skills')} className="action-btn" style={{ marginTop: '1rem' }}>
                        Add Learning Skills
                      </button>
                    </div>
                  )}
                </div>

                {/* Matched Mentors */}
                {selectedSkillForMentors && (
                  <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>
                        Mentors for {selectedSkillForMentors.skillName}
                        {isFindingMentors && <span style={{ marginLeft: '0.5rem' }}><FaRedo /></span>}
                      </h4>
                      <button 
                        onClick={() => findMentors(selectedSkillForMentors)}
                        className="action-btn"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <FaSearch /> Find More Mentors
                      </button>
                    </div>
                    
                    {isFindingMentors ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <p>Finding the best mentors for you...</p>
                      </div>
                    ) : mentors.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {mentors.map((mentor) => (
                          <div
                            key={mentor.mentorId}
                            style={{
                              padding: '1.5rem',
                              background: '#fff',
                              borderRadius: '16px',
                              border: '2px solid #e2e8f0',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${getProficiencyColor(mentor.proficiencyLevel)} 0%, #764ba2 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '1.2rem'
                              }}>
                                {mentor.mentorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>{mentor.mentorName}</h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{mentor.city}</p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                background: getProficiencyColor(mentor.proficiencyLevel),
                                color: '#fff',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {mentor.proficiencyLevel}
                              </span>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                background: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {getModeLabel(mentor.preferredMode)}
                              </span>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                Confidence: {mentor.confidenceScore}/10
                              </span>
                            </div>

                            {mentor.matchExplanation && (
                              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                                {mentor.matchExplanation}
                              </p>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button 
                                onClick={() => handleBookSession(mentor)}
                                className="action-btn"
                                style={{ flex: 1, fontSize: '0.875rem' }}
                              >
                                Request Session (10 coins)
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedMentorId(mentor.mentorId);
                                  setShowProfileModal(true);
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: 'transparent',
                                  border: '2px solid #6A5AE0',
                                  color: '#6A5AE0',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#6A5AE0';
                                  e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#6A5AE0';
                                }}
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedSkillForMentors && !isFindingMentors ? (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          borderRadius: '20px',
                          padding: '2rem 1.5rem',
                          maxWidth: '350px',
                          width: '90%',
                          textAlign: 'center',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                            borderRadius: '50%'
                          }}></div>
                          <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #f093fb20, #f5576c20)',
                            borderRadius: '50%'
                          }}></div>
                          
                          <div style={{ 
                            fontSize: '3.5rem', 
                            marginBottom: '1rem',
                            color: '#667eea'
                          }}><FaSearch /></div>
                          
                          <h3 style={{ 
                            color: '#1e293b', 
                            marginBottom: '0.75rem', 
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            letterSpacing: '-0.5px'
                          }}>Oops! No Mentors Found</h3>
                          
                          <p style={{ 
                            color: '#64748b', 
                            marginBottom: '1.5rem', 
                            lineHeight: '1.5',
                            fontSize: '0.95rem'
                          }}>
                            We couldn&apos;t find any mentors for <span style={{
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: '600'
                            }}>{selectedSkillForMentors?.skillName}</span> right now.
                          </p>
                          
                          <div style={{ 
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                            padding: '1rem', 
                            borderRadius: '12px', 
                            marginBottom: '1.5rem',
                            border: '1px solid #e0f2fe'
                          }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}><FaLightbulb /></div>
                            <p style={{ 
                              color: '#0369a1', 
                              fontSize: '0.85rem', 
                              margin: 0,
                              fontWeight: '500',
                              lineHeight: '1.4'
                            }}>
                              Don&apos;t worry! New mentors join daily. Try adjusting your preferences or check back soon!
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button 
                              onClick={() => {
                                setSelectedSkillForMentors(null);
                                setMentors([]);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                              }}
                            >
                              <FaThumbsUp /> Got it!
                            </button>
                            
                            <button 
                              onClick={() => findMentors(selectedSkillForMentors)}
                              style={{
                                background: 'transparent',
                                color: '#667eea',
                                border: '2px solid #667eea',
                                borderRadius: '12px',
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#667eea';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#667eea';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <FaRedo /> Try Again
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={showEditModal} onClose={() => {
        setShowEditModal(false);
        setEditingSkill(null);
        setPriority('INTERMEDIATE');
        setPreferredMode('ONE_TO_ONE');
      }} title={<span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaEdit /> Edit Learning Skill</span>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              <FaBook /> Skill Name
            </label>
            <input
              type="text"
              value={editingSkill?.skillName || ''}
              disabled
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              <FaChartBar /> Priority Level *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCE">Advanced</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              <FaUsers /> Preferred Mode *
            </label>
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <option value="ONE_TO_ONE">One-to-One</option>
              <option value="GROUP">Group Sessions</option>
              <option value="LONG_FORM_MENTORSHIP">Long Form Mentorship</option>
            </select>
          </div>

          <button
            onClick={handleUpdateSkill}
            className="action-btn"
            style={{ 
              marginTop: '0.5rem', 
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <FaCheckCircle /> Update Skill
          </button>
        </div>
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={<span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPlus /> Add Learning Goal</span>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              <FaBook /> Select Skill *
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <option value="">Choose a skill to learn</option>
              {availableSkills.map(skill => (
                <option key={skill.id} value={skill.name || skill.skillName}>
                  {skill.name || skill.skillName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              📊 Priority Level *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <option value="BEGINNER">🌱 Beginner</option>
              <option value="INTERMEDIATE">🌿 Intermediate</option>
              <option value="ADVANCE">🌳 Advanced</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
              🎯 Preferred Mode *
            </label>
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.875rem', 
                borderRadius: '10px', 
                border: '2px solid #e2e8f0',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <option value="ONE_TO_ONE">👥 One-to-One</option>
              <option value="GROUP">👨‍👩‍👧‍👦 Group Sessions</option>
              <option value="LONG_FORM_MENTORSHIP">📅 Long Form Mentorship</option>
            </select>
          </div>

          <button
            onClick={handleAddSkill}
            disabled={!selectedSkill}
            className="action-btn"
            style={{ 
              marginTop: '0.5rem', 
              width: '100%', 
              opacity: !selectedSkill ? 0.5 : 1,
              cursor: !selectedSkill ? 'not-allowed' : 'pointer',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ➕ Add Learning Goal
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
        onBecomeTeacher={handleBecomeMentor}
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

      {showBooking && selectedMentor && (
        <SessionBooking
          mentor={selectedMentor}
          skill={selectedSkillForMentors}
          onClose={() => {
            setShowBooking(false);
            setSelectedMentor(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {showProfileModal && selectedMentorId && (
        <MentorProfileModal
          mentorId={selectedMentorId}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedMentorId(null);
          }}
        />
      )}

      {showFeedbackForm && feedbackSessionId && feedbackMentorId && (
        <FeedbackForm
          sessionId={feedbackSessionId}
          mentorId={feedbackMentorId}
          onClose={() => {
            setShowFeedbackForm(false);
            setFeedbackSessionId(null);
            setFeedbackMentorId(null);
          }}
        />
      )}

    </div>
  );
};

export default LearnerDashboard;
