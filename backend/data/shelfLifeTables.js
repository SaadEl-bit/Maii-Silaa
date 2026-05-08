// Reference shelf-life days by crop and storage class for SILA countdown.

/**
 * FAO Grain Storage Conditions Database
 * Sources: 
 * - FAO "Manual of the Prevention of Post-Harvest Grain Losses" (x5065e)
 * - FAO Post-Harvest Compendium (Rice, Maize, Wheat, Barley)
 * - FAO "Grain crop drying, handling and storage" (i2433e)
 * - FAO "Towards integrated commodity..." (x5048e)
 * 
 * Fields:
 *   - name: Crop name
 *   - category: Crop grouping
 *   - storage_temp_c: Recommended storage temperature (°C)
 *   - storage_temp_range_c: Acceptable temperature range (°C)
 *   - relative_humidity_pct: Recommended relative humidity (%)
 *   - rh_range_pct: Acceptable RH (Relative Humidity) range (%)
 *   - max_moisture_pct: Maximum safe moisture content (% wet basis)
 *   - typical_duration_months: Typical safe storage duration (months)
 *   - duration_notes: Conditions affecting duration
 *   - quality_loss_indicators: Signs of quality deterioration
 *   - notes: Additional FAO guidance
 */

const FAO_GRAIN_STORAGE_DATABASE = [
  // ==========================================
  // CEREALS
  // ==========================================
  {
    name: "Wheat",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.5,
    typical_duration_months: 12,
    duration_notes: "Up to 12+ months at <13.5% moisture and <15°C. At 20-30°C with 70% RH, equilibrium moisture ~14.2% (approaches limit).",
    quality_loss_indicators: "Mould growth above 70% RH; insect breeding above 15°C; musty odour; germination loss",
    notes: "FAO: Cool to <15°C ASAP. Insects active 15-40°C. Grain weevil breeds at 13°C+. For long-term >1 year, moisture should be ≤13%."
  },
  {
    name: "Rice (Paddy)",
    category: "Cereals",
    storage_temp_c: 17,
    storage_temp_range_c: "15-20",
    relative_humidity_pct: 70,
    rh_range_pct: "60-75",
    max_moisture_pct: 14.0,
    typical_duration_months: 6,
    duration_notes: "14% moisture: up to 6 months. <12% moisture: >6 months. At 27°C+70% RH, equilibrium ~13.5% (safe).",
    quality_loss_indicators: "Yellowing from stackburn; mould at >14% moisture; increased brokens; rancidity in brown rice",
    notes: "FAO: Store in cool dry place with minimal temperature variation. Aeration to ~17°C effectively minimises insects. Parboiled rice more resistant to fungi."
  },
  {
    name: "Rice (Milled)",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 12.0,
    typical_duration_months: 3,
    duration_notes: "Shorter duration than paddy due to bran removal. Brown rice oil turns rancid reducing storage life.",
    quality_loss_indicators: "Rancidity from bran oil oxidation; moisture absorption; insect infestation",
    notes: "FAO: White rice stores better than brown rice. Re-entry of moisture must be avoided."
  },
  {
    name: "Maize (White)",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.5,
    typical_duration_months: 6,
    duration_notes: "At 20-30°C+70% RH, equilibrium moisture ~13.8% (near limit). Hot damp climates = very high losses.",
    quality_loss_indicators: "Mould and aflatoxin risk; insect hotspot development; germ damage (high oil content)",
    notes: "FAO: Losses minimal in cool dry, marked in hot dry, high in cool damp, very high in hot damp. Flint maize more resistant than dent."
  },
  {
    name: "Maize (Yellow)",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.0,
    typical_duration_months: 6,
    duration_notes: "At 20-30°C+70% RH, equilibrium ~13.1%. At 30-40°C+70% RH, equilibrium ~13.3%.",
    quality_loss_indicators: "Mould at >13-14% moisture; weevil infestation; germ damage from high oil content",
    notes: "FAO: For sale as #2 grain by spring: 15% max. Up to 1 year: 14%. >1 year: 13%."
  },
  {
    name: "Barley",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.5,
    typical_duration_months: 12,
    duration_notes: "For malting: <12% optimal. Feed barley slightly more tolerant.",
    quality_loss_indicators: "Germination loss for seed; mould at >14%; protein degradation for malting",
    notes: "FAO: Low moisture <12% facilitates long-term storage. For malting, uniform germination and low protein (9-12%) required."
  },
  {
    name: "Sorghum",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.5,
    typical_duration_months: 12,
    duration_notes: "At 20-30°C+70% RH, equilibrium ~13.8%. At 30-40°C+70% RH, equilibrium ~13.0%.",
    quality_loss_indicators: "Mould growth; insect infestation; discolouration",
    notes: "FAO: Harder grain more resistant to pests. Traditional unthreshed storage offers protection."
  },
  {
    name: "Millet",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 70,
    rh_range_pct: "60-75",
    max_moisture_pct: 15.0,
    typical_duration_months: 6,
    duration_notes: "Higher moisture tolerance than other cereals. At 27°C+70% RH, equilibrium ~16.0%.",
    quality_loss_indicators: "Insect infestation (millet moth); mould at >15% moisture; rancidity",
    notes: "FAO: Small grains require careful handling to avoid breakage. Traditional storage in cribs with good ventilation."
  },
  {
    name: "Oats",
    category: "Cereals",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 13.0,
    typical_duration_months: 12,
    duration_notes: "Similar to wheat. High oil content in groats requires careful storage.",
    quality_loss_indicators: "Rancidity from oil oxidation; mould; insect damage",
    notes: "FAO: Store like wheat. Processed oats (groats, flakes) have shorter storage life."
  },

  // ==========================================
  // LEGUMES / PULSES
  // ==========================================
  {
    name: "Beans (haricot/horse)",
    category: "Legumes",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 15.0,
    typical_duration_months: 6,
    duration_notes: "Higher moisture tolerance than cereals. Bruchid beetle major pest at warm temperatures.",
    quality_loss_indicators: "Bruchid infestation (holes in seeds); mould at >15%; hard-to-cook defect",
    notes: "FAO: Unthreshed pods provide protection against bruchids. Clean, dry storage essential."
  },
  {
    name: "Cowpeas",
    category: "Legumes",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 14.0,
    typical_duration_months: 6,
    duration_notes: "Bruchids major pest. Unthreshed storage recommended where practical.",
    quality_loss_indicators: "Bruchid damage; mould; discolouration; hard-to-cook",
    notes: "FAO: Better stored unthreshed as intact pods provide protection. Thresh only before use."
  },
  {
    name: "Lentils",
    category: "Legumes",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 14.0,
    typical_duration_months: 12,
    duration_notes: "Relatively stable if dry. At 20-30°C+70% RH, equilibrium ~14.2%.",
    quality_loss_indicators: "Bruchid damage; mould; splitting during handling",
    notes: "FAO: Store like other pulses. Good husk cover reduces field infestation."
  },
  {
    name: "Soybeans",
    category: "Legumes",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 11.0,
    typical_duration_months: 12,
    duration_notes: "Low moisture requirement due to high oil content. At 27°C+70% RH, equilibrium ~11.0%.",
    quality_loss_indicators: "Rancidity from oil oxidation; mould; insect damage; germination loss",
    notes: "FAO: For storage up to 1 year: 12% max. High oil content makes soybeans more susceptible to rancidity than cereals."
  },
  {
    name: "Groundnuts (unshelled)",
    category: "Legumes",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 9.0,
    typical_duration_months: 6,
    duration_notes: "Shell provides natural protection. At 20-30°C+70% RH, equilibrium ~9.1%.",
    quality_loss_indicators: "Aflatoxin from Aspergillus flavus; rancidity; insect damage (peanut bruchid)",
    notes: "FAO: Very low moisture requirement due to high oil content. Store in pods until use."
  },
  {
    name: "Groundnuts (shelled)",
    category: "Legumes",
    storage_temp_c: 10,
    storage_temp_range_c: "5-15",
    relative_humidity_pct: 60,
    rh_range_pct: "50-65",
    max_moisture_pct: 7.0,
    typical_duration_months: 3,
    duration_notes: "Very short safe period due to exposed oil. At 20-30°C+70% RH, equilibrium ~9.1% (dangerous).",
    quality_loss_indicators: "Rapid rancidity; aflatoxin; mould; insect infestation",
    notes: "FAO: Most demanding storage conditions. 7% moisture absolute maximum. Cool storage critical."
  },

  // ==========================================
  // ROOTS AND TUBERS
  // ==========================================
  {
    name: "Cassava (fresh roots)",
    category: "Roots and Tubers",
    storage_temp_c: 25,
    storage_temp_range_c: "20-30",
    relative_humidity_pct: 85,
    rh_range_pct: "80-90",
    max_moisture_pct: 65.0,
    typical_duration_months: 0.25,
    duration_notes: "Very perishable. 2-7 days at ambient tropical conditions. Can extend to 2-4 weeks with proper ventilation.",
    quality_loss_indicators: "Physiological deterioration (vascular streaking); mould; sprouting; cyanogenic compound changes",
    notes: "FAO: Fresh cassava is highly perishable. Process into dried products (gari, flour) for longer storage."
  },
  {
    name: "Cassava (dried chips/flour)",
    category: "Roots and Tubers",
    storage_temp_c: 20,
    storage_temp_range_c: "15-25",
    relative_humidity_pct: 70,
    rh_range_pct: "60-75",
    max_moisture_pct: 14.0,
    typical_duration_months: 6,
    duration_notes: "Dried products store like cereals. Must be properly dried immediately after processing.",
    quality_loss_indicators: "Mould; insect infestation (larger grain borer); re-absorption of moisture",
    notes: "FAO: Drying to <14% within 2-3 days of harvest critical. Store in airtight containers if possible."
  },
  {
    name: "Potato",
    category: "Roots and Tubers",
    storage_temp_c: 10,
    storage_temp_range_c: "4-15",
    relative_humidity_pct: 90,
    rh_range_pct: "85-95",
    max_moisture_pct: 80.0,
    typical_duration_months: 3,
    duration_notes: "4-8°C optimal for long-term. >10°C causes sprouting. <4°C causes cold sweetening.",
    quality_loss_indicators: "Sprouting; soft rot; late blight; cold sweetening (low temperature); shrivelling",
    notes: "FAO: Difficult to store in tropics without refrigeration. Diffuse light storage extends life in developing countries."
  },
  {
    name: "Sweet Potato",
    category: "Roots and Tubers",
    storage_temp_c: 15,
    storage_temp_range_c: "12-18",
    relative_humidity_pct: 85,
    rh_range_pct: "80-90",
    max_moisture_pct: 75.0,
    typical_duration_months: 3,
    duration_notes: "Curing at 25-30°C+90% RH for 5-7 days before storage heals wounds and extends life.",
    quality_loss_indicators: "Soft rot; sprouting; weevil damage; shrivelling; chilling injury at <10°C",
    notes: "FAO: Curing before storage essential. Handle carefully to avoid mechanical damage."
  },
  {
    name: "Yam",
    category: "Roots and Tubers",
    storage_temp_c: 25,
    storage_temp_range_c: "20-30",
    relative_humidity_pct: 80,
    rh_range_pct: "70-90",
    max_moisture_pct: 70.0,
    typical_duration_months: 4,
    duration_notes: "Traditional barn storage 3-6 months. Ventilated crib storage reduces losses.",
    quality_loss_indicators: "Sprouting; rot; shrivelling; pest damage (yam beetle); physiological deterioration",
    notes: "FAO: Store in well-ventilated structures. Avoid mechanical damage during harvest."
  },

  // ==========================================
  // VEGETABLES (Small Vegetables from FAO-56)
  // ==========================================
  {
    name: "Onion (dry bulbs)",
    category: "Small Vegetables",
    storage_temp_c: 20,
    storage_temp_range_c: "15-25",
    relative_humidity_pct: 65,
    rh_range_pct: "60-70",
    max_moisture_pct: 10.0,
    typical_duration_months: 6,
    duration_notes: "Curing at 30-35°C for 2-4 weeks before storage. Low RH essential to prevent sprouting and rot.",
    quality_loss_indicators: "Sprouting; neck rot; black mould; soft rot; shrivelling",
    notes: "FAO: Good ventilation essential. Store in slatted crates or hanging braids. Green onions: 0-5°C, 95% RH, 2-3 weeks."
  },
  {
    name: "Garlic",
    category: "Small Vegetables",
    storage_temp_c: 20,
    storage_temp_range_c: "15-25",
    relative_humidity_pct: 65,
    rh_range_pct: "60-70",
    max_moisture_pct: 10.0,
    typical_duration_months: 6,
    duration_notes: "Curing before storage like onion. Can store 6-8 months under ideal conditions.",
    quality_loss_indicators: "Sprouting; mould; desiccation; waxy breakdown (high temperature)",
    notes: "FAO: Store in braided strings or ventilated containers. Avoid high humidity."
  },
  {
    name: "Carrots",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 6,
    duration_notes: "At 0°C+95% RH: 6-9 months. Topped carrots store longer than bunched.",
    quality_loss_indicators: "Sprouting; soft rot; wilting; bitterness; white root growth",
    notes: "FAO: Rapid pre-cooling after harvest. Store in perforated plastic liners to maintain humidity."
  },
  {
    name: "Cabbage",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 4,
    duration_notes: "Late varieties store 3-6 months. Early varieties: 2-3 months only.",
    quality_loss_indicators: "Yellowing; wilting; black speck; vein discoloration; soft rot; core rot",
    notes: "FAO: Store at 0°C immediately after harvest. Wrapping in perforated film extends life."
  },
  {
    name: "Lettuce",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 92.0,
    typical_duration_months: 0.5,
    duration_notes: "Very perishable. 1-3 weeks maximum at optimal conditions. Iceberg lasts longer than leaf types.",
    quality_loss_indicators: "Russet spotting; pink rib; tipburn; wilting; rot; ethylene damage",
    notes: "FAO: Rapid cooling to near 0°C essential. Store in perforated cartons. Avoid ethylene exposure."
  },
  {
    name: "Spinach",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 0.5,
    duration_notes: "10-14 days at 0°C. Highly perishable leafy green.",
    quality_loss_indicators: "Yellowing; wilting; rot; off-odours; slime",
    notes: "FAO: Pre-cool immediately. Package in perforated film to maintain RH."
  },
  {
    name: "Broccoli",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 0.5,
    duration_notes: "10-14 days at 0°C. Ethylene sensitive.",
    quality_loss_indicators: "Yellowing of florets; wilting; rot; off-odours; toughening of stems",
    notes: "FAO: Rapid forced-air cooling after harvest. Store at 0°C with high RH."
  },
  {
    name: "Cauliflower",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 0.75,
    duration_notes: "2-4 weeks at 0°C. Wrapper leaves protect curd.",
    quality_loss_indicators: "Yellowing; browning; soft rot; black rot; wilting; riceyness",
    notes: "FAO: Store with wrapper leaves intact. Pre-cool rapidly."
  },
  {
    name: "Celery",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 2,
    duration_notes: "2-3 months at 0°C. Very high water content requires near-saturated RH.",
    quality_loss_indicators: "Wilting; pithiness; black heart; rot; yellowing",
    notes: "FAO: Store in crates lined with perforated film. Avoid ethylene (causes epinasty)."
  },
  {
    name: "Radish",
    category: "Small Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-5",
    relative_humidity_pct: 95,
    rh_range_pct: "90-100",
    max_moisture_pct: 90.0,
    typical_duration_months: 1,
    duration_notes: "4-6 weeks at 0°C. Topped stores longer than bunched.",
    quality_loss_indicators: "Sprouting; soft rot; pithiness; wilting; black root rot",
    notes: "FAO: Remove tops before storage. Store in perforated plastic bags."
  },

  // ==========================================
  // FRUITS (Tropical and Temperate)
  // ==========================================
  {
    name: "Banana",
    category: "Tropical Fruits",
    storage_temp_c: 13,
    storage_temp_range_c: "12-14",
    relative_humidity_pct: 90,
    rh_range_pct: "85-95",
    max_moisture_pct: 85.0,
    typical_duration_months: 0.5,
    duration_notes: "Green bananas: 2-4 weeks at 13°C. Ripe: 3-7 days at 15°C. Chilling injury at <12°C.",
    quality_loss_indicators: "Chilling injury (grey skin, poor ripening); anthracnose; crown rot; premature ripening",
    notes: "FAO: Store at 13°C for green bananas. Ripen at 15-18°C. Never below 12°C."
  },
  {
    name: "Citrus (Orange)",
    category: "Tropical Fruits",
    storage_temp_c: 5,
    storage_temp_range_c: "3-10",
    relative_humidity_pct: 90,
    rh_range_pct: "85-95",
    max_moisture_pct: 85.0,
    typical_duration_months: 3,
    duration_notes: "3-4 months at 5°C. Mandarins: 2-4 weeks. Chilling injury varies by species.",
    quality_loss_indicators: "Chilling injury (pitting, oil spotting); green mould; blue mould; stem-end rot; dehydration",
    notes: "FAO: Store at 5-10°C depending on species. High RH essential to prevent weight loss."
  },
  {
    name: "Pineapple",
    category: "Tropical Fruits",
    storage_temp_c: 10,
    storage_temp_range_c: "7-12",
    relative_humidity_pct: 85,
    rh_range_pct: "80-90",
    max_moisture_pct: 85.0,
    typical_duration_months: 1,
    duration_notes: "2-4 weeks at 10°C. Green fruit stores longer than ripe. Chilling injury at <7°C.",
    quality_loss_indicators: "Chilling injury (internal browning); black heart; mould; fermentation; base rot",
    notes: "FAO: Store at 10°C for mature green fruit. Avoid temperatures below 7°C."
  },
  {
    name: "Mango",
    category: "Tropical Fruits",
    storage_temp_c: 12,
    storage_temp_range_c: "10-15",
    relative_humidity_pct: 85,
    rh_range_pct: "80-90",
    max_moisture_pct: 85.0,
    typical_duration_months: 0.75,
    duration_notes: "2-4 weeks at 12°C for mature green. Ripe: 5-7 days. Chilling injury at <10°C.",
    quality_loss_indicators: "Chilling injury (discoloured flesh, poor ripening); anthracnose; stem-end rot; soft nose",
    notes: "FAO: Store mature green at 12°C. Ripen at 20-25°C. Never store ripe mangoes below 10°C."
  },
  {
    name: "Papaya",
    category: "Tropical Fruits",
    storage_temp_c: 10,
    storage_temp_range_c: "7-13",
    relative_humidity_pct: 90,
    rh_range_pct: "85-95",
    max_moisture_pct: 88.0,
    typical_duration_months: 0.5,
    duration_notes: "2-3 weeks at 10°C for mature green. Ripe: 3-5 days. Chilling injury at <7°C.",
    quality_loss_indicators: "Chilling injury; anthracnose; stem-end rot; internal yellowing; skin scald",
    notes: "FAO: Store at 10°C for mature fruit. Ripen at room temperature."
  },
  {
    name: "Apple",
    category: "Fruit Trees",
    storage_temp_c: 0,
    storage_temp_range_c: "-1 to 4",
    relative_humidity_pct: 95,
    rh_range_pct: "90-98",
    max_moisture_pct: 85.0,
    typical_duration_months: 6,
    duration_notes: "6-12 months at 0°C depending on variety. CA storage extends to 8-12 months.",
    quality_loss_indicators: "Soft scald; bitter pit; superficial scald; core flush; rot; wilting",
    notes: "FAO: Rapid cooling to 0°C after harvest. CA storage (1-3% O2, 1-3% CO2) extends life significantly."
  },
  {
    name: "Grapes (Table)",
    category: "Grapes and Berries",
    storage_temp_c: -1,
    storage_temp_range_c: "-1 to 0",
    relative_humidity_pct: 95,
    rh_range_pct: "90-98",
    max_moisture_pct: 80.0,
    typical_duration_months: 2,
    duration_notes: "2-8 weeks at -1°C. SO2 treatment extends life. Rapid pre-cooling essential.",
    quality_loss_indicators: "Botrytis (grey mould); berry shatter; stem browning; dehydration; SO2 injury",
    notes: "FAO: Store at -1°C with high RH. SO2 pads or fumigation standard practice for long storage."
  },
  {
    name: "Strawberries",
    category: "Perennial Vegetables",
    storage_temp_c: 0,
    storage_temp_range_c: "0-2",
    relative_humidity_pct: 95,
    rh_range_pct: "90-98",
    max_moisture_pct: 90.0,
    typical_duration_months: 0.25,
    duration_notes: "5-10 days at 0°C. Very perishable. Rapid cooling essential.",
    quality_loss_indicators: "Grey mould; leather rot; bruising; water soaking; off-flavours; alcohol odour",
    notes: "FAO: Harvest at 3/4 red stage. Cool to 0°C within 1 hour. Store in shallow containers."
  },

  // ==========================================
  // OIL CROPS
  // ==========================================
  {
    name: "Sunflower (seed)",
    category: "Oil Crops",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 10.0,
    typical_duration_months: 12,
    duration_notes: "Up to 6 months at 10% moisture; up to 1 year at 8% moisture.",
    quality_loss_indicators: "Rancidity; mould; insect damage; bird damage in field",
    notes: "FAO: High oil content requires low moisture. Store at 8% for >1 year."
  },
  {
    name: "Rapeseed / Canola",
    category: "Oil Crops",
    storage_temp_c: 15,
    storage_temp_range_c: "10-20",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 10.0,
    typical_duration_months: 12,
    duration_notes: "Similar to sunflower. Low moisture critical due to oil content.",
    quality_loss_indicators: "Rancidity; heating; mould; insect damage",
    notes: "FAO: Store like other oilseeds. 8-10% moisture for long-term storage."
  },

  // ==========================================
  // FIBRE CROPS
  // ==========================================
  {
    name: "Cotton (seed)",
    category: "Fibre Crops",
    storage_temp_c: 20,
    storage_temp_range_c: "15-25",
    relative_humidity_pct: 65,
    rh_range_pct: "50-70",
    max_moisture_pct: 12.0,
    typical_duration_months: 12,
    duration_notes: "Store like cereals. Free fatty acid increase indicates quality loss.",
    quality_loss_indicators: "Heating; free fatty acid increase; mould; discoloration",
    notes: "FAO: Store in dry conditions. Monitor for heating due to residual moisture in fuzzy seed."
  },

  // ==========================================
  // SUGAR CROPS
  // ==========================================
  {
    name: "Sugarcane (fresh)",
    category: "Sugar Cane",
    storage_temp_c: 25,
    storage_temp_range_c: "20-30",
    relative_humidity_pct: 85,
    rh_range_pct: "80-90",
    max_moisture_pct: 75.0,
    typical_duration_months: 0.25,
    duration_notes: "Very perishable. 3-7 days after cutting. Sucrose converts to invert sugars rapidly.",
    quality_loss_indicators: "Sucrose loss; inversion; microbial deterioration; drying; mechanical damage",
    notes: "FAO: Process within 24-48 hours of harvest for maximum sugar recovery."
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function findStorageByName(name) {
  return FAO_GRAIN_STORAGE_DATABASE.find(
    crop => crop.name.toLowerCase() === name.toLowerCase()
  );
}

function searchStorage(query) {
  const lowerQuery = query.toLowerCase();
  return FAO_GRAIN_STORAGE_DATABASE.filter(
    crop => crop.name.toLowerCase().includes(lowerQuery) ||
            crop.category.toLowerCase().includes(lowerQuery)
  );
}

function getStorageByCategory(category) {
  return FAO_GRAIN_STORAGE_DATABASE.filter(
    crop => crop.category.toLowerCase() === category.toLowerCase()
  );
}

function getAllStorageCategories() {
  return [...new Set(FAO_GRAIN_STORAGE_DATABASE.map(crop => crop.category))];
}

function estimateStorageLife(cropName, actualTemp, actualMoisture) {
  const crop = findStorageByName(cropName);
  if (!crop) return null;

  let factor = 1.0;

  // Temperature factor: for every 5°C above optimal, halve the duration
  const tempDiff = actualTemp - crop.storage_temp_c;
  if (tempDiff > 0) {
    factor *= Math.pow(0.5, tempDiff / 5);
  }

  // Moisture factor: for every 1% above max, halve the duration
  const moistureDiff = actualMoisture - crop.max_moisture_pct;
  if (moistureDiff > 0) {
    factor *= Math.pow(0.5, moistureDiff);
  }

  return {
    crop: crop.name,
    base_duration_months: crop.typical_duration_months,
    adjusted_duration_months: crop.typical_duration_months * factor,
    quality_risk: factor < 0.25 ? "HIGH" : factor < 0.5 ? "MODERATE" : "LOW",
    recommendation: factor < 0.5 ? "Improve storage conditions immediately" : "Conditions acceptable"
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const FAO_STORAGE = {
  FAO_GRAIN_STORAGE_DATABASE,
  findStorageByName,
  searchStorage,
  getStorageByCategory,
  getAllStorageCategories,
  estimateStorageLife
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAO_STORAGE;
}

if (typeof window !== 'undefined') {
  window.FAO_GRAIN_STORAGE_DATABASE = FAO_GRAIN_STORAGE_DATABASE;
  window.FAO_STORAGE = FAO_STORAGE;
}
