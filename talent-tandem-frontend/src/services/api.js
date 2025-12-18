import AuthService from './auth.js';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  subscribeTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  onTokenRefreshed(token) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = AuthService.getToken();

    // Don't send token for public endpoints
    const isPublicEndpoint = endpoint.includes('/auth/signup') || endpoint.includes('/auth/verify-otp') || endpoint.includes('/auth/resend-otp') || endpoint.includes('/auth/login');

    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(!isPublicEndpoint && token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      signal: AbortSignal.timeout(45000),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && endpoint !== '/auth/refresh') {
        const refreshToken = AuthService.getRefreshToken();
        if (!refreshToken) {
          AuthService.logout();
          throw new Error('Session expired. Please login again.');
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh((newToken) => {
              if (newToken) {
                const retryConfig = { ...config, headers: { ...config.headers, Authorization: `Bearer ${newToken}` } };
                fetch(url, retryConfig)
                  .then(res => res.ok ? res.json() : reject(new Error('Request failed after token refresh')))
                  .then(resolve).catch(reject);
              } else {
                reject(new Error('Token refresh failed'));
              }
            });
          });
        }

        this.isRefreshing = true;
        try {
          await this.refreshAccessToken();
          const newToken = AuthService.getToken();
          this.isRefreshing = false;
          this.onTokenRefreshed(newToken);

          if (newToken) {
            const retryConfig = { ...config, headers: { ...config.headers, Authorization: `Bearer ${newToken}` } };
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              return await retryResponse.json().catch(() => ({}));
            }
          }
        } catch (refreshError) {
          this.isRefreshing = false;
          this.onTokenRefreshed(null);
          console.error('Token refresh failed:', refreshError);
          AuthService.logout();
          throw new Error('Session expired. Please login again.');
        }

        AuthService.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Extract detailed validation errors if present
        let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage += '\n' + errorData.errors.join('\n');
        } else if (errorData.errors && typeof errorData.errors === 'object') {
          errorMessage += '\n' + Object.values(errorData.errors).join('\n');
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json().catch(() => ({}));
      return responseData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.request(endpoint, options, retryCount + 1);
        }
        throw new Error('Unable to connect to server. Please check your connection and try again.');
      }

      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        if (retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request(endpoint, options, retryCount + 1);
        }
        throw new Error('Server is not responding. Please try again later.');
      }

      if (error.message === 'Session expired. Please login again.' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      throw error;
    }
  }

  async register(userData) {
    const response = await this.request('/user/register', { method: 'POST', body: JSON.stringify(userData) });
    if (response.id) return { success: true, ...response };
    return { success: false, message: response.message || 'Registration failed' };
  }

  async login(credentials) {
    const response = await this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    if (response.status && response.accessToken) {
      try {
        AuthService.setTokens(response.accessToken, response.refreshToken);
        localStorage.setItem('user', JSON.stringify({ id: response.id, username: response.username, email: response.email }));
      } catch (storageError) {
        throw new Error('Failed to complete login. Please try again.');
      }
    }
    return response;
  }

  async refreshAccessToken() {
    const refreshToken = AuthService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await this.request('/auth/refresh', { method: 'POST', headers: { 'Authorization': `Bearer ${refreshToken}`, 'Content-Type': 'application/json' } });
    if (response.accessToken) AuthService.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(token) {
    return this.request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ token }) });
  }

  async updateProfile(userId, profileData, profileImage) {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) formData.append(key, profileData[key]);
    });
    if (profileImage) formData.append('profileImage', profileImage);
    const token = AuthService.getToken();
    const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
      method: 'POST',
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getUserProfile(userId) {
    return this.request(`/user/profile/${userId}`);
  }

  async getAllSkills() {
    const cacheKey = 'all-skills';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    const skills = await this.request('/skill/all');
    const mapped = skills.map(skill => ({ ...skill, name: skill.skillName }));
    this.cache.set(cacheKey, { data: mapped, timestamp: Date.now() });
    return mapped;
  }

  async getSkillNames() {
    return this.request('/skill/getSkills');
  }

  async addSkill(skillData) {
    return this.request('/skill/add', { method: 'POST', body: JSON.stringify(skillData) });
  }

  async addSkillBatch(skillsArray) {
    return this.request('/skill/add-batch', { method: 'POST', body: JSON.stringify(skillsArray) });
  }

  async normalizeSkills(rawSkills) {
    return this.request('/skill/normalize', { method: 'POST', body: JSON.stringify(rawSkills) });
  }

  async getSkillById(skillId) {
    return this.request(`/skill/${skillId}`);
  }

  async startSession(sessionId) {
    return this.request(`/sessions/start/${sessionId}`, { method: 'POST' });
  }

  async completeSession(sessionId) {
    return this.request(`/sessions/complete/${sessionId}`, { method: 'POST' });
  }

  async getLearnSkillsByUser(userId) {
    const cacheKey = `learn-skills-${userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 sec cache
      return cached.data;
    }
    const data = await this.request(`/learn-skill/user/${userId}`);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getTeachSkillsByUser(userId) {
    const cacheKey = `teach-skills-${userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 sec cache
      return cached.data;
    }
    const data = await this.request(`/teach-skill/user/${userId}`);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async submitFeedback(feedbackData) {
    return this.request('/api/feedback/submit', { method: 'POST', body: JSON.stringify(feedbackData) });
  }

  async getWallet(userId) {
    // If userId is provided, fetch specifically for that user (admin/debugging), otherwise default to current user
    const endpoint = userId ? `/api/wallet/user/${userId}` : '/api/wallet';
    return this.request(endpoint);
  }

  async creditCoins(userId, amount) {
    return this.request(`/api/wallet/credit/${userId}?coins=${amount}`, { method: 'POST' });
  }

  async debitCoins(userId, amount) {
    return this.request(`/api/wallet/debit/${userId}?coins=${amount}`, { method: 'POST' });
  }

  async checkCoins(userId, requiredCoins) {
    return this.request(`/api/wallet/check/${userId}?requiredCoins=${requiredCoins}`);
  }

  async findMentors(searchData) {
    console.log('🔍 findMentors calling /match-engine/find with:', searchData);
    const response = await this.request('/match-engine/find', { method: 'POST', body: JSON.stringify(searchData) });
    console.log('📦 findMentors received response:', response);
    // Extract matches array from wrapped response format
    return response.matches || response;
  }

  async addLearnSkill(skillData) {
    const result = await this.request('/learn-skill/add', { method: 'POST', body: JSON.stringify(skillData) });
    this.cache.delete(`learn-skills-${skillData.userId}`); // Clear cache
    return result;
  }

  async updateLearnSkill(skillId, skillData) {
    return this.request(`/learn-skill/update/${skillId}`, { method: 'POST', body: JSON.stringify(skillData) });
  }

  async deleteLearnSkill(skillId) {
    const result = await this.request(`/learn-skill/${skillId}`, { method: 'DELETE' });
    // Clear all learn-skills cache
    for (const key of this.cache.keys()) {
      if (key.startsWith('learn-skills-')) this.cache.delete(key);
    }
    return result;
  }

  async addTeachSkill(skillData) {
    const result = await this.request('/teach-skill/add', { method: 'POST', body: JSON.stringify(skillData) });
    this.cache.delete(`teach-skills-${skillData.userId}`); // Clear cache
    return result;
  }

  async deleteTeachSkill(skillId) {
    const result = await this.request(`/teach-skill/${skillId}`, { method: 'DELETE' });
    // Clear all teach-skills cache
    for (const key of this.cache.keys()) {
      if (key.startsWith('teach-skills-')) this.cache.delete(key);
    }
    return result;
  }

  async bookSession(sessionData) {
    return this.request('/sessions/book', { method: 'POST', body: JSON.stringify(sessionData) });
  }

  async getUserSessions(userId) {
    return this.request(`/sessions/user/${userId}`);
  }

  async updateSessionStatus(sessionId, status) {
    return this.request(`/sessions/${sessionId}/status?status=${status}`, { method: 'PUT' });
  }

  async sendPreChatMessage(messageData) {
    return this.request('/api/chat/send', { method: 'POST', body: JSON.stringify(messageData) });
  }

  async getPreChatMessages(sessionId) {
    return this.request(`/api/chat/${sessionId}`);
  }

  async getSession(sessionId) {
    return this.request(`/sessions/${sessionId}`);
  }

  async selectRole(roleData) {
    return this.request('/user/select-role', { method: 'POST', body: JSON.stringify(roleData) });
  }

  async verifyOtp(otpData) {
    return this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(otpData) });
  }

  async resendOtp(emailData) {
    return this.request('/auth/resend-otp', { method: 'POST', body: JSON.stringify(emailData) });
  }

  async signupStep1(emailData) {
    return this.request('/auth/signup/step1', { method: 'POST', body: JSON.stringify(emailData) });
  }

  async completeSignup(signupData) {
    return this.request('/auth/signup/complete', { method: 'POST', body: JSON.stringify(signupData) });
  }

  async getMentorRating(mentorId) {
    return this.request(`/api/feedback/mentors/${mentorId}/rating`);
  }

  async getFeedbacksReceivedByUser(userId) {
    return this.request(`/api/feedback/received/${userId}`);
  }

  async getFeedbackBySession(sessionId) {
    return this.request(`/api/feedback/session/${sessionId}`);
  }

  async completeLearnerSetup(userId) {
    return this.request(`/api/wallet/credit/${userId}?coins=100`, { method: 'POST' });
  }

  async getUserById(userId) {
    return this.request(`/user/profile/${userId}`);
  }

  // Tag Management APIs
  async getAllTags() {
    return this.request('/tag/all');
  }

  async addTag(tagData) {
    return this.request('/tag/add', { method: 'POST', body: JSON.stringify(tagData) });
  }

  async getTagsBySkill(skillId) {
    return this.request(`/tag/skill/${skillId}`);
  }

  // Admin APIs
  async getAllUsers() {
    return this.request('/user/all');
  }

  async getAllSessions() {
    return this.request('/sessions/all');
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getTopMentors(limit = 10) {
    return this.request(`/user/top-mentors?limit=${limit}`);
  }
}

export default new ApiService();
