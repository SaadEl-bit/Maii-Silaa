/**
 * Price Analyzer — SILA Market Intelligence
 * 
 * Role: Analyze price trends for crops across countries
 * Dependencies: priceSeedData.js, cropRegistry.js
 */

const priceData = require('../data/priceSeedData');
const CropRegistry = require('../data/cropRegistry');

/**
 * Analyze price trend for a crop in a country
 * @param {string} cropName - Crop name or base_id
 * @param {string} countryCode - Country ISO code (MA, SN, KE, etc.)
 * @returns {Promise<object>} { trend, avgPrice, recommendation, confidence, sources }
 */
async function analyzeTrend(cropName, countryCode) {
  const baseId = CropRegistry.resolveBaseId(cropName);
  if (!baseId) {
    throw new Error(`Unknown crop: ${cropName}`);
  }
  
  const prices = priceData.getPricesByCountry(countryCode)
    .filter(p => CropRegistry.resolveBaseId(p.crop_name) === baseId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (prices.length === 0) {
    return {
      trend: 'unknown',
      avgPrice: null,
      recommendation: 'لا توجد بياناتprices',
      confidence: 0.1,
      sources: [],
      currency: getCountryCurrency(countryCode)
    };
  }
  
  const latest = prices[0];
  const historical = prices.slice(0, 5);
  
  const trend = calculateTrend(historical);
  const avgPrice = calculateAverage(historical);
  const confidence = calculateConfidence(prices.length, prices[0].date);
  const recommendation = generateRecommendation(trend, avgPrice, countryCode);
  
  return {
    trend,
    avgPrice: Math.round(avgPrice * 100) / 100,
    latestPrice: latest.price_per_kg,
    recommendation,
    confidence,
    sources: [...new Set(prices.map(p => p.source_name))],
    currency: latest.currency,
    dataPoints: prices.length,
    lastUpdated: latest.date,
    country: countryCode,
    crop: baseId
  };
}

/**
 * Get prices for multiple countries (region comparison)
 * @param {string} cropName
 * @param {string[]} countryCodes
 * @returns {Promise<object[]>}
 */
async function compareRegions(cropName, countryCodes) {
  const results = await Promise.all(
    countryCodes.map(cc => analyzeTrend(cropName, cc))
  );
  
  return results
    .filter(r => r.avgPrice !== null)
    .sort((a, b) => b.avgPrice - a.avgPrice);
}

/**
 * Get best price across all countries
 * @param {string} cropName
 * @returns {Promise<object>}
 */
async function findBestPrice(cropName) {
  const countries = priceData.getUniqueCountries();
  const results = await compareRegions(cropName, countries);
  
  if (results.length === 0) {
    return { error: 'No price data found' };
  }
  
  const best = results[0];
  const worst = results[results.length - 1];
  const spread = best.avgPrice - worst.avgPrice;
  
  return {
    crop: cropName,
    best: { country: best.country, price: best.avgPrice, currency: best.currency },
    worst: { country: worst.country, price: worst.avgPrice, currency: worst.currency },
    spread: Math.round(spread * 100) / 100,
    countriesCompared: results.length
  };
}

/**
 * Calculate price trend from historical data
 * @param {object[]} prices
 * @returns {string} 'rising' | 'falling' | 'stable'
 */
function calculateTrend(prices) {
  if (!prices || prices.length < 2) return 'stable';
  
  const recentPrices = prices.slice(0, 3).map(p => p.price_per_kg);
  const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  
  const olderPrices = prices.slice(-2).map(p => p.price_per_kg);
  const avgOlder = olderPrices.length > 0 
    ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length
    : avgRecent;
  
  const change = (avgRecent - avgOlder) / avgOlder;
  
  if (change > 0.1) return 'rising';
  if (change < -0.1) return 'falling';
  return 'stable';
}

/**
 * Calculate average price
 */
function calculateAverage(prices) {
  if (!prices || prices.length === 0) return 0;
  return prices.reduce((sum, p) => sum + p.price_per_kg, 0) / prices.length;
}

/**
 * Calculate confidence based on data freshness and quantity
 */
function calculateConfidence(count, latestDate) {
  let confidence = 0.3;
  
  if (count >= 5) confidence += 0.2;
  else if (count >= 3) confidence += 0.1;
  
  const daysSince = (Date.now() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 7) confidence += 0.3;
  else if (daysSince < 30) confidence += 0.2;
  else if (daysSince < 90) confidence += 0.1;
  
  return Math.min(0.9, confidence);
}

/**
 * Generate recommendation text
 */
function generateRecommendation(trend, avgPrice, countryCode) {
  const currency = getCountryCurrency(countryCode);
  const priceStr = `${Math.round(avgPrice * 100) / 100} ${currency}`;
  
  if (trend === 'rising') {
    return `سعر مرتفع الآن (${priceStr}). يُنصح بالبيع`;
  }
  if (trend === 'falling') {
    return `سعر منخفض الآن (${priceStr}). يُنصح بالانتظار`;
  }
  return `سعر مستقر (${priceStr}). يمكن البيع`;
}

/**
 * Get currency for country
 */
function getCountryCurrency(countryCode) {
  const currencies = {
    MA: 'MAD', SN: 'XOF', KE: 'KES', NG: 'NGN', GH: 'GHS', ET: 'ETB',
    TZ: 'TZS', UG: 'UGX', RW: 'RWF', SS: 'SSP', ML: 'XOF', NE: 'XOF',
    BF: 'XOF', TG: 'XOF', ZM: 'ZMW', ZW: 'USD', MW: 'USD', MZ: 'USD'
  };
  return currencies[countryCode] || 'USD';
}

const priceAnalyzer = {
  analyzeTrend,
  compareRegions,
  findBestPrice,
  calculateTrend
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = priceAnalyzer;
}

if (typeof window !== 'undefined') {
  window.priceAnalyzer = priceAnalyzer;
}