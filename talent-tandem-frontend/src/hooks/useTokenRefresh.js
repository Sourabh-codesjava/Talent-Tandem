import { useEffect, useRef } from 'react';
import AuthService from '../services/auth';
import ApiService from '../services/api';

const useTokenRefresh = () => {
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) {
        return;
      }

      if (!AuthService.isAuthenticated()) {
        return;
      }

      if (AuthService.shouldRefreshToken()) {
        isCheckingRef.current = true;

        try {
          console.log('Token expiring soon, refreshing...');
          await ApiService.refreshAccessToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);

          // Only logout and redirect if refresh token is also invalid
          const refreshToken = AuthService.getRefreshToken();
          if (!refreshToken || !AuthService.isTokenValid(refreshToken)) {
            console.error('Refresh token invalid, logging out');
            AuthService.logout();
            window.location.href = '/login';
          } else {
            console.warn('Token refresh failed but refresh token still valid, will retry');
          }
        } finally {
          isCheckingRef.current = false;
        }
      }
    };

    // Check immediately on mount
    if (AuthService.isAuthenticated()) {
      checkAndRefreshToken();

      // Then check every 2 minutes (reduced from 4 minutes)
      intervalRef.current = setInterval(checkAndRefreshToken, 2 * 60 * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isCheckingRef.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  return null;
};

export default useTokenRefresh;