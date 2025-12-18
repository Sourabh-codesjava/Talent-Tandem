import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.js';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletUpdateSignal, setWalletUpdateSignal] = useState(0);

  useEffect(() => {
    const initializeUser = async () => {
      // First check if we have a valid token
      if (!AuthService.isAuthenticated()) {
        AuthService.logout();
        setIsLoading(false);
        return;
      }

      const userData = localStorage.getItem('user') || localStorage.getItem('userData');
      let parsedUser = null;

      if (userData) {
        try {
          parsedUser = JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('userData');
        }
      }

      // If local storage failed or wasn't there, try token
      if (!parsedUser) {
        const tokenUser = AuthService.getUserFromToken();
        if (tokenUser) {
          parsedUser = {
            id: tokenUser.userId,
            username: tokenUser.username,
            email: tokenUser.email,
          };
        }
      }

      if (parsedUser) {
        // Check if we have cached profile status in localStorage
        const cachedHasLearner = parsedUser.hasLearnerProfile;
        const cachedHasTeach = parsedUser.hasTeachProfile;

        // If cached data exists, use it immediately
        if (cachedHasLearner !== undefined || cachedHasTeach !== undefined) {
          setUser(parsedUser);
          setIsLoading(false);
        } else {
          // Set initial user with undefined profile status so ProtectedRoute waits
          setUser({ ...parsedUser, hasLearnerProfile: undefined, hasTeachProfile: undefined });
        }

        // Now fetch the latest profile status in background
        try {
          const ApiService = (await import('../services/api')).default;

          const [learnSkills, teachSkills] = await Promise.all([
            ApiService.getLearnSkillsByUser(parsedUser.id).catch((err) => {
              console.warn('Failed to fetch learn skills:', err.message);
              return [];
            }),
            ApiService.getTeachSkillsByUser(parsedUser.id).catch((err) => {
              console.warn('Failed to fetch teach skills:', err.message);
              return [];
            })
          ]);

          const updatedUser = {
            ...parsedUser,
            hasLearnerProfile: learnSkills.length > 0,
            hasTeachProfile: teachSkills.length > 0
          };

          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        } catch (error) {
          console.warn('Failed to fetch user profile status:', error.message);
          if (error.message && error.message.includes('Session expired')) {
            console.error('Session expired during profile fetch');
            AuthService.logout();
            setUser(null);
          } else {
            // Keep user with cached profile status if fetch fails
            if (cachedHasLearner !== undefined || cachedHasTeach !== undefined) {
              setUser(parsedUser);
            } else {
              setUser({ ...parsedUser, hasLearnerProfile: false, hasTeachProfile: false });
            }
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        AuthService.logout();
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  };

  const refreshUser = async () => {
    if (!AuthService.isAuthenticated()) {
      console.warn('Cannot refresh user - not authenticated');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.warn('No user data to refresh');
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('userData');
      return;
    }

    try {
      const ApiService = (await import('../services/api')).default;

      const [learnSkills, teachSkills] = await Promise.all([
        ApiService.getLearnSkillsByUser(parsedUser.id).catch((err) => {
          console.warn('Failed to fetch learn skills:', err.message);
          return [];
        }),
        ApiService.getTeachSkillsByUser(parsedUser.id).catch((err) => {
          console.warn('Failed to fetch teach skills:', err.message);
          return [];
        })
      ]);

      const updatedUser = {
        ...parsedUser,
        hasLearnerProfile: learnSkills.length > 0,
        hasTeachProfile: teachSkills.length > 0
      };

      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.warn('Failed to refresh user profile:', error.message);
      // Only logout on actual authentication errors
      if (error.message && error.message.includes('Session expired')) {
        logout();
      } else {
        // Keep existing user data for network errors
        setUser(parsedUser);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    AuthService.logout();
  };

  // Update isAuthenticated based on token validity and user state
  useEffect(() => {
    // Check token first - if token is invalid, user is not authenticated
    const hasValidToken = AuthService.isAuthenticated();
    setIsAuthenticated(hasValidToken && !!user);
  }, [user]);

  // Listen for storage changes to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If token was removed, logout
      if (e.key === 'accessToken' && !e.newValue) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    updateUser,
    logout,
    refreshUser,
    isLoading,
    isAuthenticated,
    walletUpdateSignal,
    triggerWalletUpdate: () => setWalletUpdateSignal(prev => prev + 1)
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};