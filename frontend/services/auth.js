/**
 * FILAHA Auth Service
 * Handles JWT token storage, retrieval, and auth flow.
 *
 * Auth flow:
 *   1. User enters credentials
 *   2. Call POST /api/auth/login
 *   3. Backend returns { access_token, user }
 *   4. Store token in localStorage
 *   5. All subsequent requests include: Authorization: Bearer <token>
 *   6. On logout: clear token
 */

const Auth = {
  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE.TOKEN) || null;
  },

  /**
   * Get stored user profile
   */
  getUser() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Store token + user after login
   */
  setSession(token, user) {
    localStorage.setItem(CONFIG.STORAGE.TOKEN, token);
    localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(user));
    localStorage.setItem(CONFIG.STORAGE.ROLE, user.role || 'farmer');
  },

  /**
   * Clear session on logout
   */
  clearSession() {
    localStorage.removeItem(CONFIG.STORAGE.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE.USER);
    localStorage.removeItem(CONFIG.STORAGE.ROLE);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Check if current user is a farmer
   */
  isFarmer() {
    const user = this.getUser();
    return user?.role === 'farmer';
  },

  /**
   * Check if current user is a distributor
   */
  isDistributor() {
    const user = this.getUser();
    return user?.role === 'distributor';
  },

  /**
   * Login with phone (farmer) or email (distributor)
   * @param {string} identifier - phone number or email
   * @param {string} password
   */
  async login(identifier, password) {
    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // data should contain: { access_token, user }
    this.setSession(data.access_token, data.user);
    return data;
  },

  /**
   * Register as farmer (phone + password)
   * @param {object} payload - { phone, password, name, region }
   */
  async registerFarmer(payload) {
    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.registerFarmer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  /**
   * Register as distributor (email + password)
   * @param {object} payload - { email, password, name, company }
   */
  async registerDistributor(payload) {
    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.registerDistributor, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  /**
   * Request OTP (for farmer password reset)
   */
  async requestOtp(phone) {
    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.otp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'OTP request failed');
    return data;
  },

  /**
   * Verify OTP
   * @param {string} phone
   * @param {string} token - the OTP code
   * @param {string} newPassword - optional, for password reset
   */
  async verifyOtp(phone, token, newPassword = null) {
    const body = { phone, token };
    if (newPassword) body.new_password = newPassword;

    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.verifyOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'OTP verification failed');
    return data;
  },

  /**
   * Logout
   */
  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.logout, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (e) {
        // ignore errors on logout
      }
    }
    this.clearSession();
  },

  /**
   * Get current user profile from backend
   */
  async fetchMe() {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.me, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch user');

    // update stored user
    localStorage.setItem(CONFIG.STORAGE.USER, JSON.stringify(data));
    return data;
  },
};

window.FILAHA_AUTH = Auth;