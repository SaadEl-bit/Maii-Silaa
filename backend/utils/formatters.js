// Number, date, and currency formatting for Arabic locale display.

// Currency symbols by ISO code
const CURRENCY_SYMBOLS = {
  MAD: 'د.م.',
  XOF: 'FCFA',
  KES: 'KSh',
  NGN: '₦',
  GHS: 'GH₵',
  ETB: 'Br',
  TZS: 'TSh',
  UGX: 'USh',
  RWF: 'RF',
  SSP: 'SSP',
  ZMW: 'ZK',
  USD: '$',
  EUR: '€',
};

/**
 * Format a price with its currency symbol
 * Example: formatPrice(12.5, 'MAD') → "12.50 د.م."
 */
function formatPrice(amount, currencyCode) {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  return `${amount.toFixed(2)} ${symbol}`;
}

/**
 * Format a number with Arabic-style thousand separators
 * Example: formatNumber(1234567) → "1,234,567"
 */
function formatNumber(num) {
  return num.toLocaleString('en-US'); // Arabic uses same digit grouping
}

/**
 * Format a date as YYYY-MM-DD (database-friendly)
 */
function formatDateISO(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format a date in Arabic locale for user display
 * Example: formatDateArabic('2026-05-08') → "٨ مايو ٢٠٢٦" (or similar)
 */
function formatDateArabic(date) {
  const d = new Date(date);
  return d.toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format water amount in mm with unit
 * Example: formatWaterMm(18.5) → "18.5 mm"
 */
function formatWaterMm(mm) {
  return `${mm.toFixed(1)} mm`;
}

/**
 * Format temperature with unit
 * Example: formatTemp(32) → "32°C"
 */
function formatTemp(celsius) {
  return `${Math.round(celsius)}°C`;
}

/**
 * Format percentage
 * Example: formatPercent(0.87) → "87%"
 */
function formatPercent(decimal) {
  return `${Math.round(decimal * 100)}%`;
}

/**
 * Format confidence score for display
 * Example: formatConfidence(0.87) → "87% ثقة"
 */
function formatConfidence(confidence) {
  return `${Math.round(confidence * 100)}% ثقة`;
}

/**
 * Format distance in km
 * Example: formatDistance(12.345) → "12.3 km"
 */
function formatDistance(km) {
  return `${km.toFixed(1)} km`;
}

module.exports = {
  CURRENCY_SYMBOLS,
  formatPrice,
  formatNumber,
  formatDateISO,
  formatDateArabic,
  formatWaterMm,
  formatTemp,
  formatPercent,
  formatConfidence,
  formatDistance,
};