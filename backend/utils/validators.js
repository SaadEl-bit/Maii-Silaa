// Input validation helpers — used by routes to check data before processing.

const { FAO56_CROP_DATABASE } = require('../data/cropCoefficients');

// All crop names from the FAO database, lowercased for quick lookup
const VALID_CROP_NAMES = new Set(
  FAO56_CROP_DATABASE.map(c => c.name.toLowerCase())
);

// Valid growth stages used in the irrigation system
const VALID_STAGES = ['initial', 'development', 'mid', 'late'];

// Valid user roles in the system
const VALID_ROLES = ['farmer', 'distributor'];

// Valid languages for the UI
const VALID_LOCALES = ['ar', 'fr', 'en'];

/**
 * Check if latitude is valid (-90 to 90)
 */
function isValidLat(lat) {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
}

/**
 * Check if longitude is valid (-180 to 180)
 */
function isValidLng(lng) {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
}

/**
 * Check if both lat and lng are valid together
 */
function isValidCoords(lat, lng) {
  return isValidLat(lat) && isValidLng(lng);
}

/**
 * Check if a crop name exists in our FAO-56 database
 */
function isValidCrop(name) {
  if (typeof name !== 'string') return false;
  return VALID_CROP_NAMES.has(name.toLowerCase());
}

/**
 * Check if a growth stage is valid
 */
function isValidStage(stage) {
  if (typeof stage !== 'string') return false;
  return VALID_STAGES.includes(stage.toLowerCase());
}

/**
 * Check if a user role is valid
 */
function isValidRole(role) {
  if (typeof role !== 'string') return false;
  return VALID_ROLES.includes(role.toLowerCase());
}

/**
 * Check if a locale is valid
 */
function isValidLocale(locale) {
  if (typeof locale !== 'string') return false;
  return VALID_LOCALES.includes(locale.toLowerCase());
}

/**
 * Check if a string is non-empty after trimming
 */
function isNonEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Check if a country code looks valid (2 uppercase letters)
 */
function isValidCountryCode(code) {
  return typeof code === 'string' && /^[A-Z]{2}$/.test(code);
}

/**
 * Check if a confidence value is in range 0.0 to 1.0
 */
function isValidConfidence(val) {
  return typeof val === 'number' && val >= 0 && val <= 1;
}

module.exports = {
  isValidLat,
  isValidLng,
  isValidCoords,
  isValidCrop,
  isValidStage,
  isValidRole,
  isValidLocale,
  isNonEmpty,
  isValidCountryCode,
  isValidConfidence,
  VALID_STAGES,
  VALID_ROLES,
  VALID_LOCALES,
};