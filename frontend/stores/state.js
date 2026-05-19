/**
 * FILAHA App State
 * Central state management replacing the global STATE object.
 * All components read/write through this single store.
 */

const FILAHA_APP = {
  // ── Navigation State ────────────────────────────────────
  currentScreen: 'splash',
  farmerTab: 'home',
  distTab: 'dhome',

  // ── User State ───────────────────────────────────────────
  user: null,
  role: null, // 'farmer' | 'distributor'

  // ── Farmer Profile / Onboarding ─────────────────────────
  profile: {
    fname: '', lname: '', phone: '', password: '',
    lang: 'fr', région: 'Souss-Massa',
    commune: '', surface: '', crops: [], pack: 'both',
  },

  // ── Feature Data ─────────────────────────────────────────
  weather: null,
  et0: null,
  prices: {},
  alerts: [],
  notifications: [],
  listings: [],
  offers: [],
  diagnosisResult: null,
  diagnosisLoading: false,

  // ── UI State ─────────────────────────────────────────────
  selectedCrop: 'Tomate',
  conservExpanded: null,
  listForm: { crop: 'Tomate', qty: '', price: '', notes: '' },
  offerModal: { listingId: null, qty: 1, maxQty: 100 },
  chartInstances: {},
  mapInstance: null,
  mapMarkers: [],
  mapFilter: 'all',

  // ── Init ─────────────────────────────────────────────────
  init() {
    // Load from localStorage
    const storedProfile = localStorage.getItem(CONFIG.STORAGE.PROFILE);
    const storedRole = localStorage.getItem(CONFIG.STORAGE.ROLE);
    const storedListings = localStorage.getItem(CONFIG.STORAGE.LISTINGS);
    const storedOffers = localStorage.getItem(CONFIG.STORAGE.OFFERS);
    const storedLang = localStorage.getItem(CONFIG.STORAGE.LANG);

    if (storedProfile) {
      try { this.profile = { ...this.profile, ...JSON.parse(storedProfile) }; } catch {}
    }
    if (storedLang) this.profile.lang = storedLang;
    if (storedListings) {
      try { this.listings = JSON.parse(storedListings); } catch {}
    }
    if (storedOffers) {
      try { this.offers = JSON.parse(storedOffers); } catch {}
    }

    // Init i18n
    I18n.init();
    I18n.set(this.profile.lang || 'fr');

    // Apply RTL/LTR
    this._applyDirection();

    // Check for existing session
    const token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
    if (token) {
      this.user = Auth.getUser();
      this.role = this.user?.role || storedRole;
      if (this.role === 'farmer') {
        this.navigateTo('farmer');
        this.farmerTab = 'home';
      } else if (this.role === 'distributor') {
        this.navigateTo('distributor');
        this.distTab = 'dhome';
      }
    }
  },

  _applyDirection() {
    const dir = I18n.current === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', I18n.current);
    document.body.style.fontFamily = I18n.current === 'ar'
      ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
      : "'Manrope', 'Segoe UI', sans-serif";
  },

  // ── Persistence ───────────────────────────────────────────
  save() {
    localStorage.setItem(CONFIG.STORAGE.PROFILE, JSON.stringify(this.profile));
    localStorage.setItem(CONFIG.STORAGE.LISTINGS, JSON.stringify(this.listings));
    localStorage.setItem(CONFIG.STORAGE.OFFERS, JSON.stringify(this.offers));
    localStorage.setItem(CONFIG.STORAGE.LANG, this.profile.lang);
  },

  // ── Navigation ───────────────────────────────────────────
  navigateTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screen);
    if (el) el.classList.add('active');
    this.currentScreen = screen;
    window.scrollTo(0, 0);
  },

  navigateToFarmerTab(tab) {
    this.farmerTab = tab;
    this.renderFarmerUI();
    this.fetchDataForTab(tab);
  },

  navigateToDistTab(tab) {
    this.distTab = tab;
    this.renderDistUI();
  },

  // ── Auth ──────────────────────────────────────────────────
  async handleLogin(identifier, password) {
    try {
      await Auth.login(identifier, password);
      this.user = Auth.getUser();
      this.role = this.user.role;

      if (this.role === 'farmer') {
        this.navigateTo('farmer');
        this.farmerTab = 'home';
        this.renderFarmerUI();
        this.fetchWeather();
      } else {
        this.navigateTo('distributor');
        this.distTab = 'dhome';
        this.renderDistUI();
      }
    } catch (err) {
      throw err;
    }
  },

  async handleLogout() {
    await Auth.logout();
    this.user = null;
    this.role = null;
    this.navigateTo('splash');
  },

  // ── Data Fetching ─────────────────────────────────────────
  async fetchWeather() {
    const coords = CONFIG.REGIONS[this.profile.région] || CONFIG.REGIONS['Souss-Massa'];
    const [lat, lng] = coords;
    try {
      const data = await Irrigation.getWeather(lat, lng);
      this.weather = data;
      const et0 = data.daily?.et0_fao_evapotranspiration?.[0];
      this.et0 = et0 ? parseFloat(et0.toFixed(2)) : 4.2;
      this.renderFarmerTab('home');
      this.renderFarmerTab('irrigation');
    } catch {
      this.et0 = 4.2;
    }
  },

  async fetchMarketPrice(crop) {
    try {
      const data = await Market.getPrice(crop);
      this.prices[crop] = data;
      return data;
    } catch {
      return null;
    }
  },

  async fetchListings() {
    try {
      this.listings = await Market.getListings();
      this.save();
    } catch {}
  },

  async fetchOffers() {
    try {
      this.offers = await Market.getOffers();
      this.save();
    } catch {}
  },

  async fetchAlerts() {
    try {
      const coords = CONFIG.REGIONS[this.profile.région] || [30.42, -9.60];
      this.alerts = await Community.getAlerts({ lat: coords[0], lng: coords[1] });
    } catch {}
  },

  async fetchNotifications() {
    try {
      this.notifications = await Notifications.getAll();
    } catch {}
  },

  fetchDataForTab(tab) {
    switch (tab) {
      case 'home': this.fetchWeather(); break;
      case 'irrigation': this.fetchWeather(); break;
      case 'prix': this.fetchMarketPrice(this.selectedCrop); break;
      case 'offres': this.fetchOffers(); break;
      case 'alertes': this.fetchAlerts(); break;
    }
  },

  // ── Render Delegation ─────────────────────────────────────
  renderFarmerUI() {
    // sidebar active states
    document.querySelectorAll('#screen-farmer .sb-link').forEach(l => {
      l.classList.toggle('active', l.dataset.tab === this.farmerTab);
    });
    document.querySelectorAll('#screen-farmer .bnav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === this.farmerTab);
    });
    document.querySelectorAll('#farmer-page .tab-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById('tab-' + this.farmerTab);
    if (pane) {
      pane.classList.add('active');
      pane.classList.add('page-enter');
      setTimeout(() => pane.classList.remove('page-enter'), 300);
    }
    this.updateFarmerTopbar();
  },

  renderDistUI() {
    document.querySelectorAll('#screen-distributor .sb-link').forEach(l => {
      l.classList.toggle('active', l.dataset.tab === this.distTab);
    });
    document.querySelectorAll('#screen-distributor .bnav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === this.distTab);
    });
    document.querySelectorAll('#dist-page .tab-pane').forEach(p => p.classList.remove('active'));
    const pane = document.getElementById('tab-' + this.distTab);
    if (pane) {
      pane.classList.add('active');
      pane.classList.add('page-enter');
      setTimeout(() => pane.classList.remove('page-enter'), 300);
    }
    this.updateDistTopbar();
  },

  updateFarmerTopbar() {
    const TITLES = {
      home: 'Accueil', irrigation: 'Irrigation ET₀', diagnostic: 'Diagnostic IA',
      alertes: 'Alertes', prix: 'Prix du marché', conservation: 'Conservation',
      lister: 'Lister une récolte', offres: 'Offres reçues',
      stats: 'Statistiques', messages: 'Communauté',
    };
    const SUBS = {
      home: 'Vue d\'ensemble de votre exploitation', irrigation: 'Évapotranspiration & besoins en eau',
      diagnostic: 'Analysez vos plantes par photo', alertes: 'Alertes phytosanitaires & météo',
      prix: 'Cours en temps réel', conservation: 'Guide de stockage post-récolte',
      lister: 'Publiez votre récolte sur le marché', offres: 'Gérez les offres des distributeurs',
      stats: 'Vos performances agricoles', messages: 'Réseau agricole Filaha',
    };
    document.getElementById('farmer-tb-title').textContent = TITLES[this.farmerTab] || this.farmerTab;
    document.getElementById('farmer-tb-sub').textContent = SUBS[this.farmerTab] || '';
  },

  updateDistTopbar() {
    const TITLES = {
      dhome: 'Tableau de bord', dcarte: 'Carte des récoltes', dlistings: 'Catalogues',
      doffres: 'Mes offres', dcommandes: 'Commandes',
    };
    const SUBS = {
      dhome: 'Vue distributeur', dcarte: 'Offres disponibles sur la carte',
      dlistings: 'Explorer les récoltes disponibles',
      doffres: 'Offres que vous avez envoyées', dcommandes: 'Commandes en cours et historique',
    };
    document.getElementById('dist-tb-title').textContent = TITLES[this.distTab] || this.distTab;
    document.getElementById('dist-tb-sub').textContent = SUBS[this.distTab] || '';
  },

  // ── Tab Rendering (delegates to renderers) ────────────────
  renderFarmerTab(tab) {
    switch (tab) {
      case 'home': AppRenderers.renderHome(); break;
      case 'irrigation': AppRenderers.renderIrrigation(); break;
      case 'diagnostic': AppRenderers.renderDiagnostic(); break;
      case 'alertes': AppRenderers.renderAlertes(); break;
      case 'prix': AppRenderers.renderPrix(); break;
      case 'conservation': AppRenderers.renderConservation(); break;
      case 'lister': AppRenderers.renderLister(); break;
      case 'offres': AppRenderers.renderOffres(); break;
      case 'stats': AppRenderers.renderStats(); break;
      case 'messages': AppRenderers.renderMessages(); break;
    }
  },

  renderDistTab(tab) {
    switch (tab) {
      case 'dhome': AppRenderers.renderDistHome(); break;
      case 'dcarte': AppRenderers.renderDistMap(); break;
      case 'dlistings': AppRenderers.renderDistListings(); break;
      case 'doffres': AppRenderers.renderDistOffers(); break;
      case 'dcommandes': AppRenderers.renderDistCommandes(); break;
    }
  },
};

window.FILAHA_APP = FILAHA_APP;

// ── App Renderers ──────────────────────────────────────────────
// All tab renderers live here. Keep them separate from state.
const AppRenderers = {
  // Reuse ICONS from original HTML
  getIcon(name) {
    return window.FILAHA_ICONS?.[name] || '';
  },

  getT() {
    return window.FILAHA_I18N?.[FILAHA_APP.profile.lang] || {};
  },
};

window.AppRenderers = AppRenderers;