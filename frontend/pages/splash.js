/**
 * FILAHA Splash Page
 * Renders the splash/landing screen with logo, tagline, language selection,
 * and CTA button to start onboarding.
 */

const Splash = {
  render() {
    return /*html*/`
      <div id="screen-splash" class="screen active dark-bg">
        <div class="splash-card">
          <svg class="stagger-1" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="18" fill="#2E7D32"/>
            <rect width="64" height="64" rx="18" fill="url(#lg-splash)"/>
            <path d="M32 12c-9 10-14 18-14 26a14 14 0 0 0 28 0c0-8-5-16-14-26Z" fill="rgba(255,255,255,.18)" stroke="#fff" stroke-width="1.5"/>
            <path d="M32 12c0 0 6 12 6 26" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M18 36c5-2 9-3 14-3s9 1 14 3" stroke="rgba(255,255,255,.4)" stroke-width="1.5" stroke-linecap="round"/>
            <defs><linearGradient id="lg-splash" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop stop-color="#3F8E44"/><stop offset="1" stop-color="#1B5E20"/></linearGradient></defs>
          </svg>
          <div class="splash-wordmark stagger-2">
            Filaha <span class="arabic" style="font-size:22px;font-weight:400;opacity:.7">فلاحة</span>
          </div>
          <div class="splash-tagline-fr stagger-3">${I18n.t('app_tagline')}</div>
          <div class="splash-tagline-ar stagger-3">من الحقل إلى السوق — بكل شفافية</div>
          <div class="splash-stat stagger-4">
            <strong>30–40%</strong> ${I18n.t('app_name')} ${I18n.current === 'ar' ? 'من ریع الخیاط' : (I18n.current === 'br' ? "n'azal n'tḍuft" : 'des récoltes perdues faute de débouchés')}.<br/>
            Filaha connecte directement agriculteurs et distributeurs.
          </div>
          <div class="splash-divider stagger-5"></div>
          <div class="lang-row stagger-5">
            <button class="lang-pill ${I18n.current==='fr'?'active':''}" onclick="I18n.set('fr'); Splash.render()" data-lang="fr">Français</button>
            <button class="lang-pill ${I18n.current==='ar'?'active':''}" onclick="I18n.set('ar'); Splash.render()" data-lang="ar">العربية</button>
            <button class="lang-pill ${I18n.current==='br'?'active':''}" onclick="I18n.set('br'); Splash.render()" data-lang="br">ⵜⴰⵎⴰⵣⵉⵖⵜ</button>
          </div>
          <button class="splash-cta stagger-6" onclick="App.start()">
            ${I18n.t('app_name').split(' ')[0]}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <p class="stagger-7" style="font-size:11px;color:rgba(223,231,221,.35);margin-top:4px;">v2.0 · Maroc · 2026</p>
        </div>
      </div>
    `;
  }
};

window.Splash = Splash;