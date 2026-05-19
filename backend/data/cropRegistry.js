/**
 * Crop Registry - Single Source of Truth for Crop Naming
 * Phase 3.5: Unified Morocco-primary (Extended 30) + Africa-secondary (~15) crop sets
 * 
 * Base ID Pattern: single lowercase base word per crop family
 * 
 * Fields:
 *   - base_id: unique lowercase identifier (primary key)
 *   - price_aliases: array of names used in priceSeedData.js
 *   - storage_id: key for shelfLifeTables.js lookup
 *   - irrigation_default: default FAO-56 kc_initial for Morocco灌溉 regime
 *   - irrigation_variants: object with regional overrides
 *   - category: FAO crop category
 *   - source: FAO56 | ONCA | HCP | AGRA | WFP
 *   - notes: data provenance
 */

const CROP_REGISTRY = [
  // ============================================================
  // MOROCCO PRIMARY - Extended 30 (MA)
  // ============================================================
  {
    base_id: "wheat",
    price_aliases: ["wheat", "Wheat (Spring)", "Wheat (Winter)"],
    storage_id: "Wheat",
    irrigation_default: 0.30,
    irrigation_variants: { tadla: 0.35, souss: 0.40, gharb: 0.30 },
    category: "Cereals",
    source: "FAO56",
    notes: "MA primary grain; fall/winter cycle"
  },
  {
    base_id: "barley",
    price_aliases: ["barley", "Barley"],
    storage_id: "Barley",
    irrigation_default: 0.30,
    irrigation_variants: { hauteurs: 0.25, oriental: 0.35 },
    category: "Cereals",
    source: "FAO56",
    notes: "MA traditional; marginal lands"
  },
  {
    base_id: "maize",
    price_aliases: ["corn", "maize", "maize_flour", "Maize (Field/Grain)", "Maize (Sweet)"],
    storage_id: "Maize (White)",
    irrigation_default: 0.30,
    irrigation_variants: { tadla: 0.35, beni_mellal: 0.40, gharb: 0.30 },
    category: "Cereals",
    source: "FAO56",
    notes: "MA summer staple; irrigation zones"
  },
  {
    base_id: "potato",
    price_aliases: ["potato", "irish_potato", "Potato"],
    storage_id: "Potato",
    irrigation_default: 0.50,
    irrigation_variants: { hauteurs: 0.45, khouribga: 0.55 },
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "MA year-round; winter cycle dominant"
  },
  {
    base_id: "tomato",
    price_aliases: ["tomato", "Tomato"],
    storage_id: "Tomato",
    irrigation_default: 0.60,
    irrigation_variants: { souss: 0.65, agadir: 0.60, saira: 0.55 },
    category: "Solanaceae",
    source: "FAO56",
    notes: "MA export crop; greenhouse dominant"
  },
  {
    base_id: "onion",
    price_aliases: ["onion", "Onion (dry)", "Onion (green)", "Onion (seed)"],
    storage_id: "Onion (dry bulbs)",
    irrigation_default: 0.70,
    irrigation_variants: { souss: 0.75, gharb: 0.70 },
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA major vegetable; winter crop"
  },
  {
    base_id: "carrot",
    price_aliases: ["carrot", "Carrots"],
    storage_id: "Carrots",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA winter vegetable"
  },
  {
    base_id: "olive_oil",
    price_aliases: ["olive_oil", "Olives (40-60% canopy)"],
    storage_id: "Olives",
    irrigation_default: 0.65,
    irrigation_variants: { tafilalet: 0.60, marrakech: 0.70 },
    category: "Fruit Trees",
    source: "FAO56",
    notes: "MA specialty; oil extraction"
  },
  {
    base_id: "orange",
    price_aliases: ["citrus_orange", "Citrus (70% canopy, no cover)", "Citrus (Orange)"],
    storage_id: "Citrus (Orange)",
    irrigation_default: 0.70,
    irrigation_variants: { agadir: 0.65, berkane: 0.75 },
    category: "Fruit Trees",
    source: "FAO56",
    notes: "MA citrus; Berkane region"
  },
  {
    base_id: "bean",
    price_aliases: ["beans", "beans_rosecoco", "beans_njahi", "Beans (dry)", "Beans (green)"],
    storage_id: "Beans (haricot/horse)",
    irrigation_default: 0.40,
    irrigation_variants: { moyen_atlas: 0.45 },
    category: "Legumes",
    source: "FAO56",
    notes: "MA food legume; high altitude"
  },
  {
    base_id: "lentil",
    price_aliases: ["lentil", "Lentil"],
    storage_id: "Lentils",
    irrigation_default: 0.40,
    irrigation_variants: { moyen_atlas: 0.35, haut_atlas: 0.30 },
    category: "Legumes",
    source: "FAO56",
    notes: "MA winter pulse; rainfed"
  },
  {
    base_id: "chickpea",
    price_aliases: ["chick pea", "Chick pea", "Grabanzo"],
    storage_id: "Chickpeas",
    irrigation_default: 0.40,
    irrigation_variants: {},
    category: "Legumes",
    source: "FAO56",
    notes: "MA spring pulse"
  },
  {
    base_id: "garlic",
    price_aliases: ["garlic", "Garlic"],
    storage_id: "Garlic",
    irrigation_default: 0.70,
    irrigation_variants: { essaouira: 0.75 },
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA export; Essaouira region"
  },
  {
    base_id: "cabbage",
    price_aliases: ["cabbage", "Cabbage"],
    storage_id: "Cabbage",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA winter vegetable"
  },
  {
    base_id: "lettuce",
    price_aliases: ["lettuce", "Lettuce"],
    storage_id: "Lettuce",
    irrigation_default: 0.70,
    irrigation_variants: { souss: 0.75 },
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA greenhouse; year-round"
  },
  {
    base_id: "pepper",
    price_aliases: ["sweet_peppers", "Sweet Peppers (bell)", "Egg Plant"],
    storage_id: "Sweet Peppers",
    irrigation_default: 0.60,
    irrigation_variants: { souss: 0.65 },
    category: "Solanaceae",
    source: "FAO56",
    notes: "MA export; greenhouse"
  },
  {
    base_id: "cucumber",
    price_aliases: ["cucumber", "Cucumber (Fresh Market)", "Cucumber (Machine Harvest)"],
    storage_id: "Cucumber",
    irrigation_default: 0.60,
    irrigation_variants: { souss: 0.70 },
    category: "Cucurbitaceae",
    source: "FAO56",
    notes: "MA greenhouse; winter cycle"
  },
  {
    base_id: "watermelon",
    price_aliases: ["watermelon", "Watermelon"],
    storage_id: "Watermelon",
    irrigation_default: 0.40,
    irrigation_variants: { gharb: 0.45, tadla: 0.40 },
    category: "Cucurbitaceae",
    source: "FAO56",
    notes: "MA summer crop"
  },
  {
    base_id: "melon",
    price_aliases: ["melon", "Cantaloupe", "Sweet Melons"],
    storage_id: "Cantaloupe",
    irrigation_default: 0.50,
    irrigation_variants: { souss: 0.55 },
    category: "Cucurbitaceae",
    source: "FAO56",
    notes: "MA export; souss region"
  },
  {
    base_id: "pumpkin",
    price_aliases: ["pumpkin", "Pumpkin / Winter Squash"],
    storage_id: "Pumpkin",
    irrigation_default: 0.50,
    irrigation_variants: {},
    category: "Cucurbitaceae",
    source: "FAO56",
    notes: "MA traditional"
  },
  {
    base_id: "zucchini",
    price_aliases: ["zucchini", "Squash / Zucchini"],
    storage_id: "Zucchini",
    irrigation_default: 0.50,
    irrigation_variants: {},
    category: "Cucurbitaceae",
    source: "FAO56",
    notes: "MA household gardens"
  },
  {
    base_id: "cauliflower",
    price_aliases: ["cauliflower", "Cauliflower"],
    storage_id: "Cauliflower",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA winter"
  },
  {
    base_id: "broccoli",
    price_aliases: ["broccoli", "Broccoli"],
    storage_id: "Broccoli",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA emerging export"
  },
  {
    base_id: "spinach",
    price_aliases: ["spinach", "Spinach"],
    storage_id: "Spinach",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA winter leafy"
  },
  {
    base_id: "radish",
    price_aliases: ["radish", "Radish"],
    storage_id: "Radish",
    irrigation_default: 0.70,
    irrigation_variants: {},
    category: "Small Vegetables",
    source: "FAO56",
    notes: "MA quick cycle"
  },
  {
    base_id: "beet",
    price_aliases: ["beet", "Beets (table)"],
    storage_id: "Beets",
    irrigation_default: 0.50,
    irrigation_variants: {},
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "MA winter root"
  },
  {
    base_id: "turnip",
    price_aliases: ["turnip", "Turnip / Rutabaga"],
    storage_id: "Turnip",
    irrigation_default: 0.50,
    irrigation_variants: {},
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "MA traditional"
  },
  {
    base_id: "sweet_potato",
    price_aliases: ["sweet_potato", "Sweet Potato"],
    storage_id: "Sweet Potato",
    irrigation_default: 0.50,
    irrigation_variants: { gharb: 0.55 },
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "MA alternative starch"
  },
  {
    base_id: "eggplant",
    price_aliases: ["eggplant", "Egg Plant"],
    storage_id: "Eggplant",
    irrigation_default: 0.60,
    irrigation_variants: { souss: 0.65 },
    category: "Solanaceae",
    source: "FAO56",
    notes: "MA summer veg"
  },

  // ============================================================
  // AFRICA SECONDARY - ~15 Additional (continent-wide)
  // ============================================================
  {
    base_id: "rice",
    price_aliases: ["rice", "Rice", "Rice (Paddy)", "Rice (Milled)"],
    storage_id: "Rice (Paddy)",
    irrigation_default: 1.05,
    irrigation_variants: { niger: 1.10, mali: 1.15, senegal: 1.05 },
    category: "Cereals",
    source: "FAO56",
    notes: "West Africa staple; irrigated"
  },
  {
    base_id: "millet",
    price_aliases: ["millet", "Millet"],
    storage_id: "Millet",
    irrigation_default: 0.30,
    irrigation_variants: { niger: 0.25, mali: 0.30 },
    category: "Cereals",
    source: "FAO56",
    notes: "Sahel staple; rainfed"
  },
  {
    base_id: "sorghum",
    price_aliases: ["sorghum", "Sorghum (grain)", "Sorghum (sweet)"],
    storage_id: "Sorghum",
    irrigation_default: 0.30,
    irrigation_variants: { sudan: 0.35, ethiopia: 0.30 },
    category: "Cereals",
    source: "FAO56",
    notes: "Sudan belt; drought-tolerant"
  },
  {
    base_id: "cassava",
    price_aliases: ["cassava", "Cassava (year 1)", "Cassava (year 2)"],
    storage_id: "Cassava (fresh roots)",
    irrigation_default: 0.30,
    irrigation_variants: { nigeria: 0.35, congo: 0.40 },
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "Central Africa staple; perishable"
  },
  {
    base_id: "yam",
    price_aliases: ["yam", "Yam"],
    storage_id: "Yam",
    irrigation_default: 0.30,
    irrigation_variants: { nigeria: 0.35, ghana: 0.30 },
    category: "Roots and Tubers",
    source: "FAO56",
    notes: "West Africa; traditional storage"
  },
  {
    base_id: "cowpea",
    price_aliases: ["cowpea", "Green Gram / Cowpeas"],
    storage_id: "Cowpeas",
    irrigation_default: 0.40,
    irrigation_variants: { niger: 0.35, nigeria: 0.45 },
    category: "Legumes",
    source: "FAO56",
    notes: "West Africa protein; nitrogen-fixing"
  },
  {
    base_id: "groundnut",
    price_aliases: ["groundnut", "Groundnut (Peanut)", "Groundnuts (shelled)", "Groundnuts (unshelled)"],
    storage_id: "Groundnuts (unshelled)",
    irrigation_default: 0.40,
    irrigation_variants: { senegal: 0.45 },
    category: "Legumes",
    source: "FAO56",
    notes: "West Africa oilseed"
  },
  {
    base_id: "soybean",
    price_aliases: ["soybean", "Soybeans"],
    storage_id: "Soybeans",
    irrigation_default: 0.40,
    irrigation_variants: { zambia: 0.45, zimbabwe: 0.40 },
    category: "Legumes",
    source: "FAO56",
    notes: "Southern Africa; emerging"
  },
  {
    base_id: "sunflower",
    price_aliases: ["sunflower", "Sunflower"],
    storage_id: "Sunflower (seed)",
    irrigation_default: 0.35,
    irrigation_variants: { south_africa: 0.40, zambia: 0.35 },
    category: "Oil Crops",
    source: "FAO56",
    notes: "Southern Africa oilseed"
  },
  {
    base_id: "sugarcane",
    price_aliases: ["sugarcane", "Sugarcane"],
    storage_id: "Sugarcane (fresh)",
    irrigation_default: 0.40,
    irrigation_variants: { mauritius: 0.45, reunion: 0.40 },
    category: "Sugar Cane",
    source: "FAO56",
    notes: "Indian Ocean islands"
  },
  {
    base_id: "banana",
    price_aliases: ["banana", "Banana (1st year)", "Banana (2nd year)"],
    storage_id: "Banana",
    irrigation_default: 0.50,
    irrigation_variants: { cameroon: 0.60, ghana: 0.55 },
    category: "Tropical Fruits",
    source: "FAO56",
    notes: "Central/West Africa staple fruit"
  },
  {
    base_id: "mango",
    price_aliases: ["mango", "Mango"],
    storage_id: "Mango",
    irrigation_default: 0.50,
    irrigation_variants: { senegal: 0.55, mali: 0.50 },
    category: "Tropical Fruits",
    source: "FAO56",
    notes: "West Africa export"
  },
  {
    base_id: "papaya",
    price_aliases: ["papaya", "Papaya"],
    storage_id: "Papaya",
    irrigation_default: 0.50,
    irrigation_variants: {},
    category: "Tropical Fruits",
    source: "FAO56",
    notes: "Tropical"
  },
  {
    base_id: "pineapple",
    price_aliases: ["pineapple", "Pineapple (bare soil)", "Pineapple (with grass cover)"],
    storage_id: "Pineapple",
    irrigation_default: 0.50,
    irrigation_variants: { cote_ivoire: 0.55 },
    category: "Tropical Fruits",
    source: "FAO56",
    notes: "West Africa export"
  },
  {
    base_id: "avocado",
    price_aliases: ["avocado", "Avocado (no ground cover)"],
    storage_id: "Avocado",
    irrigation_default: 0.60,
    irrigation_variants: { kenya: 0.65, south_africa: 0.60 },
    category: "Fruit Trees",
    source: "FAO56",
    notes: "Eastern/Southern Africa export"
  }
];

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Resolve any alias to canonical base_id
 * @param {string} input - crop name or alias
 * @returns {string|null} - canonical base_id or null
 */
