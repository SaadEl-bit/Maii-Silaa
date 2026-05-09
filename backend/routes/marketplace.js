/**
 * Marketplace Routes — Listings & Offer Negotiation (SILA)
 *
 * Farmer-side (requires auth + farmer role):
 *   POST   /marketplace/listings              → Create harvest listing
 *   GET    /marketplace/listings/my           → Get my listings
 *   DELETE /marketplace/listings/:id          → Remove a listing
 *   PUT    /marketplace/listings/:id/offer/:offerId → Accept / decline / counter offer
 *
 * Distributor-side (requires auth + distributor role):
 *   GET    /marketplace/listings              → Browse all active listings (with filters)
 *   POST   /marketplace/listings/:id/offer   → Send offer (price negotiation)
 *   GET    /marketplace/offers/my            → My sent offers
 *
 * Public:
 *   GET    /marketplace/listings/:id         → Get single listing detail
 */

const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const { requireFarmer, requireDistributor } = require('../middleware/roleCheck');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── FARMER: Create a harvest listing ────────────────────────────────────────

/**
 * POST /marketplace/listings
 * Body: { crop_type, quantity_kg, price_per_kg, currency, quality_grade, location_label, farm_id, harvest_date, notes }
 */
router.post(
  '/listings',
  authenticate,
  requireFarmer,
  asyncHandler(async (req, res) => {
    const {
      crop_type,
      quantity_kg,
      price_per_kg,
      currency = 'MAD',
      quality_grade = 'standard',
      location_label,
      farm_id,
      harvest_date,
      notes
    } = req.body;

    // Basic validation
    if (!crop_type || !quantity_kg || !price_per_kg || !farm_id) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'crop_type, quantity_kg, price_per_kg, and farm_id are required'
      });
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        farmer_id: req.user.sub || req.user.id,
        farm_id,
        crop_type,
        quantity_kg: parseFloat(quantity_kg),
        price_per_kg: parseFloat(price_per_kg),
        currency,
        quality_grade,
        location_label,
        harvest_date,
        notes,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'خطأ في إنشاء الإعلان',
        message: error.message
      });
    }

    res.status(201).json({
      message: 'تم نشر الإعلان بنجاح',
      listing: data
    });
  })
);

// ─── PUBLIC: Browse all active listings (with optional filters) ───────────────

/**
 * GET /marketplace/listings?crop=tomato&country=MA&minPrice=5&maxPrice=20&page=1
 */
router.get(
  '/listings',
  asyncHandler(async (req, res) => {
    const {
      crop,
      country,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('listings')
      .select('*, farms(location_label, country_code)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (crop) query = query.ilike('crop_type', `%${crop}%`);
    if (minPrice) query = query.gte('price_per_kg', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price_per_kg', parseFloat(maxPrice));
    if (country) query = query.eq('farms.country_code', country);

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({
        error: 'خطأ في جلب الإعلانات',
        message: error.message
      });
    }

    res.json({
      listings: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  })
);

// ─── PUBLIC: Get single listing ───────────────────────────────────────────────

/**
 * GET /marketplace/listings/:id
 */
router.get(
  '/listings/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, farms(location_label, country_code, crop_type)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: 'غير موجود',
        message: 'Listing not found'
      });
    }

    res.json(data);
  })
);

// ─── FARMER: Get my own listings ─────────────────────────────────────────────

/**
 * GET /marketplace/listings/my
 */
router.get(
  '/listings/my',
  authenticate,
  requireFarmer,
  asyncHandler(async (req, res) => {
    const farmerId = req.user.sub || req.user.id;

    const { data, error } = await supabase
      .from('listings')
      .select('*, offers(id, status, offered_price, distributor_id)')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: 'خطأ في جلب إعلاناتك',
        message: error.message
      });
    }

    res.json({ listings: data, count: data.length });
  })
);

// ─── FARMER: Delete a listing ─────────────────────────────────────────────────

/**
 * DELETE /marketplace/listings/:id
 */
router.delete(
  '/listings/:id',
  authenticate,
  requireFarmer,
  asyncHandler(async (req, res) => {
    const farmerId = req.user.sub || req.user.id;

    // Make sure the listing belongs to this farmer
    const { data: existing } = await supabase
      .from('listings')
      .select('id, farmer_id')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'الإعلان غير موجود' });
    }

    if (existing.farmer_id !== farmerId) {
      return res.status(403).json({
        error: 'غير مصرح',
        message: 'You can only delete your own listings'
      });
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(500).json({
        error: 'خطأ في الحذف',
        message: error.message
      });
    }

    res.json({ message: 'تم حذف الإعلان بنجاح' });
  })
);

