/**
 * SILA Routes — Market Intelligence API
 * 
 * Comprehensive market endpoints combining:
 *   - Price trends (priceAnalyzer)
 *   - Storage countdown (storageCountdown)
 *   - Sell window recommendations (AI)
 * 
 * Endpoints:
 *   GET /sila/analysis?crop=&country=     → Full market analysis
 *   GET /sila/sell-window?crop=&country=    → When to sell recommendation
 *   GET /sila/storage?crop=&temp=&humidity= → Storage estimate
 *   GET /sila/trends?crop=                 → Multi-country trends
 */

const express = require('express');
const router = express.Router();

const priceAnalyzer = require('../services/priceAnalyzer');
const storageCountdown = require('../services/storageCountdown');
const aiTranslator = require('../services/aiTranslator');

/**
 * GET /sila/analysis?crop=tomato&country=MA
 * 
 * Returns: Full market analysis with price, storage, and AI recommendation
 */
router.get('/analysis', async (req, res) => {
  const { crop, country = 'MA', temp = 25, humidity = 65 } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const priceResult = await priceAnalyzer.analyzeTrend(crop, country);
    const storageResult = storageCountdown.estimate(crop, { 
      temp: parseFloat(temp), 
      humidity: parseFloat(humidity) 
    }, 'ambient');
    
    const contextData = {
      currentPrice: {
        price_per_kg: priceResult.latestPrice,
        currency: priceResult.currency,
        market_name: priceResult.sources?.[0] || 'ONCA'
      },
      priceHistory: [],
      storageLife: storageResult.remainingDays,
      crop,
      country
    };
    
let aiResult = null;
    
    try {
      aiResult = await aiTranslator.translate('market', contextData);
    } catch (aiError) {
      console.warn('AI translation failed:', aiError.message);
      aiResult = aiTranslator.getFallbackResponse('market');
    }
    
    res.json({
      crop,
      country,
      price: {
        trend: priceResult.trend,
        latestPrice: priceResult.latestPrice,
        avgPrice: priceResult.avgPrice,
        currency: priceResult.currency,
        confidence: priceResult.confidence,
        sources: priceResult.sources
      },
      storage: {
        remainingDays: storageResult.remainingDays,
        status: storageResult.status,
        risk: storageResult.risk
      },
      recommendation: {
        text: aiResult.recommendation,
        explanation: aiResult.explanation,
        confidence: aiResult.confidence,
        action_items: aiResult.action_items
      },
      data_sources: aiResult.data_sources_used
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التحليل',
      message: error.message
    });
  }
});

/**
 * GET /sila/sell-window?crop=tomato&country=MA
 * 
 * Returns: Sell timing recommendation with reasoning
 */
router.get('/sell-window', async (req, res) => {
  const { crop, country = 'MA', storageType = 'ambient' } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const priceResult = await priceAnalyzer.analyzeTrend(crop, country);
    const storageResult = storageCountdown.estimate(crop, { temp: 25, humidity: 65 }, storageType);
    
    let sellRecommendation = 'sell_now';
    let reason = '';
    
    if (priceResult.trend === 'rising') {
      sellRecommendation = 'hold';
      reason = 'السعر في ارتفاع - انتظر';
    } else if (priceResult.trend === 'falling') {
      sellRecommendation = 'sell_now';
      reason = 'السعر في انخفاض - بيع الآن';
    } else if (storageResult.remainingDays < 7) {
      sellRecommendation = 'sell_now';
      reason = 'مدة التخزين قصيرة - بيع الآن';
    } else if (storageResult.remainingDays < 14) {
      sellRecommendation = 'sell_soon';
      reason = 'مدة التخزين تنفد - بيع قريباً';
    } else {
      sellRecommendation = 'hold';
      reason = 'التخزين جيد - انتظر لسعر أفضل';
    }
    
    res.json({
      crop,
      country,
      sellRecommendation,
      reason,
      price: {
        trend: priceResult.trend,
        price: priceResult.latestPrice,
        currency: priceResult.currency
      },
      storage: {
        remainingDays: storageResult.remainingDays,
        status: storageResult.status
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التوصية',
      message: error.message
    });
  }
});

/**
 * GET /sila/storage?crop=potato&temp=20&humidity=80
 * 
 * Returns: Storage estimate with conditions
 */
router.get('/storage', async (req, res) => {
  const { crop, temp = 25, humidity = 65, storageType = 'ambient' } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const result = storageCountdown.estimate(crop, {
      temp: parseFloat(temp),
      humidity: parseFloat(humidity)
    }, storageType);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في التخزين',
      message: error.message
    });
  }
});

/**
 * GET /sila/trends?crop=tomato
 * 
 * Returns: Multi-country price trends
 */
router.get('/trends', async (req, res) => {
  const { crop } = req.query;
  
  if (!crop) {
    return res.status(400).json({
      error: 'محصول مطلوب',
      message: 'crop is required'
    });
  }
  
  try {
    const countries = ['MA', 'SN', 'KE', 'NG', 'GH', 'ET', 'TZ', 'UG', 'RW'];
    const results = await priceAnalyzer.compareRegions(crop, countries);
    
    const trends = results.map(r => ({
      country: r.country,
      price: r.latestPrice,
      currency: r.currency,
      trend: r.trend,
      confidence: r.confidence
    }));
    
    const best = results[0];
    const worst = results[results.length - 1];
    
    res.json({
      crop,
      trends,
      summary: {
        highestPrice: { country: best.country, price: best.latestPrice },
        lowestPrice: { country: worst.country, price: worst.latestPrice },
        spread: best.latestPrice - worst.latestPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'خطأ في الاتجاهات',
      message: error.message
    });
  }
});

/**
 * GET /sila/crops — List all available crops
 */
router.get('/crops', (req, res) => {
  const CropRegistry = require('../data/cropRegistry');
  
  const crops = CropRegistry.listMoroccanPriority();
  
  res.json({
    crops,
    count: crops.length
  });
});

module.exports = router;