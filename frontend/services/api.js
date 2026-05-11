/**
 * FILAHA API Fetch Wrapper
 * All HTTP calls go through this. Automatically attaches JWT token
 * from localStorage on every request. Handles errors gracefully.
 */

const API = {
  /**
   * Make authenticated GET request
   * @param {string} endpoint
   * @param {object} options
   */
  async get(endpoint, options = {}) {
    return this._fetch(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Make authenticated POST request
   * @param {string} endpoint
   * @param {object} body
   * @param {object} options
   */
  async post(endpoint, body = {}, options = {}) {
    return this._fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Make authenticated PUT request
   */
  async put(endpoint, body = {}, options = {}) {
    return this._fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * Make authenticated DELETE request
   */
  async delete(endpoint, options = {}) {
    return this._fetch(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Core fetch wrapper — attaches token + content-type
   */
  async _fetch(endpoint, options = {}) {
    const token = Auth.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http')
      ? endpoint
      : CONFIG.API_BASE + endpoint;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401) {
          Auth.clearSession();
          // redirect to login if not already on splash
          if (window.FILAHA_APP?.currentScreen !== 'splash') {
            window.FILAHA_APP?.navigateTo('splash');
          }
        }
        throw new Error(data.error || `Request failed: ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error('[API Error]', err.message);
      throw err;
    }
  },

  /**
   * Upload file with multipart/form-data (for detection)
   * @param {string} endpoint
   * @param {FormData} formData
   */
  async upload(endpoint, formData) {
    const token = Auth.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(CONFIG.API_BASE + endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  /**
   * Health check — no auth required
   */
  async healthCheck() {
    try {
      const res = await fetch(CONFIG.API_BASE + CONFIG.ENDPOINTS.health);
      return res.ok;
    } catch {
      return false;
    }
  },
};

window.FILAHA_API = API;