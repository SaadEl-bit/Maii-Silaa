/**
 * Weather Routes — Open-Meteo Proxy API
 * 
 * Endpoints:
 *   GET /weather/current?lat=&lng=      → Current weather
 *   GET /weather/forecast?lat=&lng=&days= → 7-day forecast
 *   GET /weather/hourly?lat=&lng=&hours= → Hourly forecast
 * 
 * No auth required — Open-Meteo is free, no API key
 */

const express = require('express');
const router = express.Router();

const weatherService = require('../services/weatherService');

/**
 * GET /weather/current?lat=34.0&lng=-6.8
 * 
 * Returns: { temp, humidity, wind, rain, solar, weather }
 */
router.get('/current', async (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      error: ' إحداثيات مطلوبة',
      message: 'lat and lng are required'
    });
  }
  
  try {
    const weather = await weatherService.fetchWeather(
      parseFloat(lat),
      parseFloat(lng)
    );
    
    res.json({
      location: weather.location,
      current: weather.current,
      meta: weather.meta
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في الطقس',
      message: error.message
    });
  }
});

/**
 * GET /weather/forecast?lat=34.0&lng=-6.8&days=7
 * 
 * Returns: Array of daily forecasts
 */
router.get('/forecast', async (req, res) => {
  const { lat, lng, days = 7 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      error: ' إحداثيات مطلوبة',
      message: 'lat and lng are required'
    });
  }
  
  try {
    const weather = await weatherService.fetchWeather(
      parseFloat(lat),
      parseFloat(lng),
      { forecastDays: parseInt(days) }
    );
    
    const forecast = await weatherService.fetchForecast(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(days)
    );
    
    res.json({
      location: weather.location,
      forecast,
      meta: weather.meta
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التوقعات',
      message: error.message
    });
  }
});

/**
 * GET /weather/hourly?lat=34.0&lng=-6.8&hours=24
 * 
 * Returns: Array of hourly data
 */
router.get('/hourly', async (req, res) => {
  const { lat, lng, hours = 24 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      error: ' إحداثيات مطلوبة',
      message: 'lat and lng are required'
    });
  }
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
      `&forecast_hours=${hours}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const hourly = (data.hourly?.time || []).map((time, i) => ({
      time,
      temp: data.hourly?.temperature_2m?.[i],
      humidity: data.hourly?.relative_humidity_2m?.[i],
      precipitation: data.hourly?.precipitation?.[i],
      weatherCode: data.hourly?.weather_code?.[i]
    }));
    
    res.json({
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      hourly,
      timezone: data.timezone
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التوقعات',
      message: error.message
    });
  }
});

/**
 * GET /weather/check?lat=&lng=
 * 
 * Returns: { shouldIrrigate, reason } — based on weather conditions
 */
router.get('/check', async (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({
      error: ' إحداثيات مطلوبة',
      message: 'lat and lng are required'
    });
  }
  
  try {
    const weather = await weatherService.fetchWeather(
      parseFloat(lat),
      parseFloat(lng)
    );
    
    const check = weatherService.checkIrrigationWeather(weather);
    
    res.json({
      shouldSkip: check.shouldSkip,
      reason: check.reason,
      weather: weather.current
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التحقق',
      message: error.message
    });
  }
});

module.exports = router;