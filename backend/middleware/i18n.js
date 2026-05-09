/**
 * I18n Middleware — Locale Resolution
 * 
 * Resolves locale from:
 * 1. URL query: ?lang=ar
 * 2. Header: Accept-Language
 * 3. User preference (if authenticated)
 * 
 * Default: Arabic (ar) — per project spec
 * Supported: ar (Arabic), fr (French), en (English)
 * 
 * Sets: req.lang = 'ar' | 'fr' | 'en'
 */

const VALID_LOCALES = ['ar', 'fr', 'en'];
const DEFAULT_LOCALE = 'ar';

/**
 * Extract locale from Accept-Language header
 * @param {string} acceptLang - "en,fr;q=0.9,ar;q=0.8"
 * @returns {string} Locale code
 */
function parseAcceptLanguage(acceptLang) {
  if (!acceptLang) return DEFAULT_LOCALE;
  
  const locales = acceptLang
    .split(',')
    .map(part => {
      const [code, q] = part.trim().split(';q=');
      return { code: code?.slice(0, 2), q: parseFloat(q) || 1 };
    })
    .filter(item => item.code && VALID_LOCALES.includes(item.code))
    .sort((a, b) => b.q - a.q);
  
  return locales[0]?.code || DEFAULT_LOCALE;
}

/**
 * I18n middleware
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
function i18n(req, res, next) {
  let locale = DEFAULT_LOCALE;
  
  // 1. Check URL query param
  if (req.query.lang && VALID_LOCALES.includes(req.query.lang)) {
    locale = req.query.lang;
  }
  // 2. Check header (not authenticated)
  else if (req.headers['accept-language'] && !req.user) {
    locale = parseAcceptLanguage(req.headers['accept-language']);
  }
  // 3. Check user preference (authenticated)
  else if (req.user?.preferred_language) {
    locale = req.user.preferred_language;
  }
  // 4. Fallback to default
  else {
    locale = DEFAULT_LOCALE;
  }
  
  req.lang = locale;
  req.direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  next();
}

/**
 * Get translations for current locale
 * @param {string} key - Translation key (e.g., 'irrigation.title')
 * @param {string} lang - Locale code
 * @returns {string} Translated string
 */
function t(key, lang = DEFAULT_LOCALE) {
  const translations = {
    ar: {
      'error.unauthorized': 'غير مصرح',
      'error.forbidden': 'ممنوع',
      'error.notFound': 'غير موجود',
      'error.invalidInput': 'بيانات غير صالحة',
      'success': 'تم بنجاح',
      'loading': 'جاري التحميل...'
    },
    fr: {
      'error.unauthorized': 'Non autorisé',
      'error.forbidden': 'Interdit',
      'error.notFound': 'Non trouvé',
      'error.invalidInput': 'Données invalides',
      'success': 'Succès',
      'loading': 'Chargement...'
    },
    en: {
      'error.unauthorized': 'Unauthorized',
      'error.forbidden': 'Forbidden',
      'error.notFound': 'Not found',
      'error.invalidInput': 'Invalid data',
      'success': 'Success',
      'loading': 'Loading...'
    }
  };
  
  return translations[lang]?.[key] || translations[DEFAULT_LOCALE][key] || key;
}

/**
 * Format response with locale-aware messages
 * @param {any} data - Response data
 * @param {string} lang - Locale code
 * @param {object} options - { status, messageKey }
 * @returns {object} Formatted response
 */
function response(data, lang, options = {}) {
  const { status = 200, messageKey } = options;
  
  return {
    ...data,
    lang,
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    message: messageKey ? t(messageKey, lang) : undefined
  };
}

const i18nMiddleware = {
  i18n,
  parseAcceptLanguage,
  t,
  response,
  VALID_LOCALES,
  DEFAULT_LOCALE
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18nMiddleware;
}

if (typeof window !== 'undefined') {
  window.i18nMiddleware = i18nMiddleware;
}