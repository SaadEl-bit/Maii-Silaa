// FAO-56 crop coefficients (Kc) by crop and growth stage — extend for more African crops later.

/**
 * FAO-56 Crop Coefficient Database
 * Source: FAO Irrigation and Drainage Paper No. 56
 * "Crop Evapotranspiration - Guidelines for Computing Crop Water Requirements"
 * by Richard G. Allen, Luis S. Pereira, Dirk Raes, Martin Smith
 * 
 * Tables: 11 (Growth Stage Lengths) + 12 (Single Crop Coefficients)
 * 
 * Conditions: Sub-humid climates (RHmin ≈ 45%, u2 ≈ 2 m/s)
 *              for use with the FAO Penman-Monteith ETo
 * 
 * Fields:
 *   - name: Crop name
 *   - category: Crop grouping category
 *   - kc_initial: Crop coefficient during initial growth stage
 *   - kc_mid: Crop coefficient during mid-season stage
 *   - kc_end: Crop coefficient at end of late season stage
 *   - growing_days: Total length of growing period (days)
 *   - max_height_m: Maximum crop height (meters)
 *   - notes: Special notes/conditions
 */

const FAO56_CROP_DATABASE = [
  // ==========================================
  // a. Small Vegetables
  // ==========================================
  {
    name: "Broccoli",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 135,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Brussel Sprouts",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 150,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Cabbage",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 165,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Carrots",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 125,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Cauliflower",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 140,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Celery",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 1.00,
    growing_days: 152,
    max_height_m: 0.6,
    notes: ""
  },
  {
    name: "Garlic",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.00,
    kc_end: 0.70,
    growing_days: 120,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Lettuce",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.00,
    kc_end: 0.95,
    growing_days: 95,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Onion (dry)",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.75,
    growing_days: 165,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Onion (green)",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.00,
    kc_end: 1.00,
    growing_days: 70,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Onion (seed)",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.05,
    kc_end: 0.80,
    growing_days: 250,
    max_height_m: 0.5,
    notes: ""
  },
  {
    name: "Spinach",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 1.00,
    kc_end: 0.95,
    growing_days: 65,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Radish",
    category: "Small Vegetables",
    kc_initial: 0.70,
    kc_mid: 0.90,
    kc_end: 0.85,
    growing_days: 40,
    max_height_m: 0.3,
    notes: ""
  },

  // ==========================================
  // b. Vegetables - Solanum Family (Solanaceae)
  // ==========================================
  {
    name: "Egg Plant",
    category: "Solanaceae",
    kc_initial: 0.60,
    kc_mid: 1.05,
    kc_end: 0.90,
    growing_days: 130,
    max_height_m: 0.8,
    notes: ""
  },
  {
    name: "Sweet Peppers (bell)",
    category: "Solanaceae",
    kc_initial: 0.60,
    kc_mid: 1.05,
    kc_end: 0.90,
    growing_days: 167,
    max_height_m: 0.7,
    notes: "When grown on stalks 1.5-2m, use kc_mid: 1.15"
  },
  {
    name: "Tomato",
    category: "Solanaceae",
    kc_initial: 0.60,
    kc_mid: 1.15,
    kc_end: 0.80,
    growing_days: 150,
    max_height_m: 0.6,
    notes: "When grown on stalks 1.5-2m, use kc_mid: 1.20"
  },

  // ==========================================
  // c. Vegetables - Cucumber Family (Cucurbitaceae)
  // ==========================================
  {
    name: "Cantaloupe",
    category: "Cucurbitaceae",
    kc_initial: 0.50,
    kc_mid: 0.85,
    kc_end: 0.60,
    growing_days: 120,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Cucumber (Fresh Market)",
    category: "Cucurbitaceae",
    kc_initial: 0.60,
    kc_mid: 1.00,
    kc_end: 0.75,
    growing_days: 105,
    max_height_m: 0.3,
    notes: "When grown on stalks 1.5-2m, use kc_mid: 1.15"
  },
  {
    name: "Cucumber (Machine Harvest)",
    category: "Cucurbitaceae",
    kc_initial: 0.50,
    kc_mid: 1.00,
    kc_end: 0.90,
    growing_days: 105,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Pumpkin / Winter Squash",
    category: "Cucurbitaceae",
    kc_initial: 0.50,
    kc_mid: 1.00,
    kc_end: 0.80,
    growing_days: 130,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Squash / Zucchini",
    category: "Cucurbitaceae",
    kc_initial: 0.50,
    kc_mid: 0.95,
    kc_end: 0.75,
    growing_days: 115,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Sweet Melons",
    category: "Cucurbitaceae",
    kc_initial: 0.50,
    kc_mid: 1.05,
    kc_end: 0.75,
    growing_days: 110,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Watermelon",
    category: "Cucurbitaceae",
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.75,
    growing_days: 120,
    max_height_m: 0.4,
    notes: ""
  },

  // ==========================================
  // d. Roots and Tubers
  // ==========================================
  {
    name: "Beets (table)",
    category: "Roots and Tubers",
    kc_initial: 0.50,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 110,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Cassava (year 1)",
    category: "Roots and Tubers",
    kc_initial: 0.30,
    kc_mid: 0.80,
    kc_end: 0.30,
    growing_days: 180,
    max_height_m: 1.0,
    notes: "Mid-season assumes non-stressed conditions"
  },
  {
    name: "Cassava (year 2)",
    category: "Roots and Tubers",
    kc_initial: 0.30,
    kc_mid: 1.10,
    kc_end: 0.50,
    growing_days: 300,
    max_height_m: 1.5,
    notes: "Kc end accounts for dormancy during dry season"
  },
  {
    name: "Parsnip",
    category: "Roots and Tubers",
    kc_initial: 0.50,
    kc_mid: 1.05,
    kc_end: 0.95,
    growing_days: 140,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Potato",
    category: "Roots and Tubers",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 0.75,
    growing_days: 130,
    max_height_m: 0.6,
    notes: "Kc_end ~0.40 for long season potatoes with vine kill"
  },
  {
    name: "Sweet Potato",
    category: "Roots and Tubers",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 0.65,
    growing_days: 140,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Turnip / Rutabaga",
    category: "Roots and Tubers",
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 0.95,
    growing_days: 110,
    max_height_m: 0.6,
    notes: ""
  },
  {
    name: "Sugar Beet",
    category: "Roots and Tubers",
    kc_initial: 0.35,
    kc_mid: 1.20,
    kc_end: 0.70,
    growing_days: 200,
    max_height_m: 0.5,
    notes: "Kc_end up to 1.0 if irrigated in last month"
  },

  // ==========================================
  // e. Legumes (Leguminosae)
  // ==========================================
  {
    name: "Beans (green)",
    category: "Legumes",
    kc_initial: 0.50,
    kc_mid: 1.05,
    kc_end: 0.90,
    growing_days: 100,
    max_height_m: 0.4,
    notes: "When grown on stalks 1.5-2m, use kc_mid: 1.15"
  },
  {
    name: "Beans (dry)",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.35,
    growing_days: 110,
    max_height_m: 0.4,
    notes: "When grown on stalks 1.5-2m, use kc_mid: 1.20"
  },
  {
    name: "Chick pea",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.00,
    kc_end: 0.35,
    growing_days: 110,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Fababean (broad bean) - Fresh",
    category: "Legumes",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 1.10,
    growing_days: 120,
    max_height_m: 0.8,
    notes: ""
  },
  {
    name: "Fababean (broad bean) - Dry/Seed",
    category: "Legumes",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 0.30,
    growing_days: 120,
    max_height_m: 0.8,
    notes: ""
  },
  {
    name: "Grabanzo",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.35,
    growing_days: 110,
    max_height_m: 0.8,
    notes: ""
  },
  {
    name: "Green Gram / Cowpeas",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.05,
    kc_end: 0.35,
    growing_days: 110,
    max_height_m: 0.4,
    notes: "First kc_end value for fresh harvest, second for dry"
  },
  {
    name: "Groundnut (Peanut)",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.60,
    growing_days: 135,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Lentil",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.10,
    kc_end: 0.30,
    growing_days: 150,
    max_height_m: 0.5,
    notes: ""
  },
  {
    name: "Peas (Fresh)",
    category: "Legumes",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 1.10,
    growing_days: 95,
    max_height_m: 0.5,
    notes: ""
  },
  {
    name: "Peas (Dry/Seed)",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.30,
    growing_days: 100,
    max_height_m: 0.5,
    notes: ""
  },
  {
    name: "Soybeans",
    category: "Legumes",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.50,
    growing_days: 130,
    max_height_m: 0.75,
    notes: ""
  },

  // ==========================================
  // f. Perennial Vegetables
  // ==========================================
  {
    name: "Artichokes",
    category: "Perennial Vegetables",
    kc_initial: 0.50,
    kc_mid: 1.00,
    kc_end: 0.95,
    growing_days: 290,
    max_height_m: 0.7,
    notes: ""
  },
  {
    name: "Asparagus",
    category: "Perennial Vegetables",
    kc_initial: 0.50,
    kc_mid: 0.95,
    kc_end: 0.30,
    growing_days: 230,
    max_height_m: 0.5,
    notes: "Kc remains at kc_initial during spear harvest"
  },
  {
    name: "Mint",
    category: "Perennial Vegetables",
    kc_initial: 0.60,
    kc_mid: 1.15,
    kc_end: 1.10,
    growing_days: 120,
    max_height_m: 0.7,
    notes: ""
  },
  {
    name: "Strawberries",
    category: "Perennial Vegetables",
    kc_initial: 0.40,
    kc_mid: 0.85,
    kc_end: 0.75,
    growing_days: 150,
    max_height_m: 0.2,
    notes: ""
  },

  // ==========================================
  // g. Fibre Crops
  // ==========================================
  {
    name: "Cotton",
    category: "Fibre Crops",
    kc_initial: 0.35,
    kc_mid: 1.15,
    kc_end: 0.60,
    growing_days: 195,
    max_height_m: 1.35,
    notes: "Kc_mid up to 1.20; Kc_end 0.50-0.70"
  },
  {
    name: "Flax",
    category: "Fibre Crops",
    kc_initial: 0.35,
    kc_mid: 1.10,
    kc_end: 0.25,
    growing_days: 150,
    max_height_m: 1.2,
    notes: ""
  },
  {
    name: "Sisal",
    category: "Fibre Crops",
    kc_initial: 0.40,
    kc_mid: 0.40,
    kc_end: 0.40,
    growing_days: 365,
    max_height_m: 1.5,
    notes: "Kc depends on planting density and water management"
  },

  // ==========================================
  // h. Oil Crops
  // ==========================================
  {
    name: "Castorbean (Ricinus)",
    category: "Oil Crops",
    kc_initial: 0.35,
    kc_mid: 1.15,
    kc_end: 0.55,
    growing_days: 180,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Rapeseed / Canola",
    category: "Oil Crops",
    kc_initial: 0.35,
    kc_mid: 1.10,
    kc_end: 0.35,
    growing_days: 150,
    max_height_m: 0.6,
    notes: "Lower values for rainfed, less dense populations"
  },
  {
    name: "Safflower",
    category: "Oil Crops",
    kc_initial: 0.35,
    kc_mid: 1.10,
    kc_end: 0.25,
    growing_days: 145,
    max_height_m: 0.8,
    notes: ""
  },
  {
    name: "Sesame",
    category: "Oil Crops",
    kc_initial: 0.35,
    kc_mid: 1.10,
    kc_end: 0.25,
    growing_days: 100,
    max_height_m: 1.0,
    notes: ""
  },
  {
    name: "Sunflower",
    category: "Oil Crops",
    kc_initial: 0.35,
    kc_mid: 1.10,
    kc_end: 0.35,
    growing_days: 130,
    max_height_m: 2.0,
    notes: ""
  },

  // ==========================================
  // i. Cereals
  // ==========================================
  {
    name: "Barley",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.15,
    kc_end: 0.25,
    growing_days: 135,
    max_height_m: 1.0,
    notes: ""
  },
  {
    name: "Oats",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.15,
    kc_end: 0.25,
    growing_days: 135,
    max_height_m: 1.0,
    notes: ""
  },
  {
    name: "Wheat (Spring)",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.15,
    kc_end: 0.35,
    growing_days: 150,
    max_height_m: 1.0,
    notes: ""
  },
  {
    name: "Wheat (Winter)",
    category: "Cereals",
    kc_initial: 0.40,
    kc_mid: 1.15,
    kc_end: 0.35,
    growing_days: 210,
    max_height_m: 1.0,
    notes: "Kc_initial 0.70 for non-frozen soils"
  },
  {
    name: "Maize (Field/Grain)",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.20,
    kc_end: 0.50,
    growing_days: 150,
    max_height_m: 2.0,
    notes: "Kc_end 0.35 for field drying to 18% moisture"
  },
  {
    name: "Maize (Sweet)",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.15,
    kc_end: 1.05,
    growing_days: 100,
    max_height_m: 1.5,
    notes: "If allowed to mature and dry, use field maize kc_end"
  },
  {
    name: "Millet",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.00,
    kc_end: 0.30,
    growing_days: 120,
    max_height_m: 1.5,
    notes: ""
  },
  {
    name: "Sorghum (grain)",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.05,
    kc_end: 0.55,
    growing_days: 135,
    max_height_m: 1.5,
    notes: "Kc_mid 1.00-1.10"
  },
  {
    name: "Sorghum (sweet)",
    category: "Cereals",
    kc_initial: 0.30,
    kc_mid: 1.20,
    kc_end: 1.05,
    growing_days: 160,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Rice",
    category: "Cereals",
    kc_initial: 1.05,
    kc_mid: 1.20,
    kc_end: 0.75,
    growing_days: 150,
    max_height_m: 1.0,
    notes: "Kc_end 0.90-0.60 depending on water mgmt"
  },

  // ==========================================
  // j. Forages
  // ==========================================
  {
    name: "Alfalfa Hay (averaged)",
    category: "Forages",
    kc_initial: 0.40,
    kc_mid: 0.95,
    kc_end: 0.90,
    growing_days: 240,
    max_height_m: 0.7,
    notes: "Overall average Kc for season"
  },
  {
    name: "Alfalfa Hay (individual cutting)",
    category: "Forages",
    kc_initial: 0.40,
    kc_mid: 1.20,
    kc_end: 1.15,
    growing_days: 60,
    max_height_m: 0.7,
    notes: "Per cutting cycle"
  },
  {
    name: "Alfalfa (for seed)",
    category: "Forages",
    kc_initial: 0.40,
    kc_mid: 0.50,
    kc_end: 0.50,
    growing_days: 200,
    max_height_m: 0.7,
    notes: ""
  },
  {
    name: "Bermuda Hay (averaged)",
    category: "Forages",
    kc_initial: 0.55,
    kc_mid: 1.00,
    kc_end: 0.85,
    growing_days: 180,
    max_height_m: 0.35,
    notes: ""
  },
  {
    name: "Bermuda (for seed)",
    category: "Forages",
    kc_initial: 0.35,
    kc_mid: 0.90,
    kc_end: 0.65,
    growing_days: 120,
    max_height_m: 0.4,
    notes: ""
  },
  {
    name: "Clover Hay (averaged)",
    category: "Forages",
    kc_initial: 0.40,
    kc_mid: 0.90,
    kc_end: 0.85,
    growing_days: 150,
    max_height_m: 0.6,
    notes: ""
  },
  {
    name: "Rye Grass Hay",
    category: "Forages",
    kc_initial: 0.95,
    kc_mid: 1.05,
    kc_end: 1.00,
    growing_days: 120,
    max_height_m: 0.3,
    notes: ""
  },
  {
    name: "Sudan Grass Hay (averaged)",
    category: "Forages",
    kc_initial: 0.50,
    kc_mid: 0.90,
    kc_end: 0.85,
    growing_days: 75,
    max_height_m: 1.2,
    notes: ""
  },
  {
    name: "Grazing Pasture (Rotated)",
    category: "Forages",
    kc_initial: 0.40,
    kc_mid: 0.95,
    kc_end: 0.85,
    growing_days: 180,
    max_height_m: 0.22,
    notes: "Kc_mid range 0.85-1.05"
  },
  {
    name: "Grazing Pasture (Extensive)",
    category: "Forages",
    kc_initial: 0.30,
    kc_mid: 0.75,
    kc_end: 0.75,
    growing_days: 180,
    max_height_m: 0.1,
    notes: ""
  },
  {
    name: "Turf Grass (cool season)",
    category: "Forages",
    kc_initial: 0.90,
    kc_mid: 0.95,
    kc_end: 0.95,
    growing_days: 240,
    max_height_m: 0.10,
    notes: "Bluegrass, ryegrass, fescue. Reduce by 0.10 with careful water mgmt"
  },
  {
    name: "Turf Grass (warm season)",
    category: "Forages",
    kc_initial: 0.80,
    kc_mid: 0.85,
    kc_end: 0.85,
    growing_days: 240,
    max_height_m: 0.10,
    notes: "Bermuda, St. Augustine"
  },

  // ==========================================
  // k. Sugar Cane
  // ==========================================
  {
    name: "Sugarcane",
    category: "Sugar Cane",
    kc_initial: 0.40,
    kc_mid: 1.25,
    kc_end: 0.75,
    growing_days: 365,
    max_height_m: 3.0,
    notes: ""
  },

  // ==========================================
  // l. Tropical Fruits and Trees
  // ==========================================
  {
    name: "Banana (1st year)",
    category: "Tropical Fruits",
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 1.00,
    growing_days: 390,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Banana (2nd year)",
    category: "Tropical Fruits",
    kc_initial: 1.00,
    kc_mid: 1.20,
    kc_end: 1.10,
    growing_days: 365,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Cacao",
    category: "Tropical Fruits",
    kc_initial: 1.00,
    kc_mid: 1.05,
    kc_end: 1.05,
    growing_days: 365,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Coffee (bare ground)",
    category: "Tropical Fruits",
    kc_initial: 0.90,
    kc_mid: 0.95,
    kc_end: 0.95,
    growing_days: 365,
    max_height_m: 2.5,
    notes: ""
  },
  {
    name: "Coffee (with weeds)",
    category: "Tropical Fruits",
    kc_initial: 1.05,
    kc_mid: 1.10,
    kc_end: 1.10,
    growing_days: 365,
    max_height_m: 2.5,
    notes: ""
  },
  {
    name: "Date Palms",
    category: "Tropical Fruits",
    kc_initial: 0.90,
    kc_mid: 0.95,
    kc_end: 0.95,
    growing_days: 365,
    max_height_m: 8.0,
    notes: ""
  },
  {
    name: "Palm Trees",
    category: "Tropical Fruits",
    kc_initial: 0.95,
    kc_mid: 1.00,
    kc_end: 1.00,
    growing_days: 365,
    max_height_m: 8.0,
    notes: ""
  },
  {
    name: "Pineapple (bare soil)",
    category: "Tropical Fruits",
    kc_initial: 0.50,
    kc_mid: 0.30,
    kc_end: 0.30,
    growing_days: 365,
    max_height_m: 0.9,
    notes: "Low transpiration; mostly soil evaporation"
  },
  {
    name: "Pineapple (with grass cover)",
    category: "Tropical Fruits",
    kc_initial: 0.50,
    kc_mid: 0.50,
    kc_end: 0.50,
    growing_days: 365,
    max_height_m: 0.9,
    notes: ""
  },
  {
    name: "Rubber Trees",
    category: "Tropical Fruits",
    kc_initial: 0.95,
    kc_mid: 1.00,
    kc_end: 1.00,
    growing_days: 365,
    max_height_m: 10.0,
    notes: ""
  },
  {
    name: "Tea (non-shaded)",
    category: "Tropical Fruits",
    kc_initial: 0.95,
    kc_mid: 1.00,
    kc_end: 1.00,
    growing_days: 365,
    max_height_m: 1.5,
    notes: ""
  },
  {
    name: "Tea (shaded)",
    category: "Tropical Fruits",
    kc_initial: 1.10,
    kc_mid: 1.15,
    kc_end: 1.15,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },

  // ==========================================
  // m. Grapes and Berries
  // ==========================================
  {
    name: "Berries (bushes)",
    category: "Grapes and Berries",
    kc_initial: 0.30,
    kc_mid: 1.05,
    kc_end: 0.50,
    growing_days: 150,
    max_height_m: 1.5,
    notes: ""
  },
  {
    name: "Grapes (Table/Raisin)",
    category: "Grapes and Berries",
    kc_initial: 0.30,
    kc_mid: 0.85,
    kc_end: 0.45,
    growing_days: 240,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Grapes (Wine)",
    category: "Grapes and Berries",
    kc_initial: 0.30,
    kc_mid: 0.70,
    kc_end: 0.45,
    growing_days: 210,
    max_height_m: 1.75,
    notes: "Higher Kc for mid latitudes with longer growing season"
  },
  {
    name: "Hops",
    category: "Grapes and Berries",
    kc_initial: 0.30,
    kc_mid: 1.05,
    kc_end: 0.85,
    growing_days: 155,
    max_height_m: 5.0,
    notes: ""
  },

  // ==========================================
  // n. Fruit Trees
  // ==========================================
  {
    name: "Almonds (no ground cover)",
    category: "Fruit Trees",
    kc_initial: 0.40,
    kc_mid: 0.90,
    kc_end: 0.65,
    growing_days: 240,
    max_height_m: 5.0,
    notes: ""
  },
  {
    name: "Apples/Cherries/Pears (no cover, frost)",
    category: "Fruit Trees",
    kc_initial: 0.45,
    kc_mid: 0.95,
    kc_end: 0.70,
    growing_days: 210,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Apples/Cherries/Pears (no cover, no frost)",
    category: "Fruit Trees",
    kc_initial: 0.60,
    kc_mid: 0.95,
    kc_end: 0.75,
    growing_days: 240,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Apples/Cherries/Pears (active cover, frost)",
    category: "Fruit Trees",
    kc_initial: 0.50,
    kc_mid: 1.20,
    kc_end: 0.95,
    growing_days: 210,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Apples/Cherries/Pears (active cover, no frost)",
    category: "Fruit Trees",
    kc_initial: 0.80,
    kc_mid: 1.20,
    kc_end: 0.85,
    growing_days: 240,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Apricots/Peaches/Stone Fruit (no cover, frost)",
    category: "Fruit Trees",
    kc_initial: 0.45,
    kc_mid: 0.90,
    kc_end: 0.65,
    growing_days: 180,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Apricots/Peaches/Stone Fruit (no cover, no frost)",
    category: "Fruit Trees",
    kc_initial: 0.55,
    kc_mid: 0.90,
    kc_end: 0.65,
    growing_days: 210,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Apricots/Peaches/Stone Fruit (active cover, frost)",
    category: "Fruit Trees",
    kc_initial: 0.50,
    kc_mid: 1.15,
    kc_end: 0.90,
    growing_days: 180,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Apricots/Peaches/Stone Fruit (active cover, no frost)",
    category: "Fruit Trees",
    kc_initial: 0.80,
    kc_mid: 1.15,
    kc_end: 0.85,
    growing_days: 210,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Avocado (no ground cover)",
    category: "Fruit Trees",
    kc_initial: 0.60,
    kc_mid: 0.85,
    kc_end: 0.75,
    growing_days: 365,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Citrus (70% canopy, no cover)",
    category: "Fruit Trees",
    kc_initial: 0.70,
    kc_mid: 0.65,
    kc_end: 0.70,
    growing_days: 365,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Citrus (50% canopy, no cover)",
    category: "Fruit Trees",
    kc_initial: 0.65,
    kc_mid: 0.60,
    kc_end: 0.65,
    growing_days: 365,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Citrus (20% canopy, no cover)",
    category: "Fruit Trees",
    kc_initial: 0.50,
    kc_mid: 0.45,
    kc_end: 0.55,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Citrus (70% canopy, with cover)",
    category: "Fruit Trees",
    kc_initial: 0.75,
    kc_mid: 0.70,
    kc_end: 0.75,
    growing_days: 365,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Citrus (50% canopy, with cover)",
    category: "Fruit Trees",
    kc_initial: 0.80,
    kc_mid: 0.80,
    kc_end: 0.80,
    growing_days: 365,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Citrus (20% canopy, with cover)",
    category: "Fruit Trees",
    kc_initial: 0.85,
    kc_mid: 0.85,
    kc_end: 0.85,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Conifer Trees",
    category: "Fruit Trees",
    kc_initial: 1.00,
    kc_mid: 1.00,
    kc_end: 1.00,
    growing_days: 365,
    max_height_m: 10.0,
    notes: ""
  },
  {
    name: "Kiwi",
    category: "Fruit Trees",
    kc_initial: 0.40,
    kc_mid: 1.05,
    kc_end: 1.05,
    growing_days: 240,
    max_height_m: 3.0,
    notes: ""
  },
  {
    name: "Olives (40-60% canopy)",
    category: "Fruit Trees",
    kc_initial: 0.65,
    kc_mid: 0.70,
    kc_end: 0.70,
    growing_days: 270,
    max_height_m: 4.0,
    notes: "Higher Kc for higher canopy cover"
  },
  {
    name: "Pistachios (no ground cover)",
    category: "Fruit Trees",
    kc_initial: 0.40,
    kc_mid: 1.10,
    kc_end: 0.45,
    growing_days: 210,
    max_height_m: 4.0,
    notes: ""
  },
  {
    name: "Walnut Orchard",
    category: "Fruit Trees",
    kc_initial: 0.50,
    kc_mid: 1.10,
    kc_end: 0.65,
    growing_days: 240,
    max_height_m: 4.5,
    notes: ""
  },

  // ==========================================
  // o. Wetlands - Temperate Climate
  // ==========================================
  {
    name: "Cattails/Bulrushes (frost)",
    category: "Wetlands",
    kc_initial: 0.30,
    kc_mid: 1.20,
    kc_end: 0.30,
    growing_days: 180,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Cattails/Bulrushes (no frost)",
    category: "Wetlands",
    kc_initial: 0.60,
    kc_mid: 1.20,
    kc_end: 0.60,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Reed Swamp (standing water)",
    category: "Wetlands",
    kc_initial: 1.00,
    kc_mid: 1.20,
    kc_end: 1.00,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },
  {
    name: "Reed Swamp (moist soil)",
    category: "Wetlands",
    kc_initial: 0.90,
    kc_mid: 1.20,
    kc_end: 0.70,
    growing_days: 365,
    max_height_m: 2.0,
    notes: ""
  },

  // ==========================================
  // p. Special
  // ==========================================
  {
    name: "Open Water (< 2m depth)",
    category: "Special",
    kc_initial: 1.05,
    kc_mid: 1.05,
    kc_end: 1.05,
    growing_days: 365,
    max_height_m: null,
    notes: "Shallow water bodies in subhumid/tropical climates"
  },
  {
    name: "Open Water (> 5m depth)",
    category: "Special",
    kc_initial: 0.65,
    kc_mid: 0.65,
    kc_end: 0.65,
    growing_days: 365,
    max_height_m: null,
    notes: "Deep clear water in temperate climate"
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find a crop by exact name match (case-insensitive)
 * @param {string} name - Crop name to search for
 * @returns {Object|undefined} - Crop object if found
 */
function findCropByName(name) {
  return FAO56_CROP_DATABASE.find(
    crop => crop.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Search crops by partial name match (case-insensitive)
 * @param {string} query - Search query
 * @returns {Array} - Matching crop objects
 */
function searchCrops(query) {
  const lowerQuery = query.toLowerCase();
  return FAO56_CROP_DATABASE.filter(
    crop => crop.name.toLowerCase().includes(lowerQuery) ||
            crop.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all crops in a specific category
 * @param {string} category - Category name
 * @returns {Array} - Crops in the category
 */
function getCropsByCategory(category) {
  return FAO56_CROP_DATABASE.filter(
    crop => crop.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all unique categories
 * @returns {Array} - List of category names
 */
function getAllCategories() {
  return [...new Set(FAO56_CROP_DATABASE.map(crop => crop.category))];
}

/**
 * Calculate ETc (crop evapotranspiration) for a given crop and ETo
 * ETc = Kc * ETo
 * @param {string} cropName - Name of the crop
 * @param {string} stage - Growth stage ('initial' | 'mid' | 'end')
 * @param {number} eto - Reference evapotranspiration (mm/day)
 * @returns {number|null} - Crop evapotranspiration (mm/day)
 */
function calculateETc(cropName, stage, eto) {
  const crop = findCropByName(cropName);
  if (!crop) return null;
  
  const kcMap = {
    'initial': crop.kc_initial,
    'mid': crop.kc_mid,
    'end': crop.kc_end
  };
  
  const kc = kcMap[stage];
  if (!kc) return null;
  
  return kc * eto;
}

/**
 * Get crop coefficient curve data points for a crop
 * Returns Kc values for all four growth stages
 * @param {string} cropName - Name of the crop
 * @returns {Object|null} - Kc curve data
 */
function getKcCurve(cropName) {
  const crop = findCropByName(cropName);
  if (!crop) return null;
  
  return {
    name: crop.name,
    category: crop.category,
    kc_initial: crop.kc_initial,
    kc_mid: crop.kc_mid,
    kc_end: crop.kc_end,
    growing_days: crop.growing_days,
    max_height_m: crop.max_height_m,
    notes: crop.notes
  };
}

/**
 * Estimate Kc for a specific day of the growing period
 * Uses linear interpolation between growth stages
 * @param {string} cropName - Name of the crop
 * @param {number} day - Day number within growing period (1 to growing_days)
 * @param {number} iniDays - Length of initial stage (days)
 * @param {number} devDays - Length of development stage (days)
 * @param {number} midDays - Length of mid-season stage (days)
 * @param {number} lateDays - Length of late season stage (days)
 * @returns {number|null} - Interpolated Kc value
 */
function estimateKcForDay(cropName, day, iniDays, devDays, midDays, lateDays) {
  const crop = findCropByName(cropName);
  if (!crop) return null;
  
  const totalDays = iniDays + devDays + midDays + lateDays;
  if (day < 1 || day > totalDays) return null;
  
  // Initial stage: constant Kc
  if (day <= iniDays) {
    return crop.kc_initial;
  }
  
  // Development stage: linear interpolation from Kc_ini to Kc_mid
  if (day <= iniDays + devDays) {
    const progress = (day - iniDays) / devDays;
    return crop.kc_initial + progress * (crop.kc_mid - crop.kc_initial);
  }
  
  // Mid-season stage: constant Kc
  if (day <= iniDays + devDays + midDays) {
    return crop.kc_mid;
  }
  
  // Late season stage: linear interpolation from Kc_mid to Kc_end
  const lateDay = day - (iniDays + devDays + midDays);
  const progress = lateDay / lateDays;
  return crop.kc_mid + progress * (crop.kc_end - crop.kc_mid);
}

// ============================================================================
// EXPORTS (for ES modules / CommonJS / Browser)
// ============================================================================

const FAO56 = {
  FAO56_CROP_DATABASE,
  findCropByName,
  searchCrops,
  getCropsByCategory,
  getAllCategories,
  calculateETc,
  getKcCurve,
  estimateKcForDay
};

// CommonJS export (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAO56;
}

// Browser global
if (typeof window !== 'undefined') {
  window.FAO56_CROP_DATABASE = FAO56_CROP_DATABASE;
  window.FAO56 = FAO56;
}

// ES Module default export
if (typeof exports === 'object' && typeof module !== 'undefined') {
  // Already handled above via CommonJS
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return FAO56; });
}
