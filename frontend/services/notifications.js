/**
 * FILAHA Notifications Service
 * In-app notifications via Supabase
 *
 * Endpoints:
 *   GET    /api/notifications        → list notifications
 *   PUT    /api/notifications/:id   → mark as read
 *   PUT    /api/notifications/read-all → mark all as read
 *   DELETE /api/notifications/:id   → dismiss
 */

const Notifications = {
  async getAll(params = {}) {
    const url = CONFIG.ENDPOINTS.notifications + '?' + new URLSearchParams(params).toString();
    return API.get(url);
  },

  async markRead(id) {
    return API.put(CONFIG.ENDPOINTS.markRead(id), {});
  },

  async markAllRead() {
    return API.put(CONFIG.ENDPOINTS.markAllRead, {});
  },

  async dismiss(id) {
    return API.delete(CONFIG.ENDPOINTS.notifications + '/' + id);
  },
};

window.FILAHA_NOTIFICATIONS = Notifications;