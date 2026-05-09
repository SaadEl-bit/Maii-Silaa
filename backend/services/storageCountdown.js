/**
 * Storage Countdown — SILA Shelf-Life Estimator
 * 
 * Role: Estimate remaining storage time based on crop + conditions
 * Dependencies: shelfLifeTables.js
 */

const storageData = require('../data/shelfLifeTables');

/**
 * Estimate remaining storage days
 * @param {string} cropName
 * @param {object} conditions - { temp: number, humidity: number }
 * @param {string} storageType - 'ventilated' | 'cold' | 'ambient' | 'dry'
 * @returns {object} { remainingDays, status, risk, qualityDegradation }
 */
function estimate(cropName, conditions = {}, storageType = 'ambient') {
  const { temp = 25, humidity = 65 } = conditions;
  
  const storage = storageData.findStorageByName(cropName);
  
  if (!storage) {
    return {
      remainingDays: null,
      status: 'unknown',
      risk: 'UNKNOWN',
      qualityDegradation: 'بيانات التخزين غير متاحة',
      notes: 'Crop not in storage database'
    };
  }
  
  const baseDays = storage.typical_duration_months * 30;
  const optimalTemp = storage.storage_temp_c;
  const optimalRH = storage.relative_humidity_pct;
  const maxMoisture = storage.max_moisture_pct;
  
  let tempFactor = calculateTempFactor(temp, optimalTemp);
  let humidFactor = calculateHumidFactor(humidity, optimalRH);
  let storageFactor = calculateStorageFactor(storageType);
  
  const combinedFactor = tempFactor * humidFactor * storageFactor;
  const remainingDays = Math.round(baseDays * combinedFactor);
  
  const risk = combinedFactor < 0.25 ? 'HIGH' 
    : combinedFactor < 0.5 ? 'MODERATE' 
    : 'LOW';
  
  const status = remainingDays < 7 ? 'SELL_NOW'
    : remainingDays < 14 ? 'SELL_SOON'
    : remainingDays < 30 ? 'HOLD'
    : 'STORAGE_GOOD';
  
  return {
    remainingDays: Math.max(0, remainingDays),
    status,
    risk,
    qualityDegradation: getDegradationMessage(risk),
    factors: {
      tempFactor,
      humidFactor,
      storageFactor,
      currentTemp: temp,
      currentHumidity: humidity,
      optimalTemp,
      optimalRH
    },
    storageType,
    crop: cropName,
    baseDuration: storage.typical_duration_months,
    qualityLossIndicators: storage.quality_loss_indicators,
    notes: storage.duration_notes
  };
}

/**
 * Calculate temperature factor
 */
function calculateTempFactor(actual, optimal) {
  const diff = actual - optimal;
  if (diff <= 0) return 1.0;
  if (diff <= 5) return 0.7;
  if (diff <= 10) return 0.4;
  if (diff <= 15) return 0.2;
  return 0.1;
}

/**
 * Calculate humidity factor  
 */
function calculateHumidFactor(actual, optimal) {
  const diff = actual - optimal;
  if (diff <= 0) return 1.0;
  if (diff <= 10) return 0.8;
  if (diff <= 20) return 0.5;
  if (diff <= 30) return 0.3;
  return 0.15;
}

/**
 * Calculate storage type factor
 */
function calculateStorageFactor(storageType) {
  const factors = {
    cold: 1.5,
    ventilated: 1.2,
    ambient: 1.0,
    dry: 1.3,
    heap: 0.6,
    crib: 0.8
  };
  return factors[storageType] || 1.0;
}

/**
 * Get degradation message in Arabic
 */
function getDegradationMessage(risk) {
  const messages = {
    HIGH: 'مخاطر عالية - تدهور سريع',
    MODERATE: 'مخاطر متوسطة — راقب الحالة بانتظام',
    LOW: 'تخزين جيد'
  };
  return messages[risk] || 'غير معروف';
}

/**
 * Get countdown for multiple crops
 */
function estimateMultiple(cropNames, conditions, storageType) {
  return cropNames
    .map(crop => ({ crop, ...estimate(crop, conditions, storageType) }))
    .sort((a, b) => a.remainingDays - b.remainingDays);
}

/**
 * Best storage type recommendation
 */
function recommendStorageType(cropName, climate = 'hot') {
  const crop = storageData.findStorageByName(cropName);
  if (!crop) return 'ambient';
  
  const factors = {
    cold: { temp: 5, humidity: 60 },
    ventilated: { temp: 20, humidity: 60 },
    ambient: { temp: 25, humidity: 65 },
    dry: { temp: 20, humidity: 50 }
  };
  
  let best = 'ambient';
  let bestScore = 0;
  
  for (const [type, conditions] of Object.entries(factors)) {
    const result = estimate(cropName, conditions, type);
    const score = result.remainingDays;
    if (score > bestScore) {
      bestScore = score;
      best = type;
    }
  }
  
  return {
    recommended: best,
    expectedDays: bestScore,
    alternatives: estimateMultiple([cropName], factors.ambient, 'ambient')
  };
}

const storageCountdown = {
  estimate,
  estimateMultiple,
  recommendStorageType,
  calculateTempFactor,
  calculateHumidFactor,
  calculateStorageFactor
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = storageCountdown;
}

if (typeof window !== 'undefined') {
  window.storageCountdown = storageCountdown;
}