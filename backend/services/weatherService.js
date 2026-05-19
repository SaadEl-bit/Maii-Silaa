/**
 * Weather Service — MAÏ Data Source
 * Fetches real-time weather from Open-Meteo API
 * 
 * Role: Provides weather data for ET calculation
 * Dependencies: None (layer 0)
 * 
 * API: https://open-meteo.com/
 * No API key required
 */

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const WEATHER_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'wind_speed_10m',
  'precipitation',
  'direct_radiation',
  'uv_index',
  'cloud_cover',
  'weather_code'
].join(',');

/**
 * Fetch weather data for coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude  
 * @param {object} options - { forecastDays: 1-7 }
 * @returns {Promise<object>} Normalized weather data
 */
async function fetchWeather(lat, lng, options = {}) {
  const forecastDays = Math.min(7, Math.max(1, options.forecastDays || 1));
  
  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}&current=${WEATHER_PARAMS}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=${forecastDays}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return normalizeWeatherResponse(data, lat, lng);
  } catch (error) {
    console.error('weatherService.fetchWeather error:', error.message);
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
}

/**
 * Normalize Open-Meteo response to FILAHA standard format
 * @param {object} data - Raw API response
 * @param {number} lat
 * @param {number} lng
 * @returns {object} Normalized weather object
 */
function normalizeWeatherResponse(data, lat, lng) {
  const current = data.current || {};
  const daily = data.daily || {};
  
  const weatherCode = current.weather_code || 0;
  
  return {
    source: 'open_meteo',
    timestamp: current.time || new Date().toISOString(),
    location: { lat, lng },
    current: {
      temp: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      wind: current.wind_speed_10m ?? 0,
      rain: current.precipitation ?? 0,
      solar: current.direct_radiation ?? 0,
      uv: current.uv_index ?? 0,
      cloudCover: current.cloud_cover ?? 0,
      weatherCode,
      weather: weatherCodeToText(weatherCode)
    },
    forecast: {
      tempMax: daily.temperature_2m_max?.[0] ?? current.temperature_2m,
      tempMin: daily.temperature_2m_min?.[0] ?? current.temperature_2m,
      rainSum: daily.precipitation_sum?.[0] ?? 0
    },
    meta: {
      timezone: data.timezone || 'UTC',
      elevation: data.elevation
    }
  };
}

/**
 * Convert WMO weather code to human-readable text
 * @param {number} code - WMO weather code
 * @returns {string} Weather description in English (for internal logging)
 */
function weatherCodeToText(code) {
  const codes = {
    0: 'clear',
    1: 'mainly_clear',
    2: 'partly_cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing_rime_fog',
    51: 'light_drizzle',
    53: 'moderate_drizzle',
    55: 'dense_drizzle',
    56: 'light_freezing_drizzle',
    57: 'dense_freezing_drizzle',
    61: 'slight_rain',
    63: 'moderate_rain',
    65: 'heavy_rain',
    66: 'light_freezing_rain',
    67: 'heavy_freezing_rain',
    71: 'slight_snow',
    73: 'moderate_snow',
    75: 'heavy_snow',
    77: 'snow_grains',
    80: 'slight_rain_showers',
    81: 'moderate_rain_showers',
    82: 'violent_rain_showers',
    85: 'slight_snow_showers',
    86: 'heavy_snow_showers',
    95: 'thunderstorm',
    96: 'thunderstorm_hail',
    99: 'thunderstorm_heavy_hail'
  };
  
  return codes[code] || 'unknown';
}

/**
 * Check if weather conditions warrant irrigation
 * @param {object} weather - Normalized weather data
 * @returns {object} { shouldSkip, reason }
 */
function checkIrrigationWeather(weather) {
  const { current, forecast } = weather;
  
  if (current.rain > 2) {
    return { shouldSkip: true, reason: 'recent_rain' };
  }
  
  if (forecast.rainSum > 5) {
    return { shouldSkip: true, reason: 'forecast_rain' };
  }
  
  if (current.humidity > 85) {
    return { shouldSkip: true, reason: 'high_humidity' };
  }
  
  return { shouldSkip: false, reason: null };
}

/**
 * Get weather for multiple days (forecast)
 * @param {number} lat
 * @param {number} lng
 * @param {number} days - 1-7
 * @returns {Promise<object[]>} Array of daily weather
 */
async function fetchForecast(lat, lng, days = 3) {
  const forecastDays = Math.min(7, Math.max(1, days));
  const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&timezone=auto&forecast_days=${forecastDays}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo forecast error: ${response.status}`);
    const raw = await response.json();

    const daily = raw.daily || {};
    const dates  = daily.time || [];

    return dates.map((date, i) => ({
      date,
      tempMax: daily.temperature_2m_max?.[i] ?? null,
      tempMin: daily.temperature_2m_min?.[i] ?? null,
      rainSum: daily.precipitation_sum?.[i] ?? 0,
      weatherCode: daily.weather_code?.[i] ?? 0,
      weather: weatherCodeToText(daily.weather_code?.[i] ?? 0)
    }));
  } catch (err) {
    console.error('weatherService.fetchForecast error:', err.message);
    return [];
  }
}

// Export for CommonJS
const weatherService = {
  fetchWeather,
  fetchForecast,
  normalizeWeatherResponse,
  checkIrrigationWeather,
  weatherCodeToText
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = weatherService;
}

if (typeof window !== 'undefined') {
  window.weatherService = weatherService;
}