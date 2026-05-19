/**
 * FILAHA SVG Icon System
 * All SVG icons used across the app. Replaces inline SVG strings.
 */

const SVG_BASE = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

function svgWrap(inner) {
  return `<svg ${SVG_BASE}>${inner}</svg>`;
}

const ICONS = {
  // Navigation
  dashboard: svgWrap('<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>'),

  // Agriculture
  tractor: svgWrap('<path d="M3 17h2.2"/><path d="M9.5 8h6.5l1.8 5"/><path d="M9.5 8v5h-3"/><circle cx="8" cy="17" r="3"/><circle cx="17.5" cy="16.5" r="2.5"/><path d="M11 13h6"/>'),
  leaf: svgWrap('<path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14a3 3 0 0 1-1-1Z"/><path d="M5 19c4-4 7-6 12-7"/>'),
  water_drop: svgWrap('<path d="M12 3c-3.5 4.2-6 7.4-6 11a6 6 0 0 0 12 0c0-3.6-2.5-6.8-6-11Z"/>'),
  sun: svgWrap('<circle cx="12" cy="12" r="3.7"/><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3"/>'),
  cloud: svgWrap('<path d="M7 15.5a4 4 0 0 1 .8-7.9 5 5 0 0 1 9.7.7A3.5 3.5 0 0 1 17 15.5H7Z"/>'),
  wind: svgWrap('<path d="M3.5 9h11a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3.5 15h15a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3.5 12h7.5"/>'),
  alert: svgWrap('<path d="M5.5 17h13l-1.6-2V11a5.5 5.5 0 0 0-11 0v4l-1.4 2Z"/><path d="M10 20.2c.5.5 1.2.8 2 .8s1.5-.3 2-.8"/>'),
  chart: svgWrap('<path d="M3.5 20.5h17"/><rect x="5.5" y="11" width="3.2" height="9.5" rx="0.6"/><rect x="10.5" y="6.5" width="3.2" height="14" rx="0.6"/><rect x="15.5" y="14" width="3.2" height="6.5" rx="0.6"/>'),

  // Market
  cart: svgWrap('<path d="M3 4h2.2l2 11.2a1.5 1.5 0 0 0 1.5 1.3h9.3"/><path d="M6.6 7h14l-1.6 7.5a1.5 1.5 0 0 1-1.5 1.2H8.5"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>'),
  boxes: svgWrap('<path d="M3.5 8.5 12 5l8.5 3.5v7L12 19l-8.5-3.5v-7Z"/><path d="M3.5 8.5 12 12l8.5-3.5"/><path d="M12 12v7"/>'),
  truck: svgWrap('<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>'),

  // UI
  bell: svgWrap('<path d="M5.5 17h13l-1.6-2V11a5.5 5.5 0 0 0-11 0v4l-1.4 2Z"/><path d="M10 20.2c.5.5 1.2.8 2 .8s1.5-.3 2-.8"/>'),
  search: svgWrap('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>'),
  settings: svgWrap('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/>'),
  plus: svgWrap('<path d="M12 5v14M5 12h14"/>'),
  minus: svgWrap('<path d="M5 12h14"/>'),
  check: svgWrap('<path d="m5 12 5 5 9-11"/>'),
  x: svgWrap('<path d="M6 6l12 12M18 6 6 18"/>'),
  chevronRight: svgWrap('<path d="M9 6l6 6-6 6"/>'),
  chevronDown: svgWrap('<path d="M6 9l6 6 6-6"/>'),
  arrowRight: svgWrap('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowLeft: svgWrap('<path d="M19 12H5M11 6l-6 6 6 6"/>'),

  // Weather / trends
  trendUp: svgWrap('<path d="m4 17 6-6 4 4 6-7"/><path d="M14 8h6v6"/>'),
  trendDown: svgWrap('<path d="m4 7 6 6 4-4 6 7"/><path d="M14 16h6v-6"/>'),
  trendFlat: svgWrap('<path d="M4 12h16M14 7l6 5-6 5"/>'),

  // Misc
  user: svgWrap('<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>'),
  logout: svgWrap('<path d="M9 4.5H5a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 5 19.5h4"/><path d="m15 8 4 4-4 4M9 12h10"/>'),
  upload: svgWrap('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
  send: svgWrap('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
  pin: svgWrap('<path d="M12 21c-4-4.5-7-8-7-11.5a7 7 0 0 1 14 0c0 3.5-3 7-7 11.5Z"/><circle cx="12" cy="9.5" r="2.3"/>'),
  calendar: svgWrap('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/>'),
  warning: svgWrap('<path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h14.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="1" fill="currentColor"/>'),
  info: svgWrap('<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/>'),
  menu: svgWrap('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  globe: svgWrap('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.7 4 5.7 4 8.5s-1.5 5.8-4 8.5c-2.5-2.7-4-5.7-4-8.5s1.5-5.8 4-8.5Z"/>'),
  filter: svgWrap('<path d="M4 5h16l-6 8v6l-4-2v-4Z"/>'),
  more: svgWrap('<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>'),
  people: svgWrap('<circle cx="9" cy="8" r="3.2"/><path d="M2.8 19c.3-3.4 2.9-5.5 6.2-5.5s5.9 2.1 6.2 5.5"/><circle cx="17" cy="6.5" r="2.4"/><path d="M16 13.6c2.7.2 4.7 2 5 5.4"/>'),
  phone: svgWrap('<path d="M5 4.5h3.5l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.7 1.5A16 16 0 0 1 3.5 6.2 1.5 1.5 0 0 1 5 4.5Z"/>'),
};

window.FILAHA_ICONS = ICONS;