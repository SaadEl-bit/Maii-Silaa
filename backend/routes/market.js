/**
 * Market Routes — SILA Service API
 * 
 * Endpoints:
 *   GET  /market/price?crop=&country=           → Get price for crop in country
 *   GET  /market/prices?crop=                     → Get prices across all countries
 *   GET  /market/trend?crop=&country=            → Get price trend analysis
 *   GET  /market/best-price?crop=                → Find best price across regions
 * 
 * No auth required for public price data
 */

const express = require('express');
const router = express.Router();

const priceAnalyzer = require('../services/priceAnalyzer');
const storageCountdown = require('../services/storageCountdown');
const aiTranslator = require('../services/aiTranslator');

/**
 * GET /market/price?crop=&country=MA
 * 
 * Returns: { price, currency, trend, confidence }
 */
router.get('/price', async (req, res) => {
  const { crop, country = 'MA' } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const result = await priceAnalyzer.analyzeTrend(crop, country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في الأسعار',
      message: error.message
    });
  }
});

/**
 * GET /market/prices?crop=tomato
 * 
 * Returns: prices across multiple countries
 */
router.get('/prices', async (req, res) => {
  const { crop } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const result = await priceAnalyzer.compareRegions(crop, [
      'MA', 'SN', 'KE', 'NG', 'GH', 'ET', 'TZ'
    ]);
    res.json({
      crop,
      prices: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في الأسعار',
      message: error.message
    });
  }
});

/**
 * GET /market/trend?crop=&country=
 * 
 * Returns: { trend, recommendation, confidence }
 */
router.get('/trend', async (req, res) => {
  const { crop, country = 'MA' } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const priceResult = await priceAnalyzer.analyzeTrend(crop, country);
    const storageResult = storageCountdown.estimate(crop, { temp: 25, humidity: 65 }, 'ambient');
    
    const contextData = {
      price: priceResult,
      storage: storageResult,
      crop,
      country
    };
    
    let aiResult = null;
    
    try {
      aiResult = await aiTranslator.translate('market', contextData);
    } catch (aiError) {
      console.warn('AI translation failed:', aiError.message);
      aiResult = aiTranslator.getFallbackResponse('market', contextData);
    }
    
    res.json({
      price: priceResult,
      storage: storageResult,
      recommendation: aiResult.recommendation,
      explanation: aiResult.explanation,
      confidence: aiResult.confidence,
      action_items: aiResult.action_items
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التحليل',
      message: error.message
    });
  }
});

/**
 * GET /market/best-price?crop=tomato
 * 
 * Returns: { best, worst, spread }
 */
router.get('/best-price', async (req, res) => {
  const { crop } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const result = await priceAnalyzer.findBestPrice(crop);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في الأسعار',
      message: error.message
    });
  }
});

/**
 * GET /market/crops - List available crops
 */
router.get('/crops', (req, res) => {
  const priceData = require('../data/priceSeedData');
  const crops = priceData.getUniqueCrops();
  
  res.json({
    crops,
    count: crops.length
  });
});

module.exports = router;