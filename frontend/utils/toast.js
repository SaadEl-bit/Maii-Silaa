/**
 * FILAHA Toast Notification System
 *
 * Usage:
 *   Toast.show('Operation successful!', 'success');
 *   Toast.error('Something went wrong');
 *   Toast.info('New offer received', { duration: 5000 });
 */

const Toast = {
  /**
   * Show a toast message
   * @param {string} message
   * @param {string} type - 'success' | 'error' | 'info' | 'warning'
   * @param {object} opts - { duration, direction }
   */
  show(message, type = 'success', opts = {}) {
    const el = document.getElementById('toast');
    if (!el) return;

    const duration = opts.duration ?? 3500;

    el.textContent = message;
    el.className = 'show';

    if (type === 'error') {
      el.style.background = 'var(--neg)';
    } else if (type === 'warning') {
      el.style.background = 'var(--warn)';
    } else if (type === 'info') {
      el.style.background = 'var(--b600)';
    } else {
      el.style.background = 'var(--canopy)';
    }

    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this.hide(), duration);
  },

  success(message, opts = {}) {
    this.show(message, 'success', opts);
  },

  error(message, opts = {}) {
    this.show(message, 'error', { duration: 5000, ...opts });
  },

  warning(message, opts = {}) {
    this.show(message, 'warning', opts);
  },

  info(message, opts = {}) {
    this.show(message, 'info', opts);
  },

  hide() {
    const el = document.getElementById('toast');
    if (!el) return;
    el.classList.remove('show');
  },
};

// WhatsApp-style notification popup (from original HTML)
const WANotification = {
  show(message, duration = 4000) {
    const el = document.getElementById('wa-notif');
    const txt = document.getElementById('wa-notif-txt');
    const time = document.getElementById('wa-notif-time');
    if (!el) return;

    txt.textContent = message;
    time.textContent = new Date().toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });

    el.classList.remove('hiding');
    el.classList.add('visible');

    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.classList.remove('visible', 'hiding'), 300);
    }, duration);
  },

  hide() {
    const el = document.getElementById('wa-notif');
    if (!el) return;
    el.classList.add('hiding');
    setTimeout(() => el.classList.remove('visible', 'hiding'), 300);
  },
};

window.FILAHA_TOAST = Toast;
window.FILAHA_WA = WANotification;