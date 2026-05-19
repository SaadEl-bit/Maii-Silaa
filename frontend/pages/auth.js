/**
 * FILAHA Login / Auth Page
 * Handles registration for both farmers and distributors.
 * Login form lives in index.html to avoid duplication.
 */

const AuthPage = {
  renderFarmerRegister() {
    return /*html*/`
      <div id="farmer-register" style="margin-top:16px;">
        <div class="form-field">
          <input type="tel" id="reg-farmer-phone" placeholder=" " autocomplete="tel" value=""/>
          <label for="reg-farmer-phone">${I18n.t('auth.phone')}</label>
        </div>
        <div class="form-field">
          <input type="text" id="reg-farmer-name" placeholder=" " autocomplete="name" value=""/>
          <label for="reg-farmer-name">${I18n.t('auth.full_name')}</label>
        </div>
        <div class="form-field">
          <input type="password" id="reg-farmer-password" placeholder=" " autocomplete="new-password" value=""/>
          <label for="reg-farmer-password">${I18n.t('auth.password')}</label>
        </div>
        <div class="form-sel-wrap">
          <label for="reg-farmer-region">${I18n.t('onboarding.region')}</label>
          <select id="reg-farmer-region">
            ${Object.keys(CONFIG.REGIONS).map(r => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>
        <button class="modal-submit" id="auth-register-farmer-btn" onclick="AuthPage.handleRegisterFarmer()">
          ${I18n.t('auth.register_farmer', "S'inscrire comme Agriculteur")}
        </button>
      </div>`;
  },

  renderDistributorRegister() {
    return /*html*/`
      <div id="distributor-register" style="margin-top:16px;">
        <div class="form-field">
          <input type="email" id="reg-dist-email" placeholder=" " autocomplete="email" value=""/>
          <label for="reg-dist-email">${I18n.t('auth.email')}</label>
        </div>
        <div class="form-field">
          <input type="text" id="reg-dist-name" placeholder=" " autocomplete="organization" value=""/>
          <label for="reg-dist-name">${I18n.t('auth.company_name')}</label>
        </div>
        <div class="form-field">
          <input type="password" id="reg-dist-password" placeholder=" " autocomplete="new-password" value=""/>
          <label for="reg-dist-password">${I18n.t('auth.password')}</label>
        </div>
        <button class="modal-submit" id="auth-register-dist-btn" onclick="AuthPage.handleRegisterDistributor()">
          ${I18n.t('auth.register_distributor', "S'inscrire comme Distributeur")}
        </button>
      </div>`;
  },

  async handleRegisterFarmer() {
    const phone = document.getElementById('reg-farmer-phone')?.value?.trim();
    const name = document.getElementById('reg-farmer-name')?.value?.trim();
    const password = document.getElementById('reg-farmer-password')?.value?.trim();
    const region = document.getElementById('reg-farmer-region')?.value || 'Souss-Massa';

    if (!phone || !name || !password) {
      Toast.error(I18n.t('common.error'));
      return;
    }

    const btn = document.getElementById('auth-register-farmer-btn');
    try {
      if (btn) { btn.textContent = I18n.t('auth.loading'); btn.disabled = true; }
      await Auth.registerFarmer({ phone, password, name, region });
      Toast.success(I18n.t('auth.registration_success'));
      // Auto-login
      await Auth.login(phone, password);
      FILAHA_APP.user = Auth.getUser();
      FILAHA_APP.role = 'farmer';
      App.navigateTo('farmer');
      App._renderFarmerDashboard();
    } catch (err) {
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
      Toast.error(I18n.t('common.error'));
      return;
    }

    const btn = document.getElementById('auth-register-dist-btn');
    try {
      if (btn) { btn.textContent = I18n.t('auth.loading'); btn.disabled = true; }
      await Auth.registerDistributor({ email, password, name, company: name });
      Toast.success(I18n.t('auth.registration_success'));
      // Auto-login
      await Auth.login(email, password);
      FILAHA_APP.user = Auth.getUser();
      FILAHA_APP.role = 'distributor';
      App.navigateTo('distributor');
      App._renderDistributorDashboard();
    } catch (err) {
      Toast.error(err.message);
    } finally {
      if (btn) { btn.textContent = I18n.t('auth.register_distributor'); btn.disabled = false; }
    }
  },
};

window.AuthPage = AuthPage;
