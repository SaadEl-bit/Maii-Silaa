/**
 * FILAHA App Controller
 * Main application entry point — handles initialization, navigation,
 * auth flow, i18n, and cross-module coordination.
 */

const App = {
  // ── Init ──────────────────────────────────────────────────
  async init() {
    // Initialize state (loads from localStorage, checks session)
    FILAHA_APP.init();

    // Render the correct screen based on auth state
    if (FILAHA_APP.role === 'farmer') {
      this._renderFarmerDashboard();
    } else if (FILAHA_APP.role === 'distributor') {
      this._renderDistributorDashboard();
    } else {
      // No session — show splash
      this.showScreen('splash');
    }

    // Apply direction (LTR/RTL)
    this._applyDirection();

    // Setup global click delegation for role page cards
    this._setupRolePageListeners();
  },

  // ── Navigation ────────────────────────────────────────────
  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screen);
    if (el) {
      el.classList.add('active');
      // Re-render if it's a dashboard (tab content may need refresh)
      if (screen === 'farmer') {
        this._renderFarmerDashboard();
      } else if (screen === 'distributor') {
        this._renderDistributorDashboard();
      }
    }
    FILAHA_APP.currentScreen = screen;
    window.scrollTo(0, 0);
    this._updateTitle(screen);
  },

  navigateTo(screen) {
    this.showScreen(screen);
  },

  showRolePage() {
    // Reset role selection state
    document.querySelectorAll("#screen-role .rs-card").forEach(c => c.classList.remove("picked"));
    document.querySelectorAll(".rs-radio").forEach(r => {
      r.innerHTML = "";
      r.style.background = "";
    });
    const btn = document.getElementById("rs-continue-btn");
    if (btn) btn.disabled = true;

    // Hide any visible register forms
    const farmerReg = document.getElementById("farmer-register");
    const distReg = document.getElementById("distributor-register");
    if (farmerReg) farmerReg.style.display = "none";
    if (distReg) distReg.style.display = "none";

    // Clear auth status
    const statusEl = document.getElementById("auth-status");
    if (statusEl) { statusEl.style.display = "none"; statusEl.textContent = ""; }

    this.showScreen("role");
  },

  // ── Role Selection ────────────────────────────────────────
  pickRole(role) {
    // Visual feedback
    document.querySelectorAll('#screen-role .rs-card').forEach(c => c.classList.remove('picked'));
    const card = role === 'farmer' ? document.getElementById('card-farmer') : document.getElementById('card-dist');
    if (card) card.classList.add('picked');

    // Update radio buttons
    const radio = role === 'farmer' ? document.getElementById('radio-farmer') : document.getElementById('radio-dist');
    document.querySelectorAll('.rs-radio').forEach(r => {
      r.innerHTML = '';
      r.style.background = '';
    });
    if (radio) {
      radio.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-11"/></svg>';
      radio.style.background = 'var(--amber)';
      radio.style.borderColor = 'var(--amber)';
    }

    // Enable continue button
    const btn = document.getElementById('rs-continue-btn');
    if (btn) btn.disabled = false;
  },

  continueRole() {
    // Navigate to onboarding (farmer) or auth (distributor)
    const chosenRole = document.getElementById('card-farmer')?.classList.contains('picked') ? 'farmer' :
                       document.getElementById('card-dist')?.classList.contains('picked') ? 'distributor' : null;

    if (!chosenRole) {
      FILAHA_TOAST.show('Veuillez choisir un rôle', 'warning');
      return;
    }

    FILAHA_APP.role = chosenRole;

    if (chosenRole === 'farmer') {
      this.showScreen('onboarding');
      this._renderOnboardingStep();
    } else {
      this.showScreen('auth');
      this._showRoleRegisterForm();
    }
  },

  // ── Onboarding ────────────────────────────────────────────
  _renderOnboardingStep() {
    const container = document.getElementById('ob-step-container');
    if (!container) return;
    container.innerHTML = Splash.render().includes('screen-splash')
      ? ''  // fallback
      : Onboarding.renderFarmerOnboarding();
  },

  // ── Auth Flow ─────────────────────────────────────────────
  async handleLogin(identifier, password) {
    // Allow calling from onclick without args — read from inputs
    identifier = identifier || document.getElementById("auth-identifier")?.value?.trim();
    password = password || document.getElementById("auth-password")?.value?.trim();

    const loginBtn = document.getElementById("auth-login-btn");
    try {
      const statusEl = document.getElementById("auth-status");
      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.color = "var(--warn)";
        statusEl.textContent = "Connexion en cours…";
      }
      if (loginBtn) { loginBtn.textContent = "Connexion…"; loginBtn.disabled = true; }

      await FILAHA_APP.handleLogin(identifier, password);

      if (statusEl) {
        statusEl.style.color = "var(--pos)";
        statusEl.textContent = "Connexion réussie ! Redirection…";
      }

      Toast.success(I18n.t("auth.login_success", "Connexion réussie !"));

      setTimeout(() => {
        if (FILAHA_APP.role === "farmer") {
          this._renderFarmerDashboard();
          this.showScreen("farmer");
        } else {
          this._renderDistributorDashboard();
          this.showScreen("distributor");
        }
      }, 500);
    } catch (err) {
      const statusEl = document.getElementById("auth-status");
      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.color = "var(--neg)";
        statusEl.textContent = I18n.t("auth.invalid_credentials", err.message);
      }
      Toast.error(err.message || I18n.t("auth.invalid_credentials", "Identifiants incorrects"));
    } finally {
      if (loginBtn) { loginBtn.textContent = I18n.t("auth.login", "Connexion"); loginBtn.disabled = false; }
    }
  },

  async handleRegisterFarmer() {
    const phone = document.getElementById('reg-farmer-phone')?.value?.trim();
    const name = document.getElementById('reg-farmer-name')?.value?.trim();
    const password = document.getElementById('reg-farmer-password')?.value?.trim();
    const region = document.getElementById('reg-farmer-region')?.value || 'Souss-Massa';

    if (!phone || !name || !password) {
      Toast.error(I18n.t('common.error', 'Veuillez remplir tous les champs'));
      return;
    }

    const btn = document.getElementById('auth-register-farmer-btn');
    const statusEl = document.getElementById('auth-status');
    try {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--warn)';
        statusEl.textContent = 'Inscription en cours…';
      }
      if (btn) { btn.textContent = I18n.t('auth.loading'); btn.disabled = true; }

      await Auth.registerFarmer({ phone, password, name, region });

      if (statusEl) {
        statusEl.style.color = 'var(--pos)';
        statusEl.textContent = I18n.t('auth.registration_success');
      }
      Toast.success(I18n.t('auth.registration_success', 'Inscription réussie !'));

      // Auto-login after registration
      setTimeout(() => {
        this.handleLogin(phone, password);
      }, 800);
    } catch (err) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--neg)';
        statusEl.textContent = err.message;
      }
      Toast.error(err.message);
    } finally {
      if (btn) { btn.textContent = I18n.t('auth.register_farmer'); btn.disabled = false; }
    }
  },
  async handleRegisterDistributor() {
    const email = document.getElementById('reg-dist-email')?.value?.trim();
    const name = document.getElementById('reg-dist-name')?.value?.trim();
    const password = document.getElementById('reg-dist-password')?.value?.trim();

    if (!email || !name || !password) {
      Toast.error(I18n.t('common.error', 'Veuillez remplir tous les champs'));
      return;
    }

    const btn = document.getElementById('auth-register-dist-btn');
    const statusEl = document.getElementById('auth-status');
    try {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--warn)';
        statusEl.textContent = 'Inscription en cours…';
      }

      await Auth.registerDistributor({ email, password, name, company: name });

      if (statusEl) {
        statusEl.style.color = 'var(--pos)';
        statusEl.textContent = I18n.t('auth.registration_success');
      }
      Toast.success(I18n.t('auth.registration_success', 'Inscription réussie !'));
    } finally {
      if (btn) { btn.textContent = I18n.t('auth.register_distributor'); btn.disabled = false; }
    }

      // Auto-login after registration
      setTimeout(() => {
        this.handleLogin(email, password);
      }, 800);
    } catch (err) {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--neg)';
        statusEl.textContent = err.message;
      }
      Toast.error(err.message);
    }
  },

  async handleLogout() {
    await FILAHA_APP.handleLogout();
    this.showScreen('splash');
  },

  // ── Toggle Register Forms ──────────────────────────────────
  _showRoleRegisterForm() {
    const farmerReg = document.getElementById("farmer-register");
    const distReg = document.getElementById("distributor-register");
    const role = FILAHA_APP.role;
    if (farmerReg) farmerReg.style.display = role === "farmer" ? "block" : "none";
    if (distReg) distReg.style.display = role === "distributor" ? "block" : "none";
  },

  // ── i18n ───────────────────────────────────────────────────
  setLang(lang) {
    I18n.set(lang);
    this._applyTranslations();
    this._applyDirection();
    FILAHA_APP.profile.lang = lang;
    FILAHA_APP.save();

    // Re-render current screen content
    if (FILAHA_APP.currentScreen === 'farmer') {
      this._renderFarmerDashboard();
    } else if (FILAHA_APP.currentScreen === 'distributor') {
      this._renderDistributorDashboard();
    } else if (FILAHA_APP.currentScreen === 'splash') {
      // Re-render splash if needed
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

  _applyTranslations() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translated = I18n.t(key);
        if (translated !== key) {
          el.textContent = translated;
        }
      }
    });
  },

  // ── Dynamic Title ──────────────────────────────────────────
  _updateTitle(screen) {
    const titles = {
      splash: 'Filaha · فلاحة',
      role: 'Qui êtes-vous ? · Filaha',
      auth: 'Connexion · Filaha',
      onboarding: 'Bienvenue ! · Filaha',
      farmer: 'FILAHA · Accueil',
      distributor: 'FILAHA · Distributeur',
    };
    document.title = titles[screen] || 'Filaha';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]') ||
      document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = `Filaha — Plateforme agricole connectant ${I18n.current === 'ar' ? 'المزارعين' : 'agriculteurs'} et distributeurs.`;
    if (!metaDesc.parentElement) document.head.appendChild(metaDesc);
  },

  // ── Dashboard Rendering ────────────────────────────────────
  _renderFarmerDashboard() {
    const sidebar = document.getElementById('farmer-sidebar');
    const name = FILAHA_APP.profile.fname || FILAHA_APP.user?.name || 'F';
    const initial = name.charAt(0).toUpperCase();

    // Update avatar initials
    const avatar = document.getElementById('farmer-avatar');
    const topAvatar = document.getElementById('farmer-top-avatar');
    if (avatar) avatar.textContent = initial;
    if (topAvatar) topAvatar.textContent = initial;
    const nameEl = document.getElementById('farmer-user-name');
    if (nameEl) nameEl.textContent = name;

    // Render active tab content
    const tab = FILAHA_APP.farmerTab || 'home';

    // Render each active tab pane
    const panes = ['home', 'irrigation', 'diagnostic', 'alertes', 'prix', 'conservation', 'lister', 'offres', 'stats', 'messages'];
    panes.forEach(p => {
      const el = document.getElementById('tab-' + p);
      if (!el) return;
      try {
        const html = FarmerTabs['render' + p.charAt(0).toUpperCase() + p.slice(1)]?.();
        if (html) el.innerHTML = html;
      } catch (e) {
        console.error(`Error rendering farmer tab ${p}:`, e);
      }
    });

    // Set active tab class
    document.querySelectorAll('#farmer-page .tab-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById('tab-' + tab);
    if (activePane) {
      activePane.classList.add('active');
      activePane.classList.add('page-enter');
      setTimeout(() => activePane.classList.remove('page-enter'), 300);
    }

    // Sidebar active state
    document.querySelectorAll('#farmer-sidebar .sb-link').forEach(l => {
      l.classList.toggle('active', l.dataset.tab === tab);
    });

    // Topbar titles
    const TITLES = {
      home: 'Accueil', irrigation: 'Irrigation ET₀', diagnostic: 'Diagnostic IA',
      alertes: 'Alertes', prix: 'Prix du marché', conservation: 'Conservation',
      lister: 'Lister une récolte', offres: 'Offres reçues',
      stats: 'Statistiques', messages: 'Communauté',
    };
    const SUBS = {
      home: "Vue d'ensemble de votre exploitation",
      irrigation: 'Évapotranspiration & besoins en eau',
      diagnostic: 'Analysez vos plantes par photo',
      alertes: 'Alertes phytosanitaires & météo',
      prix: 'Cours en temps réel',
      conservation: 'Guide de stockage post-récolte',
      lister: 'Publiez votre récolte sur le marché',
      offres: 'Gérez les offres des distributeurs',
      stats: 'Vos performances agricoles',
      messages: 'Réseau agricole Filaha',
    };

    const tbTitle = document.getElementById('farmer-tb-title');
    const tbSub = document.getElementById('farmer-tb-sub');
    if (tbTitle) tbTitle.textContent = TITLES[tab] || tab;
    if (tbSub) tbSub.textContent = SUBS[tab] || '';

    // Render ET₀ chart if on irrigation tab
    if (tab === 'irrigation') {
      renderEt0Chart();
    }
    if (tab === 'prix') {
      renderPriceChart(FILAHA_APP.selectedCrop || 'Tomate');
    }
  },

  _renderDistributorDashboard() {
    const name = FILAHA_APP.user?.name || 'Distributeur';
    const initial = name.charAt(0).toUpperCase();

    const avatar = document.getElementById('dist-avatar');
    const topAvatar = document.getElementById('dist-top-avatar');
    if (avatar) avatar.textContent = initial;
    if (topAvatar) topAvatar.textContent = initial;
    const nameEl = document.getElementById('dist-user-name');
    if (nameEl) nameEl.textContent = name;

    const tab = FILAHA_APP.distTab || 'dhome';

    // Render each tab pane
    const panes = ['dhome', 'dcarte', 'dlistings', 'doffres', 'dcommandes'];
    panes.forEach(p => {
      const el = document.getElementById('tab-' + p);
      if (!el) return;
      try {
        const html = DistTabs['renderDist' + p.charAt(1).toUpperCase() + p.slice(2)]?.();
        if (html) el.innerHTML = html;
      } catch (e) {
        console.error(`Error rendering dist tab ${p}:`, e);
      }
    });

    // Set active tab
    document.querySelectorAll('#dist-page .tab-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById('tab-' + tab);
    if (activePane) {
      activePane.classList.add('active');
      activePane.classList.add('page-enter');
      setTimeout(() => activePane.classList.remove('page-enter'), 300);
    }

    // Sidebar active state
    document.querySelectorAll('#dist-sidebar .sb-link').forEach(l => {
      l.classList.toggle('active', l.dataset.tab === tab);
    });

    // Topbar titles
    const TITLES = {
      dhome: 'Tableau de bord', dcarte: 'Carte des récoltes',
      dlistings: 'Catalogues', doffres: 'Mes offres', dcommandes: 'Commandes',
    };
    const SUBS = {
      dhome: 'Vue distributeur',
      dcarte: 'Offres disponibles sur la carte',
      dlistings: 'Explorer les récoltes disponibles',
      doffres: 'Offres que vous avez envoyées',
      dcommandes: 'Commandes en cours et historique',
    };

    const tbTitle = document.getElementById('dist-tb-title');
    const tbSub = document.getElementById('dist-tb-sub');
    if (tbTitle) tbTitle.textContent = TITLES[tab] || tab;
    if (tbSub) tbSub.textContent = SUBS[tab] || '';
  },

  // ── Event Delegation ──────────────────────────────────────
  _setupRolePageListeners() {
    const farmerCard = document.getElementById('card-farmer');
    const distCard = document.getElementById('card-dist');
    if (farmerCard) farmerCard.addEventListener('click', () => this.pickRole('farmer'));
    if (distCard) distCard.addEventListener('click', () => this.pickRole('distributor'));
  },

  // ── Handle Offer Actions (called from farmer tab) ──────────
  async handleOffer(offerId, action) {
    try {
      await Market.updateOffer(offerId, action);
      Toast.success(I18n.t('common.action_success', 'Action effectuée'));
      await FILAHA_APP.fetchOffers();
      this._renderFarmerDashboard();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  // ── Publish Listing (called from farmer lister tab) ────────
  async publishListing() {
    const formData = {
      crop_type: FILAHA_APP.listForm.crop || 'Tomate',
      quantity_kg: parseFloat(FILAHA_APP.listForm.qty),
      price_per_kg: parseFloat(FILAHA_APP.listForm.price),
      currency: 'MAD',
      quality_grade: 'standard',
      location_label: FILAHA_APP.profile.région || 'Souss-Massa',
      farm_id: Auth.getUser()?.id || 'unknown',
      harvest_date: new Date().toISOString().split('T')[0],
      notes: FILAHA_APP.listForm.notes || ''
    };

    try {
      await Market.createListing(formData);
      Toast.success(I18n.t('listing.published', 'Récolte publiée !'));
      await FILAHA_APP.fetchListings();
      this._renderFarmerDashboard();
    } catch (err) {
      Toast.error(err.message);
    }
  },

  // ── Handle Plant Upload (called from farmer diagnostic tab) ─
  handlePlantUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      Toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('plant-preview');
      const img = document.getElementById('plant-img');
      if (preview) preview.style.display = 'block';
      if (img) img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  async analyzePlant() {
    const fileInput = document.getElementById('plant-file');
    const file = fileInput?.files?.[0];
    if (!file) {
      Toast.error('Veuillez sélectionner une photo');
      return;
    }

    FILAHA_APP.diagnosisLoading = true;
    this._renderFarmerDashboard();

    try {
      const reader = new FileReader();
      const base64 = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const result = await Detection.analyze(base64, file.type);
      FILAHA_APP.diagnosisResult = result;
      FILAHA_APP.diagnosisLoading = false;
      Toast.success('Diagnostic terminé');
      this._renderFarmerDashboard();
    } catch (err) {
      FILAHA_APP.diagnosisLoading = false;
      Toast.error(err.message);
      this._renderFarmerDashboard();
    }
  },
};

window.App = App;

// Re-export for module system
export default App;