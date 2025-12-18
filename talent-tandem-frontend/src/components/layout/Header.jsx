import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import NotificationCenter from '../NotificationCenter';
import WalletBalance from '../WalletBalance';
import TLLogo from '../../assets/logo/TLLogo';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  // Check if we're on homepage
  const isHomePage = location.pathname === '/';
  
  // Check if we're on dashboard pages
  const isDashboard = ['/mentor/dashboard', '/learner/dashboard'].includes(location.pathname);
  
  // Check current role based on path
  const currentRole = location.pathname.includes('/mentor') ? 'mentor' : 
                      location.pathname.includes('/learner') ? 'learner' : null;

  const handleRoleSwitch = (role) => {
    if (role === 'mentor') {
      if (user?.hasTeachProfile) {
        navigate('/mentor/dashboard');
      } else {
        navigate('/mentor/setup');
      }
    } else {
      if (user?.hasLearnerProfile) {
        navigate('/learner/dashboard');
      } else {
        navigate('/learner/setup');
      }
    }
  };

  // HomePage Header
  if (isHomePage) {
    return (
      <header className="home-header">
        <div className="header-container">
          <div className="header-logo">
            <h2>Talent Tandem</h2>
          </div>
          <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              style={{
                background: 'transparent',
                border: '2px solid #667eea',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff&bold=true`} 
                      alt={user?.firstName || 'User'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <span style={{ color: darkMode ? '#fff' : '#333', fontWeight: '500' }}>{user?.firstName || 'User'}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-login"
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-login">Log in</Link>
                <Link to="/signup" className="btn-signup">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Header
  if (isDashboard && isAuthenticated) {
    return (
      <header className="dashboard-header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="header-logo-link">
            <TLLogo width={40} height={40} />
            <div className="logo-text">
              <span className="logo-talent">Talent</span>
              <span className="logo-tandem">Tandem</span>
            </div>
          </Link>

          {/* Center - Role Toggle */}
          <div className="role-toggle-center">
            {user?.hasTeachProfile && user?.hasLearnerProfile ? (
              // Both profiles - Toggle buttons
              <>
                <button
                  onClick={() => handleRoleSwitch('mentor')}
                  className={`role-btn ${currentRole === 'mentor' ? 'active' : ''}`}
                >
                  Mentor
                </button>
                <button
                  onClick={() => handleRoleSwitch('learner')}
                  className={`role-btn ${currentRole === 'learner' ? 'active' : ''}`}
                >
                  Learner
                </button>
              </>
            ) : user?.hasTeachProfile ? (
              // Only Mentor profile
              <>
                <button className="role-btn active">Mentor</button>
                <button
                  onClick={() => handleRoleSwitch('learner')}
                  className="role-btn secondary"
                >
                  Become Learner
                </button>
              </>
            ) : user?.hasLearnerProfile ? (
              // Only Learner profile
              <>
                <button className="role-btn active">Learner</button>
                <button
                  onClick={() => handleRoleSwitch('mentor')}
                  className="role-btn secondary"
                >
                  Become Mentor
                </button>
              </>
            ) : null}
          </div>

          {/* Right - Actions */}
          <div className="header-actions">
            <NotificationCenter />
            <WalletBalance userId={user?.id} />
            <div className="user-profile-container">
              <div 
                className="user-profile-btn" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff&bold=true`} 
                  alt={user?.firstName || 'User'}
                />
                <span className="user-name">{user?.firstName || 'User'}</span>
                <span className="dropdown-arrow">{showProfileMenu ? '▲' : '▼'}</span>
              </div>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff&bold=true`} 
                      alt={user?.firstName || 'User'}
                    />
                    <div>
                      <p className="dropdown-name">{user?.firstName || 'User'}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item" onClick={() => navigate(`/profile/${user?.id}`)}>
                    <span>My Profile</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => navigate('/admin')}>
                    <span>Settings</span>
                  </button>
                  {(user?.hasTeachProfile && !user?.hasLearnerProfile) && (
                    <>
                      <div className="profile-divider"></div>
                      <button className="profile-menu-item" onClick={() => handleRoleSwitch('learner')}>
                        <span>Become a Learner</span>
                      </button>
                    </>
                  )}
                  {(user?.hasLearnerProfile && !user?.hasTeachProfile) && (
                    <>
                      <div className="profile-divider"></div>
                      <button className="profile-menu-item" onClick={() => handleRoleSwitch('mentor')}>
                        <span>Become a Mentor</span>
                      </button>
                    </>
                  )}
                  <div className="profile-divider"></div>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default header for other pages
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to={isAuthenticated ? (user?.hasTeachProfile ? '/mentor/dashboard' : '/learner/dashboard') : '/'} className="nav-logo">
          <TLLogo width={40} height={40} />
          <div className="logo-text">
            <span className="logo-talent">Talent</span>
            <span className="logo-tandem">Tandem</span>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="nav-actions">
            <NotificationCenter />
            <div className="user-menu">
              <div className="user-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=667eea&color=fff&bold=true`} 
                  alt={user?.firstName || 'User'} 
                />
              </div>
              <span className="user-name">{user?.firstName || 'User'}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;