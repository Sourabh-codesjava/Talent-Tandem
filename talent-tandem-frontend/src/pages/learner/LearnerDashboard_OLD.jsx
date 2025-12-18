import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaGraduationCap, FaBook, FaCalendarAlt, FaSearch, FaChartBar, FaCheckCircle, FaClock, FaPlus, FaEdit, FaTrash, FaUser, FaDoorOpen, FaCog, FaChartPie, FaComments, FaRocket, FaLightbulb, FaRedo, FaThumbsUp, FaSeedling, FaLeaf, FaTree, FaUsers, FaUserFriends, FaCalendarCheck } from 'react-icons/fa';
import ApiService from '../../services/api';
import { useUser } from '../../context/UserContext';
import Modal from '../../components/Modal';
import Notification from '../../components/Notification';
import WalletBalance from '../../components/WalletBalance';
import ZeroCoinsModal from '../../components/ZeroCoinsModal';
import PreChatModal from '../../components/PreChatModal';
import './LearnerDashboard.css';
import socket from '../../socket';


const LearnerDashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [priority, setPriority] = useState('INTERMEDIATE');
  const [preferredMode, setPreferredMode] = useState('ONE_TO_ONE');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);
  const [walletKey, setWalletKey] = useState(0);
  const [showPreChat, setShowPreChat] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedMentorName, setSelectedMentorName] = useState(null);
  const [selectedLearnerName, setSelectedLearnerName] = useState(null);

  useEffect(() => {
  if (!user?.id) return;

  // ✅ 1. Pehle normal API se dashboard load karo
  loadDashboardData();

  // ✅ 2. WebSocket connect hone par subscribe
  socket.onConnect = () => {
    console.log("✅ WebSocket Connected for Learner:", user.id);

    const sessionSub = socket.subscribe(
      `/queue/user/${user.id}/sessions`,
      (message) => {
        console.log("🔄 Session update received", message);
        
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            if (data.message) {
              setNotification({ 
                show: true, 
                message: data.message, 
                type: 'success' 
              });
            }
          } catch (e) {
            console.error('Error parsing notification:', e);
          }
        }
        
        loadDashboardData();
      }
    );

    // ✅ 3. Cleanup on unmount
    return () => {
      console.log("❌ WebSocket Cleanup for Learner");
      sessionSub?.unsubscribe();
      socket.deactivate();
    };
  };

  // ✅ 4. WebSocket start karo sirf ek baar
  if (!socket.active) {
    socket.activate();
  }

}, [user?.id]);


  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userSessions, userSkills, allSkills] = await Promise.all([
        ApiService.getUserSessions(user.id),
        ApiService.getLearnSkillsByUser(user.id),
        ApiService.getAllSkills()
      ]);
      
      setSessions(userSessions);
      setLearnSkills(userSkills);
      setAvailableSkills(allSkills);
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

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => 
      new Date(session.scheduledTime) > now && 
      (session.status === 'ACCEPTED' || session.status === 'REQUESTED')
    );
  };

  const getRecentSessions = () => {
    return sessions
      .filter(session => session.status === 'COMPLETED')
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime))
      .slice(0, 3);
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

  const handleBecomeMentor = async () => {
    try {
      const response = await ApiService.becomeMentor(user.id);
      setWalletKey(prev => prev + 1);
      setShowZeroCoinsModal(false);
      setNotification({ 
        show: true, 
        message: response.message || 'Congratulations! You are now a mentor. 100 coins added!', 
        type: 'success' 
      });
      navigate('/mentor/setup');
    } catch (error) {
      setNotification({ 
        show: true, 
        message: error.message || 'Failed to become mentor', 
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

  const stats = getSessionStats();
  const upcomingSessions = getUpcomingSessions();
  const recentSessions = getRecentSessions();

  if (isLoading) {
    return (
      <div className="learner-dashboard">
        <div className="container">
          <div className="loading-state">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="learner-dashboard">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header"
        >
          <div>
            <h1>Welcome back, {user?.firstName || user?.username}! 👋</h1>
            <p>Here's your learning progress and upcoming sessions</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.hasTeachProfile && (
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="role-switch-btn"
                title="Switch to Mentor Dashboard"
              >
                <span className="switch-icon">🔄</span>
                <span className="switch-text">Switch to Mentor</span>
              </button>
            )}
            <WalletBalance key={walletKey} userId={user?.id} onZeroCoins={() => setShowZeroCoinsModal(true)} />
          </div>
        </motion.div>

        {error && <div className="error-message">{error}</div>}

        {/* Modern Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}
        >
          {/* Bar Chart - Skills Progress */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1.5rem'
            }}>📊 Skills Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { skill: 'React', hours: 12, target: 20 },
                { skill: 'Node.js', hours: 8, target: 15 },
                { skill: 'Python', hours: 15, target: 20 },
                { skill: 'AWS', hours: 6, target: 10 },
                { skill: 'Docker', hours: 4, target: 8 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" stroke="#64748b" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    border: '2px solid #667eea', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="hours" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#f093fb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Session Status */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1.5rem'
            }}>🎯 Session Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.completed || 8, color: '#10b981' },
                    { name: 'Upcoming', value: stats.upcoming || 3, color: '#3b82f6' },
                    { name: 'Pending', value: sessions.filter(s => s.status === 'REQUESTED').length || 2, color: '#f59e0b' },
                    { name: 'Cancelled', value: 1, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelStyle={{ fontSize: '12px', fontWeight: '600', fill: '#1e293b' }}
                >
                  {[
                    { name: 'Completed', value: stats.completed || 8, color: '#10b981' },
                    { name: 'Upcoming', value: stats.upcoming || 3, color: '#3b82f6' },
                    { name: 'Pending', value: sessions.filter(s => s.status === 'REQUESTED').length || 2, color: '#f59e0b' },
                    { name: 'Cancelled', value: 1, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    border: '2px solid #667eea', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Learning Progress Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-section"
          style={{ marginBottom: '2.5rem' }}
        >
          <h2>📊 Learning Progress</h2>
          
          {/* Static Line Graph */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '2.5rem',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginTop: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>📈 Weekly Learning Hours</h3>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>This Week</span>
                </div>
              </div>
            </div>
            <svg width="100%" height="280" viewBox="0 0 700 280" style={{ overflow: 'visible' }}>
              {/* Background Grid */}
              <rect x="50" y="30" width="600" height="200" fill="rgba(102, 126, 234, 0.02)" rx="8" />
              
              {/* Grid Lines */}
              <line x1="50" y1="230" x2="650" y2="230" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="50" y1="180" x2="650" y2="180" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="130" x2="650" y2="130" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="80" x2="650" y2="80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="50" y1="30" x2="650" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Y-axis labels */}
              <text x="20" y="235" fontSize="13" fill="#64748b" fontWeight="600">0h</text>
              <text x="20" y="185" fontSize="13" fill="#64748b" fontWeight="600">5h</text>
              <text x="15" y="135" fontSize="13" fill="#64748b" fontWeight="600">10h</text>
              <text x="15" y="85" fontSize="13" fill="#64748b" fontWeight="600">15h</text>
              <text x="15" y="35" fontSize="13" fill="#64748b" fontWeight="600">20h</text>
              
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="50%" stopColor="#764ba2" />
                  <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f093fb" stopOpacity="0.05" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#667eea" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {/* Area under curve */}
              <path
                d="M 50 210 L 135 190 L 220 170 L 305 150 L 390 130 L 475 140 L 560 120 L 650 100 L 650 230 L 50 230 Z"
                fill="url(#areaGradient)"
              />
              
              {/* Line */}
              <motion.path
                d="M 50 210 L 135 190 L 220 170 L 305 150 L 390 130 L 475 140 L 560 120 L 650 100"
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#shadow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
              
              {/* Data Points with white border */}
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                <circle cx="50" cy="210" r="8" fill="white" />
                <circle cx="50" cy="210" r="6" fill="#667eea" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                <circle cx="135" cy="190" r="8" fill="white" />
                <circle cx="135" cy="190" r="6" fill="#667eea" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}>
                <circle cx="220" cy="170" r="8" fill="white" />
                <circle cx="220" cy="170" r="6" fill="#764ba2" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }}>
                <circle cx="305" cy="150" r="8" fill="white" />
                <circle cx="305" cy="150" r="6" fill="#764ba2" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }}>
                <circle cx="390" cy="130" r="8" fill="white" />
                <circle cx="390" cy="130" r="6" fill="#764ba2" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 }}>
                <circle cx="475" cy="140" r="8" fill="white" />
                <circle cx="475" cy="140" r="6" fill="#f093fb" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }}>
                <circle cx="560" cy="120" r="8" fill="white" />
                <circle cx="560" cy="120" r="6" fill="#f093fb" />
              </motion.g>
              <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7 }}>
                <circle cx="650" cy="100" r="8" fill="white" />
                <circle cx="650" cy="100" r="6" fill="#f093fb" />
              </motion.g>
              
              {/* Value labels on hover */}
              <text x="50" y="200" fontSize="11" fill="#667eea" fontWeight="700" textAnchor="middle">2h</text>
              <text x="135" y="180" fontSize="11" fill="#667eea" fontWeight="700" textAnchor="middle">4h</text>
              <text x="220" y="160" fontSize="11" fill="#764ba2" fontWeight="700" textAnchor="middle">6h</text>
              <text x="305" y="140" fontSize="11" fill="#764ba2" fontWeight="700" textAnchor="middle">8h</text>
              <text x="390" y="120" fontSize="11" fill="#764ba2" fontWeight="700" textAnchor="middle">10h</text>
              <text x="475" y="130" fontSize="11" fill="#f093fb" fontWeight="700" textAnchor="middle">9h</text>
              <text x="560" y="110" fontSize="11" fill="#f093fb" fontWeight="700" textAnchor="middle">11h</text>
              <text x="650" y="90" fontSize="11" fill="#f093fb" fontWeight="700" textAnchor="middle">13h</text>
              
              {/* X-axis labels */}
              <text x="50" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Mon</text>
              <text x="135" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Tue</text>
              <text x="220" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Wed</text>
              <text x="305" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Thu</text>
              <text x="390" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Fri</text>
              <text x="475" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Sat</text>
              <text x="560" y="255" fontSize="13" fill="#64748b" fontWeight="700" textAnchor="middle">Sun</text>
            </svg>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem'
          }}>
            <motion.div 
              onClick={() => navigate('/learner/setup')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
              }}
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
              >📚</motion.div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{learnSkills.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Skills Learning</div>
              <div style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: '600', marginTop: '0.5rem' }}>👆 Click to manage</div>
            </motion.div>
            <motion.div 
              onClick={() => navigate('/sessions')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid rgba(240, 147, 251, 0.2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.1)'
              }}
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
              >✅</motion.div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.completed}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Sessions Completed</div>
              <div style={{ fontSize: '0.75rem', color: '#f093fb', fontWeight: '600', marginTop: '0.5rem' }}>👆 View history</div>
            </motion.div>
            <motion.div 
              onClick={() => navigate('/sessions')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.1)'
              }}
            >
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
              >⏱️</motion.div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{Math.round(stats.totalHours)}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Hours Learned</div>
              <div style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: '600', marginTop: '0.5rem' }}>👆 View details</div>
            </motion.div>
            <motion.div 
              onClick={() => {
                const upcomingSection = document.querySelector('.dashboard-section');
                if (upcomingSection) {
                  upcomingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '2rem',
                borderRadius: '16px',
                border: '2px solid rgba(240, 147, 251, 0.2)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.1)'
              }}
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
              >📅</motion.div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #f093fb 0%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.upcoming}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Upcoming Sessions</div>
              <div style={{ fontSize: '0.75rem', color: '#f093fb', fontWeight: '600', marginTop: '0.5rem' }}>👆 Scroll to view</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stats-grid"
        >
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-number">{learnSkills.length}</div>
              <div className="stat-label">Learning Skills</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.upcoming}</div>
              <div className="stat-label">Upcoming Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{Math.round(stats.totalHours)}</div>
              <div className="stat-label">Hours Learned</div>
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
          <h2 style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <button 
              onClick={() => navigate('/learner/matching')}
              className="action-card"
            >
              <div className="action-icon">🔍</div>
              <div className="action-content">
                <h3>Find Mentors</h3>
                <p>Discover experts in your learning skills</p>
              </div>
            </button>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="action-card"
            >
              <div className="action-icon">➕</div>
              <div className="action-content">
                <h3>Add Learning Goal</h3>
                <p>Quick add a new skill to learn</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/learner/setup')}
              className="action-card"
            >
              <div className="action-icon">⚙️</div>
              <div className="action-content">
                <h3>Manage Skills</h3>
                <p>View and update your learning goals</p>
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
            
            {user?.hasTeachProfile && (
              <button 
                onClick={() => navigate('/mentor/dashboard')}
                className="action-card switch-role"
              >
                <div className="action-icon">🔄</div>
                <div className="action-content">
                  <h3>Switch to Mentor</h3>
                  <p>View your teaching dashboard</p>
                </div>
              </button>
            )}
          </div>
        </motion.div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="dashboard-section"
          >
            <h2>Upcoming Sessions</h2>
            <div className="sessions-list">
              {upcomingSessions.map(session => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-info">
                    <h3>{session.skillName}</h3>
                    <p>with {session.mentorName}</p>
                    <div className="session-time">
                      📅 {formatDateTime(session.scheduledTime)}
                    </div>
                  </div>
                  <div className="session-actions">
                    {session.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => handleStartSession(
                          session.sessionId, 
                          session.mentorId, 
                          session.mentorName, 
                          session.learnerName
                        )}
                        className="btn btn-primary"
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                      >
                        💬 Open Pre-Chat
                      </button>
                    )}
                    {session.status === 'REQUESTED' && (
                      <span className="status-badge status-requested">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-section"
        >
          <h2>Your Learning Skills</h2>
          {learnSkills.length > 0 ? (
            <div className="skills-grid">
              {learnSkills.map(skill => (
                <div key={skill.id} className="skill-item">
                  <h3>{skill.skillName}</h3>
                  <div className="skill-details">
                    <span className="priority-badge">
                      {skill.priorityLevel}
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
              <p>No learning skills yet</p>
              <button 
                onClick={() => navigate('/learner/setup')}
                className="btn btn-primary"
              >
                Add Learning Skills
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="dashboard-section"
          >
            <h2>Recent Sessions</h2>
            <div className="sessions-list">
              {recentSessions.map(session => (
                <div key={session.sessionId} className="session-item completed">
                  <div className="session-info">
                    <h3>{session.skillName}</h3>
                    <p>with {session.mentorName}</p>
                    <div className="session-time">
                      📅 {formatDateTime(session.scheduledTime)}
                    </div>
                  </div>
                  <div className="session-duration">
                    ⏱️ {session.durationMinutes} min
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Learning Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Select Skill *</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Priority Level *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCE">Advanced</option>
            </select>
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
            Add Learning Goal
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
    </div>
  );
};

export default LearnerDashboard;