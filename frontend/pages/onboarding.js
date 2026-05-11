/**
 * FILAHA Onboarding Pages
 * Handles farmer & distributor onboarding UI rendering.
 */

const Onboarding = {
  /**
   * Render the role selection screen
   */
  renderRoleSelect() {
    return /*html*/`
      <div id="screen-role" class="screen dark-bg">
        <div class="rs-header">
          <button class="rs-back" onclick="App.navigateTo('splash')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
            Retour
          </button>
          <span class="rs-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14a3 3 0 0 1-1-1Z"/><path d="M5 19c4-4 7-6 12-7"/></svg>
            Filaha
          </span>
        </div>
        <div class="rs-main">
          <h1 class="rs-title">${I18n.t('role.title')}</h1>
          <p class="rs-sub">${I18n.t('role.subtitle')}</p>
          <div class="rs-cards">
            <div class="rs-card" id="card-farmer" onclick="App.pickRole('farmer')" role="button" tabindex="0" aria-pressed="false">
              <div class="rs-card-art">
                <svg viewBox="0 0 380 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect width="380" height="140" fill="#0a2912"/>
                  <defs><linearGradient id="sky-f" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop stop-color="#1a4a25"/><stop offset="1" stop-color="#0a2912"/></linearGradient></defs>
                  <rect width="380" height="140" fill="url(#sky-f)"/>
                  <path d="M0 90 L60 40 L120 90 L180 50 L240 90 L300 45 L360 85 L380 90 L380 140 L0 140Z" fill="#0F3D1A" opacity=".9"/>
                  <rect x="20" y="95" width="70" height="45" rx="4" fill="#2E7D32" opacity=".6"/>
                  <rect x="100" y="98" width="80" height="42" rx="4" fill="#3F8E44" opacity=".5"/>
                  <rect x="190" y="96" width="60" height="44" rx="4" fill="#2E7D32" opacity=".55"/>
                  <rect x="260" y="100" width="100" height="40" rx="4" fill="#1B5E20" opacity=".5"/>
                  <circle cx="208" cy="108" r="8" fill="#1a1a1a" opacity=".8"/>
                  <circle cx="232" cy="106" r="6" fill="#1a1a1a" opacity=".8"/>
                </svg>
              </div>
              <div class="rs-card-body">
                <div class="rs-card-icon rs-card-icon-f">${ICONS.tractor}</div>
                <div class="rs-card-title">Agriculteur</div>
                <span class="rs-card-title-ar">${I18n.t('role.farmer', 'ar')}</span>
                <p class="rs-card-desc">${I18n.t('role.farmer_desc')}</p>
                <div class="rs-card-stats">
                  <div class="rs-stat-item"><div class="rs-stat-val num">2.4M</div><div class="rs-stat-lbl">Agriculteurs</div></div>
                  <div class="rs-stat-div"></div>
                  <div class="rs-stat-item"><div class="rs-stat-val num">12</div><div class="rs-stat-lbl">Régions</div></div>
                </div>
                <div class="rs-card-cta-row">
                  <span>Rejoindre en tant qu'agriculteur</span>
                  <div class="rs-radio" id="radio-farmer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m5 12 5 5 9-11"/></svg></div>
                </div>
              </div>
            </div>
            <div class="rs-card" id="card-dist" onclick="App.pickRole('distributor')" role="button" tabindex="0" aria-pressed="false">
              <div class="rs-card-art">
                <svg viewBox="0 0 380 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <defs><linearGradient id="sky-d" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop stop-color="#0e2844"/><stop offset="1" stop-color="#0a1f38"/></linearGradient></defs>
                  <rect width="380" height="140" fill="url(#sky-d)"/>
                  <rect x="20" y="60" width="40" height="80" rx="2" fill="#1A4E7A" opacity=".7"/>
                  <rect x="70" y="45" width="35" height="95" rx="2" fill="#2176AE" opacity=".6"/>
                  <rect x="115" y="70" width="30" height="70" rx="2" fill="#1A4E7A" opacity=".65"/>
                  <rect x="155" y="50" width="45" height="90" rx="2" fill="#2176AE" opacity=".5"/>
                  <circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>
                </svg>
              </div>
              <div class="rs-card-body">
                <div class="rs-card-icon rs-card-icon-d">${ICONS.truck}</div>
                <div class="rs-card-title">${I18n.t('role.distributor')}</div>
                <span class="rs-card-title-ar">${I18n.t('role.distributor', 'ar')}</span>
                <p class="rs-card-desc">${I18n.t('role.distributor_desc')}</p>
                <div class="rs-card-stats">
                  <div class="rs-stat-item"><div class="rs-stat-val num">8 400</div><div class="rs-stat-lbl">${I18n.t('nav.dashboard', 'ar')}</div></div>
                </div>
                <div class="rs-card-cta-row">
                  <span>${I18n.t('role.continue')}</span>
                  <div class="rs-radio" id="radio-dist"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="m5 12 5 5 9-11"/></svg></div>
                </div>
              </div>
            </div>
          </div>
          <button class="rs-continue" id="rs-continue-btn" onclick="App.continueRole()" disabled>
            ${I18n.t('role.continue')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render farmer onboarding (5-step)
   */
  renderFarmerOnboarding() {
    const s = FILAHA_APP.profile;
    const step = FILAHA_APP.obStep;
    const regions = Object.keys(CONFIG.REGIONS);

    return /*html*/`
      <div id="screen-onboarding" class="screen">
        <div class="ob-wrap">
          <div class="ob-header">
            <div class="ob-brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14a3 3 0 0 1-1-1Z"/><path d="M5 19c4-4 7-6 12-7"/></svg>
              Filaha
            </div>
            <span class="ob-step-label">${I18n.t('onboarding.step')} ${step} / 5</span>
          </div>
          <div class="ob-progress"><div class="ob-progress-fill" id="ob-progress-fill" style="width:${step*20}%"></div></div>

          ${step === 1 ? this._stepIdentity(s) : ''}
          ${step === 2 ? this._stepLocation(s, regions) : ''}
          ${step === 3 ? this._stepCrops(s) : ''}
          ${step === 4 ? this._stepPack(s) : ''}
          ${step === 5 ? this._stepRecap(s) : ''}
        </div>
      </div>
    `;
  },

  _stepIdentity(s) {
    return /*html*/`
      <div class="ob-step active" id="ob-step-1">
        <h2 class="ob-title">${I18n.t('onboarding.identity')}</h2>
        <span class="ob-ar">${I18n.t('onboarding.identity', 'ar')}</span>
        <div class="form-field">
          <input type="text" id="ob-fname" placeholder=" " value="${s.fname}" autocomplete="given-name"/>
          <label for="ob-fname">${I18n.t('onboarding.first_name')}</label>
        </div>
        <div class="form-field">
          <input type="text" id="ob-lname" placeholder=" " value="${s.lname}" autocomplete="family-name"/>
          <label for="ob-lname">${I18n.t('onboarding.last_name')}</label>
        </div>
        <div class="form-field">
          <input type="tel" id="ob-phone" placeholder=" " value="${s.phone}" autocomplete="tel"/>
          <label for="ob-phone">${I18n.t('onboarding.phone')}</label>
        </div>
        <div class="form-field">
          <input type="password" id="ob-password" placeholder=" " value="${s.password || ''}" autocomplete="new-password"/>
          <label for="ob-password">${I18n.t('auth.password')}</label>
        </div>
        <div class="form-sel-wrap">
          <label for="ob-lang">${I18n.t('onboarding.lang')}</label>
          <select id="ob-lang">
            <option value="fr" ${s.lang==='fr'?'selected':''}>Français</option>
            <option value="ar" ${s.lang==='ar'?'selected':''}>العربية</option>
            <option value="br" ${s.lang==='br'?'selected':''}>ⵜⴰⵎⴰⵣⵉⵖⵜ</option>
          </select>
        </div>
        <button class="ob-btn" onclick="Onboarding.goStep(2)">${I18n.t('onboarding.next')}</button>
      </div>
    `;
  },

  _stepLocation(s, regions) {
    const sel = (r) => s.région === r ? 'selected' : '';
    return /*html*/`
      <div class="ob-step" id="ob-step-2">
        <h2 class="ob-title">${I18n.t('onboarding.location')}</h2>
        <span class="ob-ar">${I18n.t('onboarding.location', 'ar')}</span>
        <div class="form-sel-wrap">
          <label for="ob-région">${I18n.t('onboarding.region')}</label>
          <select id="ob-région">
            <option value="">-- ${I18n.t('auth.login')} --</option>
            ${regions.map(r => `<option value="${r}" ${sel(r)}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <input type="text" id="ob-commune" placeholder=" " value="${s.commune}"/>
          <label for="ob-commune">Mechta / Commune</label>
        </div>
        <div class="form-field">
          <input type="number" id="ob-surface" placeholder=" " value="${s.surface}" min="0.1" step="0.1"/>
          <label for="ob-surface">Surface totale (hectares)</label>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button class="ob-btn" style="background:var(--line);color:var(--ink-2);flex:0 0 auto;width:auto;padding:14px 20px;" onclick="Onboarding.goStep(1)">← Retour</button>
          <button class="ob-btn" style="flex:1;" onclick="Onboarding.goStep(3)">${I18n.t('onboarding.next')}</button>
        </div>
      </div>
    `;
  },

  _stepCrops(s) {
    const allCrops = ['Tomate','Pomme de terre','Oignon','Carotte','Courgette','Poivron','Pastèque','Melon','Laitue','Fève','Piment','Blé','Orge','Datte','Olive'];
    const emojis = {Tomate:'🍅','Pomme de terre':'🥔',Oignon:'🧅',Carotte:'🥕',Courgette:'🥬',Poivron:'🫑',Pastèque:'🍉',Melon:'🍈',Laitue:'🥗',Fève:'🫘',Piment:'🌶️',Blé:'🌾',Orge:'🌾',Datte:'🌴',Olive:'🫒'};
    const sel = (c) => s.crops.includes(c) ? 'sel' : '';
    return /*html*/`
      <div class="ob-step" id="ob-step-3">
        <h2 class="ob-title">${I18n.t('onboarding.crops')}</h2>
        <span class="ob-ar">${I18n.t('onboarding.crops', 'ar')}</span>
        <p class="text-small" style="color:var(--ink-3);margin-bottom:16px;">${I18n.t('onboarding.select_crops')}</p>
        <div class="chips-grid">
          ${allCrops.map(c => `<button class="chip ${sel(c)}" data-crop="${c}" onclick="Onboarding.toggleCrop(this)"><span class="chip-em">${emojis[c]}</span>${c}</button>`).join('')}
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;">
          <button class="ob-btn" style="background:var(--line);color:var(--ink-2);flex:0 0 auto;width:auto;padding:14px 20px;" onclick="Onboarding.goStep(2)">← Retour</button>
          <button class="ob-btn" style="flex:1;" onclick="Onboarding.goStep(4)">${I18n.t('onboarding.next')}</button>
        </div>
      </div>
    `;
  },

  _stepPack(s) {
    const sel = (p) => s.pack === p ? 'sel' : '';
    const badge = s.pack === 'sila' ? `<span class="pack-badge-rec">${I18n.t('onboarding.recommended')}</span>` : '';
    return /*html*/`
      <div class="ob-step" id="ob-step-4">
        <h2 class="ob-title">${I18n.t('onboarding.pack')}</h2>
        <span class="ob-ar">${I18n.t('onboarding.pack', 'ar')}</span>
        <p class="text-small" style="color:var(--ink-3);margin-bottom:16px;">${I18n.t('onboarding.select_pack')}</p>
        <div class="pack-chips">
          <button class="pack-chip mai-chip ${sel('mai')}" data-pack="mai" onclick="Onboarding.pickPack(this)">
            <span class="pack-icon">💧</span>
            <div class="pack-name">MAÏ</div>
            <div class="pack-desc">${I18n.t('onboarding.mai')}</div>
          </button>
          <button class="pack-chip sila-chip ${sel('sila')}" data-pack="sila" onclick="Onboarding.pickPack(this)">
            <span class="pack-icon">🏪</span>
            <div class="pack-name">SILA</div>
            <div class="pack-desc">${I18n.t('onboarding.sila')}</div>
            ${badge}
          </button>
          <button class="pack-chip both-chip ${sel('both')}" data-pack="both" onclick="Onboarding.pickPack(this)">
            <span class="pack-icon">🚀</span>
            <div class="pack-name">${I18n.t('onboarding.complet')}</div>
            <div class="pack-desc">${I18n.t('onboarding.complet_desc')}</div>
          </button>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;">
          <button class="ob-btn" style="background:var(--line);color:var(--ink-2);flex:0 0 auto;width:auto;padding:14px 20px;" onclick="Onboarding.goStep(3)">← Retour</button>
          <button class="ob-btn" style="flex:1;" onclick="Onboarding.goStep(5)">${I18n.t('onboarding.next')}</button>
        </div>
      </div>
    `;
  },

  _stepRecap(s) {
    const packNames = { mai: 'MAÏ (Irrigation)', sila: 'SILA (Marché)', both: 'Complet (MAÏ + SILA)' };
    return /*html*/`
      <div class="ob-step active" id="ob-step-5">
        <h2 class="ob-title">${I18n.t('onboarding.recap')}</h2>
        <span class="ob-ar">${I18n.t('onboarding.recap', 'ar')}</span>
        <div class="recap-card" id="recap-content">
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.fullname')}</span><span class="recap-value">${s.fname} ${s.lname}</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('auth.phone')}</span><span class="recap-value">${s.phone}</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.region')}</span><span class="recap-value">${s.région}</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.surface')}</span><span class="recap-value">${s.surface} ha</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.lang')}</span><span class="recap-value">${s.lang}</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.crops')}</span><span class="recap-value">${s.crops.length ? s.crops.join(', ') : '—'}</span></div>
          <div class="recap-row"><span class="recap-label">${I18n.t('onboarding.pack')}</span><span class="recap-value">${packNames[s.pack] || '—'}</span></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button class="ob-btn" style="background:var(--line);color:var(--ink-2);flex:0 0 auto;width:auto;padding:14px 20px;" onclick="Onboarding.goStep(4)">← Retour</button>
          <button class="ob-btn ob-btn-amber" style="flex:1;" onclick="Onboarding.complete()">${I18n.t('auth.login')} →</button>
        </div>
      </div>
    `;
  },

  goStep(n) {
    FILAHA_APP.obStep = n;
    FILAHA_APP.save();
    App.renderScreen('onboarding');
  },

  toggleCrop(el) {
    const crop = el.dataset.crop;
    const idx = FILAHA_APP.profile.crops.indexOf(crop);
    if (idx > -1) FILAHA_APP.profile.crops.splice(idx, 1);
    else FILAHA_APP.profile.crops.push(crop);
    FILAHA_APP.save();
    el.classList.toggle('sel');
  },

  pickPack(el) {
    document.querySelectorAll('.pack-chip').forEach(c => c.classList.remove('sel'));
    el.classList.add('sel');
    FILAHA_APP.profile.pack = el.dataset.pack;
    FILAHA_APP.save();
  },

  async complete() {
    // Gather form data
    FILAHA_APP.profile.fname = document.getElementById('ob-fname')?.value?.trim() || '';
    FILAHA_APP.profile.lname = document.getElementById('ob-lname')?.value?.trim() || '';
    FILAHA_APP.profile.phone = document.getElementById('ob-phone')?.value?.trim() || '';
    FILAHA_APP.profile.password = document.getElementById('ob-password')?.value?.trim() || '';
    FILAHA_APP.profile.région = document.getElementById('ob-région')?.value || 'Souss-Massa';
    FILAHA_APP.profile.commune = document.getElementById('ob-commune')?.value?.trim() || '';
    FILAHA_APP.profile.surface = document.getElementById('ob-surface')?.value?.trim() || '';
    FILAHA_APP.profile.lang = document.getElementById('ob-lang')?.value || 'fr';
    I18n.set(FILAHA_APP.profile.lang);

    if (!FILAHA_APP.profile.password) {
      Toast.error(I18n.t('auth.password') + ' ' + I18n.t('common.error'));
      return;
    }

    FILAHA_APP.save();

    try {
      // Register with the backend
      await Auth.registerFarmer({
        name: `${FILAHA_APP.profile.fname} ${FILAHA_APP.profile.lname}`,
        phone: FILAHA_APP.profile.phone,
        password: FILAHA_APP.profile.password,
        region: FILAHA_APP.profile.région,
      });

      // Auto-login after successful registration
      try {
        await Auth.login(FILAHA_APP.profile.phone, FILAHA_APP.profile.password);
        FILAHA_APP.user = Auth.getUser();
        FILAHA_APP.role = FILAHA_APP.user?.role || 'farmer';
      } catch (loginErr) {
        Toast.info(I18n.t('auth.login_prompt'));
        App.navigateTo('splash');
        return;
      }

      Toast.success(I18n.t('auth.registration_success'));
      App.navigateTo('farmer');
      App._renderFarmerDashboard();
    } catch (err) {
      if (err.message.includes('already') || err.message.includes('409')) {
        Toast.info(I18n.t('auth.login_prompt'));
      } else {
        Toast.warning(I18n.t('common.error') + ': ' + err.message);
      }
      App.navigateTo('splash');
    }
  },
};

window.Onboarding = Onboarding;