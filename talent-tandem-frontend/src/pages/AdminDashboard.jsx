import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FaUsers, FaCalendarAlt, FaBullseye, FaChartLine, FaTags, FaGraduationCap, FaChalkboardTeacher, FaSignOutAlt, FaSync, FaLock, FaStar, FaBell, FaTrophy, FaCheckCircle, FaTimesCircle, FaClock, FaUserGraduate, FaMoneyBillWave } from 'react-icons/fa';
import { useUser } from '../context/UserContext';
import AuthService from '../services/auth';
import ApiService from '../services/api';
import SkillsManager from '../components/SkillsManager';
import TagsManager from '../components/TagsManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminActiveTab') || 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [topMentors, setTopMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading admin data...');

      const [usersData, sessionsData, skillsData] = await Promise.all([
        ApiService.getAllUsers().catch(err => { console.error('❌ Users API failed:', err); return []; }),
        ApiService.getAllSessions().catch(err => { console.error('❌ Sessions API failed:', err); return []; }),
        ApiService.getAllSkills().catch(err => { console.error('❌ Skills API failed:', err); return []; })
      ]);

      console.log('✅ Users loaded:', usersData.length);
      console.log('✅ Sessions loaded:', sessionsData.length);
      console.log('✅ Skills loaded:', skillsData.length);
      console.log('👥 Users data sample:', usersData.slice(0, 3));
      console.log('📊 Role counts:', {
        learners: usersData.filter(u => u.role === 'LEARNER').length,
        mentors: usersData.filter(u => u.role === 'MENTOR').length,
        both: usersData.filter(u => u.role === 'BOTH').length,
        noRole: usersData.filter(u => !u.role).length
      });

      setUsers(usersData);
      setSessions(sessionsData);
      setSkills(skillsData);

      // Calculate Top Mentors
      const mentorStats = {};
      sessionsData.forEach(s => {
        if (s.mentorId) {
          if (!mentorStats[s.mentorId]) {
            mentorStats[s.mentorId] = {
              id: s.mentorId,
              name: s.mentorName || 'Unknown Mentor',
              sessions: 0,
              completed: 0
            };
          }
          mentorStats[s.mentorId].sessions++;
          if (s.status === 'COMPLETED') mentorStats[s.mentorId].completed++;
        }
      });

      const topMentorsList = Object.values(mentorStats)
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5);

      // Fetch Real Ratings for Top Mentors
      const enrichedMentors = await Promise.all(topMentorsList.map(async (mentor) => {
        try {
          const ratingData = await ApiService.getMentorRating(mentor.id);
          return {
            ...mentor,
            rating: ratingData.averageRating ? ratingData.averageRating.toFixed(1) : 'N/A',
            earnings: `${mentor.completed * 10}` // 10 coins per session
          };
        } catch (err) {
          console.error(`Failed to fetch rating for mentor ${mentor.id}`, err);
          return { ...mentor, rating: 'N/A', earnings: `${mentor.completed * 10}` };
        }
      }));

      setTopMentors(enrichedMentors);
    } catch (error) {
      console.error('❌ Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserGrowthData = () => {
    if (users.length === 0) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const monthUsers = users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        return userDate.getMonth() === index && userDate.getFullYear() === currentYear;
      });
      return {
        month,
        learners: monthUsers.filter(u => u.role === 'LEARNER').length,
        mentors: monthUsers.filter(u => u.role === 'MENTOR').length,
        total: monthUsers.length
      };
    });
  };

  const getSessionData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const daySessions = sessions.filter(s => {
        if (!s.scheduledDateTime) return false;
        const sessionDay = new Date(s.scheduledDateTime).toLocaleDateString('en-US', { weekday: 'short' });
        return sessionDay === day;
      });
      return {
        day,
        completed: daySessions.filter(s => s.status === 'COMPLETED').length,
        cancelled: daySessions.filter(s => s.status === 'CANCELLED').length,
        pending: daySessions.filter(s => s.status === 'REQUESTED' || s.status === 'ACCEPTED').length
      };
    });
  };

  const getSkillDistribution = () => {
    const colors = ['#6A5AE0', '#7B7FF2', '#4F8CFF', '#10b981', '#f59e0b'];
    const skillCounts = {};
    sessions.forEach(s => {
      if (s.skillName) {
        skillCounts[s.skillName] = (skillCounts[s.skillName] || 0) + 1;
      }
    });
    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], index) => ({ name, value, color: colors[index] }));
  };



  const getRecentActivities = () => {
    const activities = [];
    const recentUsers = users.slice(-3).reverse();
    recentUsers.forEach(u => {
      activities.push({
        icon: '👤',
        action: 'New user registered',
        user: u.firstName || u.username,
        time: u.createdAt ? new Date(u.createdAt).toLocaleString() : 'Recently',
        type: 'user'
      });
    });
    const recentSessions = sessions.filter(s => s.status === 'COMPLETED').slice(-3).reverse();
    recentSessions.forEach(s => {
      activities.push({
        icon: '📅',
        action: 'Session completed',
        user: s.learnerName ? `${s.learnerName} with ${s.mentorName}` : (s.skillName || 'Session'),
        time: s.scheduledDateTime ? new Date(s.scheduledDateTime).toLocaleString() : 'Recently',
        type: 'session'
      });
    });
    return activities.slice(0, 6);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'skills', label: 'Skills Management', icon: <FaBullseye /> },
    { id: 'tags', label: 'Tags Management', icon: <FaTags /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'sessions', label: 'Sessions', icon: <FaCalendarAlt /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('adminActiveTab', tabId);
  };

  const stats = [
    { label: 'Total Users', value: users.length || '0', icon: '👥', color: '#6A5AE0', subtext: `${users.filter(u => u.role === 'LEARNER').length} Learners, ${users.filter(u => u.role === 'MENTOR').length} Mentors` },
    { label: 'Active Sessions', value: sessions.filter(s => s.status === 'ACCEPTED' || s.status === 'REQUESTED').length || '0', icon: '📅', color: '#10b981', subtext: `${sessions.filter(s => s.status === 'COMPLETED').length} Completed` },
    { label: 'Total Skills', value: skills.length || '0', icon: '🎯', color: '#f59e0b', subtext: 'Available Skills' },
    { label: 'Total Sessions', value: sessions.length || '0', icon: '💰', color: '#8b5cf6', subtext: 'All Time' },
  ];

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: '600' }}>Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"></span>
            {!sidebarCollapsed && <span className="logo-text">TalentTandem</span>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        {!sidebarCollapsed && (
          <div style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
            <FaSignOutAlt />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="page-title" style={{ fontSize: '1.85rem' }}>
              Admin Panel
            </h1>
          </div>
          <div className="top-bar-right">

            <div className="user-profile-container">
              <div
                className="user-profile"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName || user?.username || 'Admin'}&background=6A5AE0&color=fff`} alt="Admin" />
                <div className="user-info">
                  <span className="user-name">{user?.firstName || user?.username || 'Admin'}</span>
                  <span className="user-role">Administrator</span>
                </div>
                <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <img src={`https://ui-avatars.com/api/?name=${user?.firstName || user?.username || 'Admin'}&background=6A5AE0&color=fff`} alt="Admin" />
                    <div>
                      <p className="dropdown-name">{user?.firstName || user?.username || 'Admin'}</p>
                      <p className="dropdown-email">{user?.email || 'admin@talenttandem.com'}</p>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item" onClick={() => navigate(`/profile/${user?.id}`)}>
                    <span>👤</span>
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
          {/* Security Notice */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <FaLock style={{ fontSize: '1.5rem', color: '#92400e' }} />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.95rem' }}>Admin Access</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#78350f' }}>
                You have administrative privileges. Handle data with care.
              </p>
            </div>
          </div>
          <div key={activeTab}>
            {activeTab === 'overview' && (
              <div className="overview-section">
                {/* Stats Cards */}
                <div className="stats-grid">
                  {stats.map((stat) => (
                    <div key={stat.label} className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                        {stat.icon}
                      </div>
                      <div className="stat-content">
                        <p className="stat-label">{stat.label}</p>
                        <h3 className="stat-value">{stat.value}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span className="stat-trend">{stat.trend}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.subtext}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                  {/* Skill Distribution */}
                  <div className="chart-card">
                    <h3>🎯 Skill Categories</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getSkillDistribution()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelStyle={{ fontSize: '11px', fontWeight: '600' }}
                        >
                          {getSkillDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #6A5AE0', borderRadius: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Session Completion Rate */}
                  <div className="chart-card">
                    <h3>📊 Completion Rate</h3>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'COMPLETED').length / sessions.length) * 100) : 0}%
                      </div>
                      <p style={{ color: '#64748b', marginTop: '1rem' }}>Sessions Completed Successfully</p>
                      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-around' }}>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{sessions.filter(s => s.status === 'COMPLETED').length}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Completed</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{sessions.filter(s => s.status === 'ACCEPTED' || s.status === 'REQUESTED').length}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Active</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{sessions.filter(s => s.status === 'CANCELLED').length}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Cancelled</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Mentors */}
                  <div className="chart-card">
                    <h3>⭐ Top Performing Mentors</h3>
                    <div className="top-mentors-list">
                      {topMentors.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No mentor data available</p>
                      ) : (
                        topMentors.map((mentor, index) => (
                          <div key={mentor.id} className="mentor-item">
                            <div className="mentor-rank">#{index + 1}</div>
                            <div className="mentor-info">
                              <p className="mentor-name">{mentor.name}</p>
                              <div className="mentor-stats">
                                <span>📅 {mentor.sessions} sessions</span>
                                <span>⭐ {mentor.rating}</span>
                                <span>💰 {mentor.earnings} coins</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="chart-card">
                    <h3>🔔 Recent Activity</h3>
                    <div className="activity-list">
                      {getRecentActivities().length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No recent activity</p>
                      ) : (
                        getRecentActivities().map((activity, index) => (
                          <div key={index} className="activity-item">
                            <span className="activity-icon">{activity.icon}</span>
                            <div className="activity-content">
                              <p><strong>{activity.action}</strong></p>
                              <span>{activity.user}</span>
                              <span className="activity-time">{activity.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && <SkillsManager />}
            {activeTab === 'tags' && <TagsManager />}

            {activeTab === 'users' && (
              <div className="users-section">
                {/* User Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#6A5AE020', color: '#6A5AE0' }}>👥</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Users</p>
                      <h3 className="stat-value">{users.length}</h3>
                      <span className="stat-trend">All registered users</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>🎓</div>
                    <div className="stat-content">
                      <p className="stat-label">Learners</p>
                      <h3 className="stat-value">{users.filter(u => u.role === 'LEARNER').length}</h3>
                      <span className="stat-trend">Active learners</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>👨‍🏫</div>
                    <div className="stat-content">
                      <p className="stat-label">Mentors</p>
                      <h3 className="stat-value">{users.filter(u => u.role === 'MENTOR').length}</h3>
                      <span className="stat-trend">Active mentors</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>👥</div>
                    <div className="stat-content">
                      <p className="stat-label">Both Roles</p>
                      <h3 className="stat-value">{users.filter(u => u.role === 'BOTH').length}</h3>
                      <span className="stat-trend">Mentor & Learner</span>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="chart-card" style={{ marginTop: '2rem' }}>
                  <h3>👥 Recent Users</h3>
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.slice(0, 10).map((user) => (
                            <tr key={user.id}>
                              <td><strong>{user.firstName || user.username}</strong></td>
                              <td>{user.email}</td>
                              <td>
                                <span className={`role-badge ${user.role?.toLowerCase() || 'learner'}`}>
                                  {user.role || 'User'}
                                </span>
                              </td>
                              <td>
                                <span className="status-badge active">Active</span>
                              </td>
                              <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="sessions-section">
                {/* Session Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#6A5AE020', color: '#6A5AE0' }}>📅</div>
                    <div className="stat-content">
                      <p className="stat-label">Total Sessions</p>
                      <h3 className="stat-value">{sessions.length}</h3>
                      <span className="stat-trend">All time sessions</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>✅</div>
                    <div className="stat-content">
                      <p className="stat-label">Completed</p>
                      <h3 className="stat-value">{sessions.filter(s => s.status === 'COMPLETED').length}</h3>
                      <span className="stat-trend">{sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'COMPLETED').length / sessions.length) * 100) : 0}% completion rate</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>⏳</div>
                    <div className="stat-content">
                      <p className="stat-label">Active</p>
                      <h3 className="stat-value">{sessions.filter(s => s.status === 'ACCEPTED' || s.status === 'REQUESTED').length}</h3>
                      <span className="stat-trend">Pending & Accepted</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>❌</div>
                    <div className="stat-content">
                      <p className="stat-label">Cancelled</p>
                      <h3 className="stat-value">{sessions.filter(s => s.status === 'CANCELLED').length}</h3>
                      <span className="stat-trend" style={{ color: '#ef4444' }}>{sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'CANCELLED').length / sessions.length) * 100) : 0}% cancelled</span>
                    </div>
                  </div>
                </div>

                {/* Sessions Chart */}
                <div className="charts-grid" style={{ marginTop: '2rem' }}>
                  <div className="chart-card">
                    <h3>📊 Session Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { status: 'Completed', count: sessions.filter(s => s.status === 'COMPLETED').length },
                        { status: 'Active', count: sessions.filter(s => s.status === 'ACCEPTED' || s.status === 'REQUESTED').length },
                        { status: 'Cancelled', count: sessions.filter(s => s.status === 'CANCELLED').length },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="status" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #6A5AE0', borderRadius: '10px' }} />
                        <Bar dataKey="count" fill="#6A5AE0" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>📈 Sessions By Day</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getSessionData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #10b981', borderRadius: '10px' }} />
                        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Sessions Table */}
                <div className="chart-card" style={{ marginTop: '2rem' }}>
                  <h3>📅 Recent Sessions</h3>
                  <div className="users-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Session ID</th>
                          <th>Skill</th>
                          <th>Date</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                              No sessions found
                            </td>
                          </tr>
                        ) : (
                          sessions.slice(0, 10).map((session) => (
                            <tr key={session.sessionId}>
                              <td>#{session.sessionId}</td>
                              <td>{session.skillName || 'N/A'}</td>
                              <td>{session.scheduledDateTime ? new Date(session.scheduledDateTime).toLocaleDateString() : 'N/A'}</td>
                              <td>{session.durationMinutes} min</td>
                              <td>
                                <span className={`status-badge ${session.status === 'COMPLETED' ? 'active' :
                                  session.status === 'CANCELLED' ? 'inactive' : 'pending'
                                  }`}>
                                  {session.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
