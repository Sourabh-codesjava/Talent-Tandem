class AuthService {
  constructor() {
    this.TOKEN_KEY = 'accessToken';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
    this.USER_DATA_KEY = 'user';
  }

  // Store tokens
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Get access token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Check if token is completely expired
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  // Validate token structure
  isTokenValid(token) {
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = this.decodeToken(token);
      return payload && payload.exp && payload.userId;
    } catch {
      return false;
    }
  }

  // Decode JWT token
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  // Get user info from token
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      // Map backend token structure to frontend expected format
      return {
        sub: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        userId: decoded.userId,
        exp: decoded.exp
      };
    } catch {
      return null;
    }
  }

  // Clear all auth data
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('tempSkill');
    localStorage.removeItem('tempLearnerSkill');
  }

  // Check if token needs refresh (expires in next 3 minutes)
  shouldRefreshToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const threeMinutesFromNow = Date.now() + (3 * 60 * 1000);
      const tokenExpiry = payload.exp * 1000;

      // Token needs refresh if it expires within 3 minutes but is not yet expired
      return tokenExpiry < threeMinutesFromNow && tokenExpiry > Date.now();
    } catch {
      return false;
    }
  }
}

export default new AuthService();