/**
 * FILAHA i18n — Translations
 * MSA Arabic (default), French, Tamazight
 *
 * Usage:
 *   import I18n from './utils/i18n.js';
 *   I18n.t('nav.home')        → "Accueil"
 *   I18n.t('nav.home', 'ar')   → "الرئيسية"
 *   I18n.set('ar')             → switch language
 *   I18n.current              → 'fr' | 'ar' | 'br'
 */

const I18n = {
  current: 'fr',

  // ── French (default) ───────────────────────────────────
  fr: {
    // App
    app_name: 'Filaha',
    app_tagline: 'De la ferme au marché — en toute transparence',

    // Navigation
    nav: {
      home: 'Accueil',
      irrigation: 'Irrigation ET₀',
      diagnostic: 'Diagnostic IA',
      alerts: 'Alertes',
      prices: 'Prix du marché',
      conservation: 'Conservation',
      lister: 'Lister une récolte',
      offers: 'Offres reçues',
      stats: 'Statistiques',
      community: 'Communauté',
      dashboard: 'Tableau de bord',
      market: 'Marché',
      map: 'Carte des récoltes',
      catalog: 'Catalogues',
      my_offers: 'Mes offres',
      orders: 'Commandes',
      logout: 'Déconnexion',
    },

    // Role select
    role: {
      title: 'Qui êtes-vous ?',
      subtitle: 'Choisissez votre profil pour accéder à l\'interface adaptée à vos besoins.',
      farmer: 'Agriculteur',
      farmer_desc: 'Gérez vos champs, listez vos récoltes, suivez l\'irrigation et accédez aux prix du marché en temps réel.',
      distributor: 'Distributeur',
      distributor_desc: 'Explorez la carte des récoltes disponibles, faites des offres et gérez vos commandes en un seul endroit.',
      continue: 'Continuer',
    },

    // Onboarding
    onboarding: {
      identity: 'Votre identité',
      location: 'Votre localisation',
      crops: 'Vos cultures',
      pack: 'Votre pack',
      recap: 'Récapitulatif',
      step: 'Étape',
      next: 'Suivant',
      back: '←',
      complete: 'Commencer →',
      first_name: 'Prénom',
      last_name: 'Nom de famille',
      phone: 'Téléphone',
      phone_hint: 'ex: 0612 34 56 78',
      lang: 'Langue préférée',
      region: 'Région',
      commune: 'Commune / Mechta',
      surface: 'Surface totale (hectares)',
      select_crops: 'Sélectionnez tout ce que vous cultivez',
      select_pack: 'Choisissez les fonctionnalités dont vous avez besoin',
      mai: 'MAÏ — Irrigation & météo intelligentes',
      sila: 'SILA — Marché & distribution',
      complete_pack: 'Complet — Irrigation + Marché + Diagnostic',
      recommended: 'Recommandé',
    },

    // Home
    home: {
      greeting_morning: 'Bonjour',
      greeting_afternoon: 'Bon après-midi',
      greeting_evening: 'Bonsoir',
      surface: 'Surface',
      offers_received: 'Offres reçues',
      active_crops: 'Cultures actives',
      pending_offers: 'offre(s) en attente',
      no_pending: 'Aucune en attente',
      my_listings: 'Mes récoltes listées',
      weather_4d: 'Météo 4 jours',
      no_listings: 'Aucune récolte listée',
      publish_first: 'Publiez votre première récolte pour recevoir des offres de distributors.',
      list_harvest: '+ Lister une récolte',
    },

    // Irrigation (MAÏ)
    mai: {
      title: 'MAÏ — Intelligence Irrigation',
      dont_water: 'N\'arrosez pas aujourd\'hui',
      water_moderate: 'Arrosez modérément ce soir',
      urgent_irrigation: 'Irrigation urgente requise',
      et0_label: 'Évapotranspiration de référence',
      et0_unit: 'mm/j',
      temperature: 'Température',
      wind: 'Vent',
      rain: 'Pluie',
      et0_fao: 'ET₀ FAO-56',
      savings: 'Économie estimée',
      crop_needs: 'Besoins par culture (ETc)',
      crop: 'Culture',
      kc: 'Kc',
      etc: 'ETc (mm/j)',
      volume: 'Volume/ha',
      et0_7days: 'Évolution ET₀ — 7 jours',
      tips: 'Conseils d\'irrigation',
      tip_morning: 'Arrosage tôt le matin (5h–8h) réduit l\'évaporation de 40% et favorise l\'absorption racinaire.',
      tip_sensor: 'Tensiomètre : irriguer quand la tension dépasse 30–40 cbar pour les légumes.',
      tip_stress: 'Stress hydrique prévu si ET₀ > 6mm/j sans pluie. Vérifiez vos réservoirs.',
      soil_moist: 'Laisser le sol sécher entre les irrigations.',
    },

    // Market (SILA)
    sila: {
      title: 'SILA — Intelligence Marché',
      wait_prices_up: 'Attendez encore — prix en hausse',
      sell_now_prices_down: 'Vendez maintenant — prix en baisse',
      prices_stable: 'Prix stables — bonne fenêtre',
      current_price: 'Prix actuel',
      per_kg: 'DH/kg',
      gain_potential: 'Gain potentiel',
      price_drop: 'En baisse de',
      vs_last_month: 'vs mois dernier',
      analysis: 'Analyse du marché',
      region_compare: 'Comparaison par région',
      region: 'Région',
      price_per_region: 'Prix',
      deviation: 'Écart',
    },

    // Detection
    detection: {
      title: 'Diagnostic phytosanitaire par IA',
      analyze_your_plants: 'Analysez vos plantes',
      upload_desc: 'Téléversez une photo de la plante affectée. L\'IA identifie la maladie et propose un traitement.',
      choose_photo: 'Cliquez pour choisir une photo',
      photo_hint: 'JPG, PNG · max 10 Mo · feuilles, tiges, fruits',
      analyze_btn: 'Analyser avec l\'IA →',
      analyzing: 'Analyse en cours…',
      confidence: 'Confiance',
      severity: 'Sévérité',
      treatment: 'Traitement recommandé',
      prevention: 'Prévention',
      common_diseases: 'Maladies fréquentes au Maroc',
      risk_high: 'Élevé',
      risk_medium: 'Moyen',
      risk_low: 'Faible',
    },

    // Listings
    listing: {
      publish_harvest: 'Publier une récolte',
      crop: 'Culture',
      quantity: 'Quantité disponible (kg)',
      price_requested: 'Prix demandé',
      per_kg: 'DH/kg',
      total_value: 'Valeur totale estimée',
      publish: 'Publier la récolte',
      published: 'Récolte publiée !',
      all_listings: 'Toutes les récoltes',
      my_listings: 'Mes listings',
      fresh: 'Fraîche',
      recent: 'Récente',
      old: 'Ancienne',
      days_ago: 'il y a {n}j',
      variety: 'Variété',
      send_offer: 'Faire une offre',
      accept: 'Accepter',
      decline: 'Refuser',
      negotiate: 'Négocier',
    },

    // Offers
    offers: {
      received: 'Offres reçues',
      sent: 'Mes offres',
      pending: 'En attente',
      confirmed: 'Confirmée',
      negotiating: 'En négociation',
      rejected: 'Refusée',
      accept_offer: 'Accepter l\'offre',
      decline_offer: 'Refuser',
      negotiate_price: 'Proposer un contre-prix',
      offer_from: 'Offre de',
      quantity: 'Quantité',
      price_offered: 'Prix proposé',
      delivery: 'Livraison incluse',
      note: 'Note',
    },

    // Community Alerts
    alerts: {
      title: 'Alertes communautaires',
      report: 'Signaler',
      critical: 'Critique',
      warning: 'Alerte',
      info: 'Info',
    },

    // Auth
auth: {
      login: 'Connexion',
      register: 'S\'inscrire',
      phone: 'Numéro de téléphone',
      email: 'Email',
      phone_email: 'Numéro de téléphone / Email',
      password: 'Mot de passe',
      forgot_password: 'Mot de passe oublié ?',
      send_otp: 'Envoyer le code',
      verify_otp: 'Vérifier le code',
      new_password: 'Nouveau mot de passe',
      loading: 'Chargement…',
      invalid_credentials: 'Identifiants incorrects',
      registration_success: 'Inscription réussie !',
      login_prompt: 'Compte déjà existant, veuillez vous connecter.',
      no_account: 'Pas de compte ?',
      register_farmer: 'S\'inscrire comme Agriculteur',
      register_distributor: 'S\'inscrire comme Distributeur',
      full_name: 'Nom complet',
      company_name: 'Nom de l\'entreprise',
      subtitle: 'Connectez-vous pour continuer',
    },

    onboarding: {
      identity: 'Votre identité',
      location: 'Votre localisation',
      crops: 'Vos cultures',
      pack: 'Votre pack',
      recap: 'Récapitulatif',
      step: 'Étape',
      next: 'Suivant',
      back: '← Retour',
      complete: 'Commencer →',
      first_name: 'Prénom',
      last_name: 'Nom de famille',
      phone: 'Téléphone',
      phone_hint: 'ex: 0612 34 56 78',
      lang: 'Langue préférée',
      region: 'Région',
      commune: 'Commune / Mechta',
      surface: 'Surface totale (hectares)',
      select_crops: 'Sélectionnez tout ce que vous cultivez',
      select_pack: 'Choisissez les fonctionnalités dont vous avez besoin',
      mai: 'MAÏ — Irrigation & météo intelligentes',
      sila: 'SILA — Marché & distribution',
      complete_pack: 'Complet — Irrigation + Marché + Diagnostic',
      recommended: 'Recommandé',
    },

    // Common
    common: {
      loading: 'Chargement…',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      close: 'Fermer',
      search: 'Rechercher…',
      no_data: 'Aucune donnée',
      active: 'Active',
    },
  },

  // ── Arabic (MSA) ─────────────────────────────────────────
  ar: {
    app_name: 'فلاحة',
    app_tagline: 'من الحقل إلى السوق — بكل شفافية',

    nav: {
      home: 'الرئيسية',
      irrigation: 'الري ET₀',
      diagnostic: 'التشخيص بالذكاء',
      alerts: 'التنبيهات',
      prices: 'أسعار السوق',
      conservation: 'الحفظ والتخزين',
      lister: 'عرض محصول',
      offers: 'العروض المستلمة',
      stats: 'الإحصائيات',
      community: 'المجتمع الزراعي',
      dashboard: 'لوحة التحكم',
      market: 'السوق',
      map: 'خريطة المحاصيل',
      catalog: 'القوائم',
      my_offers: 'عروضي',
      orders: 'الطلبات',
      logout: 'تسجيل الخروج',
    },

    role: {
      title: 'من أنت؟',
      subtitle: 'اختر ملفك للوصول إلى الواجهة المناسبة لاحتياجاتك.',
      farmer: 'فلاح',
      farmer_desc: 'إدارة الحقول، عرض الحصاد، تتبع الري والوصول إلى أسعار السوق.',
      distributor: 'موزّع',
      distributor_desc: 'استكشاف خريطة المحاصيل، إرسال العروض وإدارة الطلبات.',
      continue: 'متابعة',
    },

    mai: {
      title: 'ماي — ذكاء الري',
      dont_water: 'لا تسقي اليوم',
      water_moderate: 'اسقِ بشكل معتدل مساءً',
      urgent_irrigation: 'ري عاجل مطلوب',
      et0_label: 'التبخر نتح المرجعي',
      et0_unit: 'مم/يوم',
      temperature: 'الحرارة',
      wind: 'الرياح',
      rain: 'المطر',
      savings: 'التوفير المتوقع',
      crop_needs: 'احتياجات المحاصيل (ETc)',
      crop: 'المحصول',
      kc: 'Kc',
      etc: 'ETc (مم/يوم)',
      volume: 'الحجم/هكتار',
      et0_7days: 'تطور ET₀ — 7 أيام',
      tips: 'نصائح الري',
    },

    sila: {
      title: 'سيلا — ذكاء السوق',
      wait_prices_up: 'انتظر — الأسعار في ارتفاع',
      sell_now_prices_down: 'بِع الآن — الأسعار في انخفاض',
      prices_stable: 'الأسعار مستقرة — فرصة جيدة',
      current_price: 'السعر الحالي',
      per_kg: 'درهم/كغ',
      analysis: 'تحليل السوق',
      region_compare: 'المقارنة حسب المنطقة',
    },

    offers: {
      received: 'العروض المستلمة',
      pending: 'في الانتظار',
      accept: 'قبول',
      decline: 'رفض',
      negotiate: 'تفاوض',
    },

    common: {
      loading: 'جارٍ التحميل…',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
    },
  },

  // ── Tamazight ─────────────────────────────────────────────
  br: {
    app_name: 'ⴼⵉⵍⴰⵀⴰ',
    app_tagline: 'ⴰⵙⵉ ⴰⴽⵓ ⵏ ⵓⴳⵓⵔⵉ — ⴰⴽⵓ ⵓⵙⵓⵏ',
    nav: { home: 'ⴰⵙⵉ', irrigation: 'ⵉⴷⵓ', alerts: 'ⴰⵙⴷⵓⵙⵉⵙ', prices: 'ⵉⵎⵙⵓ', logout: 'ⵓⵙⵓⵏ' },
    common: { loading: 'ⴰⵔ ⵓⵙⵓⵏⵉⵙ…', error: 'ⵉⵙⵓⵙ ⵓⵙⴰ', retry: 'ⵓⵙⵓⵙⵉ' },
  },

  // ── Methods ──────────────────────────────────────────────

  /**
   * Get translation for a key
   * @param {string} key - dot notation: 'nav.home'
   * @param {string} lang - optional override
   */
  t(key, lang = null) {
    const locale = lang || this.current;
    const dict = this[locale] || this['fr'];
    const keys = key.split('.');
    let value = dict;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    return value || key;
  },

  /**
   * Set current language
   * @param {string} lang - 'fr' | 'ar' | 'br'
   */
  set(lang) {
    if (this[lang]) {
      this.current = lang;
      localStorage.setItem(CONFIG.STORAGE.LANG, lang);
    }
  },

  /**
   * Init from localStorage
   */
  init() {
    const stored = localStorage.getItem(CONFIG.STORAGE.LANG);
    if (stored && this[stored]) {
      this.current = stored;
    }
  },

  /**
   * Get all available languages
   */
  available() {
    return Object.keys(this).filter(k => !['t', 'set', 'init', 'current', 'available'].includes(k));
  },
};

window.FILAHA_I18N = I18n;