function resolveBaseId(input) {
  if (!input) return null;
  const normalized = input.toLowerCase().trim();
  
  for (const crop of CROP_REGISTRY) {
    if (crop.base_id === normalized) return crop.base_id;
    if (crop.price_aliases.some(a => a.toLowerCase() === normalized)) return crop.base_id;
  }
  return null;
}

/**
 * Get dataset key for cross-referencing
 * @param {string} base_id 
 * @param {string} dataset - 'price' | 'irrigation' | 'storage'
 * @returns {string|null} - dataset key
 */
function getDatasetKey(base_id, dataset) {
  const crop = CROP_REGISTRY.find(c => c.base_id === base_id);
  if (!crop) return null;
  
  switch (dataset) {
    case 'price': return crop.price_aliases[0];
    case 'irrigation': return crop.storage_id;
    case 'storage': return crop.storage_id;
    default: return null;
  }
}

/**
 * List Moroccan priority crops
 * @returns {string[]} - base_ids marked as MA source
 */
function listMoroccanPriority() {
  return CROP_REGISTRY
    .filter(c => c.source === 'FAO56' && c.notes.includes('MA'))
    .map(c => c.base_id);
}

/**
 * Validate coverage: ensure all datasets reference valid base_ids
 * @param {string[]} cropNames - crop names from dataset
 * @param {string} dataset - dataset identifier
 * @returns {object} - { valid: string[], orphan: string[] }
 */
function validateCoverage(cropNames, dataset) {
  const valid = [];
  const orphan = [];
  
  for (const name of cropNames) {
    const resolved = resolveBaseId(name);
    if (resolved) {
      valid.push(name);
    } else {
      orphan.push(name);
    }
  }
  
  return { valid, orphan, count: valid.length, missing: orphan.length };
}

// ============================================================
// EXPORTS
// ============================================================

const CropRegistry = {
  CROP_REGISTRY,
  resolveBaseId,
  getDatasetKey,
  listMoroccanPriority,
  validateCoverage
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CropRegistry;
}

if (typeof window !== 'undefined') {
  window.CROP_REGISTRY = CROP_REGISTRY;
  window.CropRegistry = CropRegistry;
}