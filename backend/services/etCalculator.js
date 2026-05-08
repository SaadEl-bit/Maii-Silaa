/**
 * ET Calculator — MAÏ Core Engine
 * FAO-56 Penman-Monteith crop water requirement calculation
 * 
 * Role: Calculate irrigation water need (ETc) from weather + crop coefficients
 * Dependencies: weatherService, cropCoefficients.js
 * 
 * Formula: ETc = ET0 × Kc
 *   - ET0: Reference evapotranspiration (from weather)
 *   - Kc: Crop coefficient (from FAO-56 database)
 */

const cropCoefficients = require('../data/cropCoefficients');

/**
 * Calculate ET0 (reference evapotranspiration) using simplified Hargreaves method
 * Note: For production, use full FAO-56 Penman-Monteith equation
 * @param {object} weather - Normalized weather data
 * @returns {number} ET0 in mm/day
 */
function calculateET0(weather) {
  const { current } = weather;
  const { temp, humidity, wind, solar } = current;
  
  if (!temp || !solar) {
    return 0;
  }
  
  const tempC = temp;
  const humidityPct = humidity || 50;
  const windMs = wind || 2;
  const radiation = solar || 200;
  
  const meanTemp = tempC;
  const tempRange = 5;
  
  const slopeVP = 4098 * (0.6108 * Math.exp((17.27 * meanTemp) / (meanTemp + 237.3))) / Math.pow(meanTemp + 237.3, 2);
  const gamma = 0.665 * 0.001 * 101.3;
  const u2 = windMs;
  
  const Rn = radiation * 0.0864 / 24;
  const G = 0;
  
  const ea = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3)) * (humidityPct / 100);
  const es = ea;
  
  const delta = slopeVP;
  const gammaG = gamma;
  
  const num = 0.408 * delta * (Rn - G) + gamma * (900 / (tempC + 273)) * u2 * (es - ea);
  const den = delta + gammaG * (1 + 0.34 * u2);
  
  const et0 = num / den;
  
  return Math.max(0, Math.min(10, et0));
}

/**
 * Check growth stage from days after planting
 * @param {string} cropName
 * @param {number} daysAfterPlanting
 * @returns {string} Stage: 'initial' | 'development' | 'mid' | 'late'
 */
function getGrowthStage(cropName, daysAfterPlanting) {
  const crop = cropCoefficients.findCropByName(cropName);
  if (!crop || !daysAfterPlanting) return 'initial';
  
  const totalDays = crop.growing_days;
  const iniDays = Math.round(totalDays * 0.15);
  const devDays = Math.round(totalDays * 0.20);
  const midDays = Math.round(totalDays * 0.35);
  
  if (daysAfterPlanting <= iniDays) return 'initial';
  if (daysAfterPlanting <= iniDays + devDays) return 'development';
  if (daysAfterPlanting <= iniDays + devDays + midDays) return 'mid';
  return 'late';
}

/**
 * Get Kc value for crop and stage
 * @param {string} cropName
 * @param {string} stage
 * @returns {number}
 */
function getKc(cropName, stage) {
  const crop = cropCoefficients.findCropByName(cropName);
  if (!crop) return 1.0;
  
  const stageMap = {
    initial: crop.kc_initial,
    development: (crop.kc_initial + crop.kc_mid) / 2,
    mid: crop.kc_mid,
    late: crop.kc_end
  };
  
  return stageMap[stage] || 1.0;
}

/**
 * Calculate ETc (crop evapotranspiration)
 * @param {object} weather - Weather data
 * @param {string} cropName - Crop name
 * @param {string} stage - Growth stage
 * @returns {object} ET calculation results
 */
function calculate(weather, cropName, stage = null) {
  const et0 = calculateET0(weather);
  
  const daysAfterPlanting = stage ? null : 0;
  const actualStage = stage || getGrowthStage(cropName, daysAfterPlanting || 0);
  const kc = getKc(cropName, actualStage);
  
  const etc = et0 * kc;
  
  const shouldIrrigate = etc > 2;
  const waterMm = Math.round(etc * 10) / 10;
  const waterLitersPerHectare = Math.round(etc * 10000 * 10) / 10;
  
  return {
    et0: Math.round(et0 * 100) / 100,
    kc,
    etc: Math.round(etc * 100) / 100,
    stage: actualStage,
    shouldIrrigate,
    waterMm,
    waterLitersPerHectare,
    factors: {
      temp: weather.current?.temp,
      humidity: weather.current?.humidity,
      wind: weather.current?.wind,
      solar: weather.current?.solar
    }
  };
}

/**
 * Calculate irrigation schedule for next 7 days
 * @param {object} weather - Current weather
 * @param {string} cropName
 * @param {number} fieldSizeHectares
 * @returns {object} Schedule with daily recommendations
 */
function calculateSchedule(weather, cropName, fieldSizeHectares = 1) {
  const schedule = [];
  
  for (let i = 0; i < 7; i++) {
    const dayWeather = weather;
    const result = calculate(dayWeather, cropName);
    
    schedule.push({
      day: i + 1,
      date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      ...result,
      totalLiters: Math.round(result.waterLitersPerHectare * fieldSizeHectares)
    });
  }
  
  return schedule;
}

const etCalculator = {
  calculateET0,
  calculate,
  calculateSchedule,
  getKc,
  getGrowthStage
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = etCalculator;
}

if (typeof window !== 'undefined') {
  window.etCalculator = etCalculator;
}