// ─── DISTRIBUTOR: Send an offer ───────────────────────────────────────────────

/**
 * POST /marketplace/listings/:id/offer
 * Body: { offered_price, quantity_kg, message }
 */
router.post(
  '/listings/:id/offer',
  authenticate,
  requireDistributor,
  asyncHandler(async (req, res) => {
    const { offered_price, quantity_kg, message } = req.body;
    const distributorId = req.user.sub || req.user.id;

    if (!offered_price || !quantity_kg) {
      return res.status(400).json({
        error: 'بيانات ناقصة',
        message: 'offered_price and quantity_kg are required'
      });
    }

    // Verify the listing is still active
    const { data: listing } = await supabase
      .from('listings')
      .select('id, status, farmer_id, price_per_kg, quantity_kg')
      .eq('id', req.params.id)
      .single();

    if (!listing) {
      return res.status(404).json({ error: 'الإعلان غير موجود' });
    }

    if (listing.status !== 'active') {
      return res.status(409).json({
        error: 'الإعلان غير متاح',
        message: 'This listing is no longer active'
      });
    }

    const { data, error } = await supabase
      .from('offers')
      .insert({
        listing_id: req.params.id,
        distributor_id: distributorId,
        farmer_id: listing.farmer_id,
        offered_price: parseFloat(offered_price),
        quantity_kg: parseFloat(quantity_kg),
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'خطأ في إرسال العرض',
        message: error.message
      });
    }

    res.status(201).json({
      message: 'تم إرسال العرض بنجاح',
      offer: data
    });
  })
);

// ─── FARMER: Respond to an offer (accept / decline / counter) ─────────────────

/**
 * PUT /marketplace/listings/:id/offer/:offerId
 * Body: { action: 'accepted' | 'declined' | 'countered', counter_price? }
 */
router.put(
  '/listings/:id/offer/:offerId',
  authenticate,
  requireFarmer,
  asyncHandler(async (req, res) => {
    const { action, counter_price } = req.body;
    const farmerId = req.user.sub || req.user.id;

    const VALID_ACTIONS = ['accepted', 'declined', 'countered'];

    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({
        error: 'إجراء غير صالح',
        message: `action must be one of: ${VALID_ACTIONS.join(', ')}`
      });
    }

    if (action === 'countered' && !counter_price) {
      return res.status(400).json({
        error: 'سعر مضاد مطلوب',
        message: 'counter_price is required when action is countered'
      });
    }

    // Verify the offer belongs to this farmer's listing
    const { data: offer } = await supabase
      .from('offers')
      .select('id, farmer_id, status')
      .eq('id', req.params.offerId)
      .eq('listing_id', req.params.id)
      .single();

    if (!offer) {
      return res.status(404).json({ error: 'العرض غير موجود' });
    }

    if (offer.farmer_id !== farmerId) {
      return res.status(403).json({
        error: 'غير مصرح',
        message: 'You can only respond to offers on your own listings'
      });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(409).json({
        error: 'العرض محسوم',
        message: 'This offer has already been resolved'
      });
    }

    const updatePayload = { status: action };
    if (action === 'countered') updatePayload.counter_price = parseFloat(counter_price);

    const { data: updated, error } = await supabase
      .from('offers')
      .update(updatePayload)
      .eq('id', req.params.offerId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'خطأ في تحديث العرض',
        message: error.message
      });
    }

    // If accepted: mark the listing as sold
    if (action === 'accepted') {
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', req.params.id);
    }

    const statusLabel = {
      accepted: 'قبلت العرض',
      declined: 'رفضت العرض',
      countered: 'أرسلت عرضاً مضاداً'
    };

    res.json({
      message: statusLabel[action],
      offer: updated
    });
  })
);

// ─── DISTRIBUTOR: Get my sent offers ─────────────────────────────────────────

/**
 * GET /marketplace/offers/my
 */
router.get(
  '/offers/my',
  authenticate,
  requireDistributor,
  asyncHandler(async (req, res) => {
    const distributorId = req.user.sub || req.user.id;

    const { data, error } = await supabase
      .from('offers')
      .select('*, listings(crop_type, quantity_kg, price_per_kg, currency, status)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        error: 'خطأ في جلب العروض',
        message: error.message
      });
    }

    res.json({ offers: data, count: data.length });
  })
);

module.exports = router;