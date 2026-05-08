// Mock / synthetic rows for price_history when live feeds are unavailable (multi-source aware).

// Africa Crop Prices Data
// Compiled from: AGRA Food Security Monitor, USDA FAS, WFP VAM, FAOSTAT,
// Kenya Food Security Portal, Mkulima Bora, Morocco ONCA/HCP, and other official sources.
// Date compiled: 2026-05-07
// All prices are per kg in local currency unless otherwise noted.

const cropPrices = [
  // ============================================================
  // MOROCCO (MA) — Primary Country
  // ============================================================
  {
    country_code: "MA",
    crop_name: "wheat",
    price_per_kg: 2.70,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "wheat",
    price_per_kg: 2.65,
    currency: "MAD",
    market_name: "Marrakech",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "wheat",
    price_per_kg: 2.58,
    currency: "MAD",
    market_name: "Rabat",
    date: "2026-04-01",
    source_name: "USDA_FAS",
    source_url: "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Grain+and+Feed+Annual_Rabat_Morocco_12-11-2024"
  },
  {
    country_code: "MA",
    crop_name: "wheat",
    price_per_kg: 2.55,
    currency: "MAD",
    market_name: "National_Average",
    date: "2025-07-01",
    source_name: "USDA_FAS",
    source_url: "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Grain+and+Feed+Update_Rabat_Morocco_MO2025-0018.pdf"
  },
  {
    country_code: "MA",
    crop_name: "tomato",
    price_per_kg: 8.00,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2026-04-24",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "tomato",
    price_per_kg: 4.20,
    currency: "MAD",
    market_name: "Agadir",
    date: "2026-04-01",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "tomato",
    price_per_kg: 12.00,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2026-04-10",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "potato",
    price_per_kg: 2.80,
    currency: "MAD",
    market_name: "Fes",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "potato",
    price_per_kg: 7.00,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2025-01-15",
    source_name: "HCP",
    source_url: "https://www.hcp.ma/"
  },
  {
    country_code: "MA",
    crop_name: "barley",
    price_per_kg: 2.40,
    currency: "MAD",
    market_name: "Oujda",
    date: "2026-04-01",
    source_name: "USDA_FAS",
    source_url: "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Grain+and+Feed+Annual_Rabat_Morocco_12-11-2024"
  },
  {
    country_code: "MA",
    crop_name: "barley",
    price_per_kg: 2.35,
    currency: "MAD",
    market_name: "National_Average",
    date: "2025-07-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "onion",
    price_per_kg: 2.50,
    currency: "MAD",
    market_name: "Souss",
    date: "2026-04-01",
    source_name: "HCP",
    source_url: "https://www.hcp.ma/"
  },
  {
    country_code: "MA",
    crop_name: "onion",
    price_per_kg: 2.00,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2026-04-24",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "corn",
    price_per_kg: 3.00,
    currency: "MAD",
    market_name: "Tadla",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "corn",
    price_per_kg: 2.90,
    currency: "MAD",
    market_name: "National_Average",
    date: "2025-07-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "olive_oil",
    price_per_kg: 40.00,
    currency: "MAD",
    market_name: "Beni_Mellal",
    date: "2026-04-01",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "olive_oil",
    price_per_kg: 42.00,
    currency: "MAD",
    market_name: "Marrakech",
    date: "2026-04-01",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },
  {
    country_code: "MA",
    crop_name: "citrus_orange",
    price_per_kg: 5.00,
    currency: "MAD",
    market_name: "Berkane",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "citrus_orange",
    price_per_kg: 4.80,
    currency: "MAD",
    market_name: "Agadir",
    date: "2026-04-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },
  {
    country_code: "MA",
    crop_name: "carrot",
    price_per_kg: 2.50,
    currency: "MAD",
    market_name: "Casablanca",
    date: "2026-04-24",
    source_name: "ONCA",
    source_url: "https://www.onca.gov.ma/"
  },

  // ============================================================
  // SENEGAL (SN) — West Africa
  // ============================================================
  {
    country_code: "SN",
    crop_name: "rice",
    price_per_kg: 410.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "rice",
    price_per_kg: 450.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-10-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "rice",
    price_per_kg: 400.00,
    currency: "XOF",
    market_name: "Saint_Louis",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "millet",
    price_per_kg: 250.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "millet",
    price_per_kg: 230.00,
    currency: "XOF",
    market_name: "Kaolack",
    date: "2025-09-01",
    source_name: "Afrique_Verte",
    source_url: "https://www.afriqueverte.org/"
  },
  {
    country_code: "SN",
    crop_name: "sorghum",
    price_per_kg: 220.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "maize",
    price_per_kg: 200.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },
  {
    country_code: "SN",
    crop_name: "onion",
    price_per_kg: 350.00,
    currency: "XOF",
    market_name: "Dakar",
    date: "2025-09-01",
    source_name: "WFP_VAM",
    source_url: "https://dataviz.vam.wfp.org/"
  },

  // ============================================================
  // KENYA (KE) — East Africa
  // ============================================================
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 59.28,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-10-01",
    source_name: "RATIN",
    source_url: "https://ratin.net/"
  },
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 57.87,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-11-01",
    source_name: "RATIN",
    source_url: "https://ratin.net/"
  },
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 66.88,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-07-01",
    source_name: "RATIN",
    source_url: "https://ratin.net/"
  },
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 44.00,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 41.00,
    currency: "KES",
    market_name: "Nairobi_Wholesale",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "maize",
    price_per_kg: 50.00,
    currency: "KES",
    market_name: "Busia",
    date: "2026-01-09",
    source_name: "Mkulima_Bora",
    source_url: "https://portal.mkulimabora.org/market-prices"
  },
  {
    country_code: "KE",
    crop_name: "beans",
    price_per_kg: 138.00,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "beans",
    price_per_kg: 146.00,
    currency: "KES",
    market_name: "Nairobi_Wholesale",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "beans_rosecoco",
    price_per_kg: 160.00,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "beans_njahi",
    price_per_kg: 138.00,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "rice",
    price_per_kg: 165.31,
    currency: "KES",
    market_name: "Nairobi",
    date: "2025-09-01",
    source_name: "RATIN",
    source_url: "https://ratin.net/"
  },
  {
    country_code: "KE",
    crop_name: "rice",
    price_per_kg: 150.00,
    currency: "KES",
    market_name: "Nairobi_Wholesale",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "wheat",
    price_per_kg: 67.00,
    currency: "KES",
    market_name: "Nairobi_Wholesale",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "wheat",
    price_per_kg: 83.00,
    currency: "KES",
    market_name: "Nairobi_Retail",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "irish_potato",
    price_per_kg: 47.00,
    currency: "KES",
    market_name: "Nairobi_Wholesale",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },
  {
    country_code: "KE",
    crop_name: "irish_potato",
    price_per_kg: 60.00,
    currency: "KES",
    market_name: "Nairobi_Retail",
    date: "2025-02-01",
    source_name: "Food_Security_Portal",
    source_url: "https://www.foodsecurityportal.org/"
  },

  // ============================================================
  // NIGERIA (NG) — West Africa
  // ============================================================
  {
    country_code: "NG",
    crop_name: "maize",
    price_per_kg: 376.74,
    currency: "NGN",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NG",
    crop_name: "maize",
    price_per_kg: 381.39,
    currency: "NGN",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "NG",
    crop_name: "maize",
    price_per_kg: 260.00,
    currency: "NGN",
    market_name: "Lagos",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NG",
    crop_name: "rice",
    price_per_kg: 735.00,
    currency: "NGN",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NG",
    crop_name: "rice",
    price_per_kg: 848.97,
    currency: "NGN",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "NG",
    crop_name: "rice",
    price_per_kg: 586.00,
    currency: "NGN",
    market_name: "Lagos",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "NG",
    crop_name: "millet",
    price_per_kg: 416.48,
    currency: "NGN",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // GHANA (GH) — West Africa
  // ============================================================
  {
    country_code: "GH",
    crop_name: "maize",
    price_per_kg: 4.42,
    currency: "GHS",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "GH",
    crop_name: "maize",
    price_per_kg: 4.22,
    currency: "GHS",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "GH",
    crop_name: "rice",
    price_per_kg: 14.72,
    currency: "GHS",
    market_name: "National_Average",
    date: "2025-05-01",
    source_name: "AGRA",
    source_url: "https://reliefweb.int/report/world/food-security-monitor-may-2025"
  },

  // ============================================================
  // ETHIOPIA (ET) — East Africa / Horn of Africa
  // ============================================================
  {
    country_code: "ET",
    crop_name: "maize",
    price_per_kg: 44.38,
    currency: "ETB",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "ET",
    crop_name: "maize",
    price_per_kg: 44.38,
    currency: "ETB",
    market_name: "National_Average",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ET",
    crop_name: "wheat",
    price_per_kg: 67.00,
    currency: "ETB",
    market_name: "Addis_Ababa",
    date: "2025-02-01",
    source_name: "FAOSTAT",
    source_url: "https://www.fao.org/faostat/en/#data/PP"
  },

  // ============================================================
  // TANZANIA (TZ) — East Africa
  // ============================================================
  {
    country_code: "TZ",
    crop_name: "maize",
    price_per_kg: 750.00,
    currency: "TZS",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "TZ",
    crop_name: "maize",
    price_per_kg: 700.00,
    currency: "TZS",
    market_name: "National_Average",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "TZ",
    crop_name: "rice",
    price_per_kg: 2250.00,
    currency: "TZS",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // UGANDA (UG) — East Africa
  // ============================================================
  {
    country_code: "UG",
    crop_name: "maize",
    price_per_kg: 1418.52,
    currency: "UGX",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "UG",
    crop_name: "maize",
    price_per_kg: 1371.70,
    currency: "UGX",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "UG",
    crop_name: "maize_flour",
    price_per_kg: 2501.57,
    currency: "UGX",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },

  // ============================================================
  // RWANDA (RW) — East Africa
  // ============================================================
  {
    country_code: "RW",
    crop_name: "maize",
    price_per_kg: 636.24,
    currency: "RWF",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "RW",
    crop_name: "maize",
    price_per_kg: 639.24,
    currency: "RWF",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "RW",
    crop_name: "rice",
    price_per_kg: 1597.33,
    currency: "RWF",
    market_name: "National_Average",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // SOUTH SUDAN (SS) — East Africa / Horn of Africa
  // ============================================================
  {
    country_code: "SS",
    crop_name: "maize",
    price_per_kg: 4180.01,
    currency: "SSP",
    market_name: "National_Average",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "SS",
    crop_name: "maize",
    price_per_kg: 4181.21,
    currency: "SSP",
    market_name: "National_Average",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "SS",
    crop_name: "rice",
    price_per_kg: 3156.00,
    currency: "SSP",
    market_name: "National_Average",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // MALI (ML) — West Africa
  // ============================================================
  {
    country_code: "ML",
    crop_name: "rice",
    price_per_kg: 410.00,
    currency: "XOF",
    market_name: "Bamako",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ML",
    crop_name: "rice",
    price_per_kg: 560.00,
    currency: "XOF",
    market_name: "Gao",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ML",
    crop_name: "millet",
    price_per_kg: 200.00,
    currency: "XOF",
    market_name: "Segou",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ML",
    crop_name: "millet",
    price_per_kg: 225.00,
    currency: "XOF",
    market_name: "Sikasso",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // NIGER (NE) — West Africa
  // ============================================================
  {
    country_code: "NE",
    crop_name: "rice",
    price_per_kg: 460.00,
    currency: "XOF",
    market_name: "Niamey",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NE",
    crop_name: "rice",
    price_per_kg: 480.00,
    currency: "XOF",
    market_name: "Agadez",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NE",
    crop_name: "millet",
    price_per_kg: 185.00,
    currency: "XOF",
    market_name: "Niamey",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "NE",
    crop_name: "millet",
    price_per_kg: 240.00,
    currency: "XOF",
    market_name: "Zinder",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // BURKINA FASO (BF) — West Africa
  // ============================================================
  {
    country_code: "BF",
    crop_name: "rice",
    price_per_kg: 370.00,
    currency: "XOF",
    market_name: "Ouagadougou",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "BF",
    crop_name: "rice",
    price_per_kg: 325.00,
    currency: "XOF",
    market_name: "Bobo_Dioulasso",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // TOGO (TG) — West Africa
  // ============================================================
  {
    country_code: "TG",
    crop_name: "maize",
    price_per_kg: 191.00,
    currency: "XOF",
    market_name: "Centrale",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "TG",
    crop_name: "maize",
    price_per_kg: 161.00,
    currency: "XOF",
    market_name: "Lome",
    date: "2025-10-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/11/Food-Security-Monitor_October-2025.pdf"
  },
  {
    country_code: "TG",
    crop_name: "rice",
    price_per_kg: 473.00,
    currency: "XOF",
    market_name: "Centrale",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "TG",
    crop_name: "rice",
    price_per_kg: 649.00,
    currency: "XOF",
    market_name: "Lome",
    date: "2025-09-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // ZAMBIA (ZM) — Southern Africa
  // ============================================================
  {
    country_code: "ZM",
    crop_name: "maize",
    price_per_kg: 8.50,
    currency: "ZMW",
    market_name: "Lusaka",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ZM",
    crop_name: "rice",
    price_per_kg: 60.66,
    currency: "ZMW",
    market_name: "Lusaka",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // ZIMBABWE (ZW) — Southern Africa
  // ============================================================
  {
    country_code: "ZW",
    crop_name: "maize",
    price_per_kg: 0.81,
    currency: "USD",
    market_name: "Harare",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "ZW",
    crop_name: "rice",
    price_per_kg: 2.25,
    currency: "USD",
    market_name: "Harare",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // MALAWI (MW) — Southern Africa
  // ============================================================
  {
    country_code: "MW",
    crop_name: "maize",
    price_per_kg: 0.66,
    currency: "USD",
    market_name: "Lilongwe",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },
  {
    country_code: "MW",
    crop_name: "rice",
    price_per_kg: 2.43,
    currency: "USD",
    market_name: "Lilongwe",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // MOZAMBIQUE (MZ) — Southern Africa
  // ============================================================
  {
    country_code: "MZ",
    crop_name: "maize",
    price_per_kg: 0.28,
    currency: "USD",
    market_name: "Maputo",
    date: "2025-11-01",
    source_name: "AGRA",
    source_url: "https://agra.org/wp-content/uploads/2025/12/Food-Security-Monitor_Nov-2025_Final.pdf"
  },

  // ============================================================
  // GUINEA-BISSAU (GW) — West Africa
  // ============================================================
  {
    country_code: "GW",
    crop_name: "rice",
    price_per_kg: 550.00,
    currency: "XOF",
    market_name: "Bissau",
    date: "2025-02-01",
    source_name: "FAO_GIEWS",
    source_url: "https://www.fao.org/giews/countrybrief/country/GNB/pdf_archive/GNB_Archive.pdf"
  },
  {
    country_code: "GW",
    crop_name: "millet",
    price_per_kg: 290.00,
    currency: "XOF",
    market_name: "Bissau",
    date: "2025-02-01",
    source_name: "FAO_GIEWS",
    source_url: "https://www.fao.org/giews/countrybrief/country/GNB/pdf_archive/GNB_Archive.pdf"
  }
];

// ============================================================
// Helper functions for data access
// ============================================================

/**
 * Get all prices for a specific country
 */
function getPricesByCountry(countryCode) {
  return cropPrices.filter(p => p.country_code === countryCode);
}

/**
 * Get all prices for a specific crop across all countries
 */
function getPricesByCrop(cropName) {
  return cropPrices.filter(p => p.crop_name === cropName);
}

/**
 * Get the latest price for a specific country and crop
 */
function getLatestPrice(countryCode, cropName) {
  const filtered = cropPrices
    .filter(p => p.country_code === countryCode && p.crop_name === cropName)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return filtered[0] || null;
}

/**
 * Get all unique countries in the dataset
 */
function getUniqueCountries() {
  return [...new Set(cropPrices.map(p => p.country_code))];
}

/**
 * Get all unique crops in the dataset
 */
function getUniqueCrops() {
  return [...new Set(cropPrices.map(p => p.crop_name))];
}

/**
 * Convert price to USD equivalent (approximate rates for reference)
 * Note: These are approximate rates and should be updated with real-time data
 */
const exchangeRates = {
  MAD: 0.10,   // 1 MAD ≈ 0.10 USD
  XOF: 0.0016, // 1 XOF ≈ 0.0016 USD
  KES: 0.0077, // 1 KES ≈ 0.0077 USD
  NGN: 0.0006, // 1 NGN ≈ 0.0006 USD
  GHS: 0.065,  // 1 GHS ≈ 0.065 USD
  ETB: 0.0075, // 1 ETB ≈ 0.0075 USD
  TZS: 0.00037,// 1 TZS ≈ 0.00037 USD
  UGX: 0.00027,// 1 UGX ≈ 0.00027 USD
  RWF: 0.00073,// 1 RWF ≈ 0.00073 USD
  SSP: 0.00038,// 1 SSP ≈ 0.00038 USD
  ZMW: 0.036,  // 1 ZMW ≈ 0.036 USD
  USD: 1.0
};

function getPriceInUSD(priceEntry) {
  const rate = exchangeRates[priceEntry.currency] || 1;
  return priceEntry.price_per_kg * rate;
}

// Export for use in projects
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    cropPrices,
    exchangeRates,
    getPricesByCountry,
    getPricesByCrop,
    getLatestPrice,
    getUniqueCountries,
    getUniqueCrops,
    getPriceInUSD
  };
}