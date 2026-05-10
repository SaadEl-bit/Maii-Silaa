# 🌍 FILAHA — COMPLETE PROJECT MASTER DOCUMENT
# Last Updated: 2026-05-08
# Paste this at the top of every Cursor / AntiGravity / Claude Code session

---

## 1. EVENT & IDENTITY

| Field | Value |
|-------|-------|
| **Hackathon** | MIATHON'03 |
| **Theme** | "Thinking AI from Africa: ethics, power, and shared futures" |
| **Sponsor Alignment** | OCP (Office Chérifien des Phosphates) — agriculture & water |
| **Team** | 4 Moroccan students, Darija native speakers |
| **Your Role** | Backend / AI / Data Lead |
| **Project Name** | Filaha (فلاحة) — African Agricultural Intelligence |
| **Tagline** | "الذكاء الزراعي الأفريقي" / "L'intelligence agricole africaine" |
| **Scope** | Pan-African platform. Morocco = pilot / first lead. |
| **Timeline** | ~10 days prep + 72h hackathon |

---

## 2. CONCEPT: DUAL-SIDED PLATFORM

### MAÏ — Irrigation Intelligence
- When and how much to water
- Weather-based ET calculations (FAO-56 Penman-Monteith)
- Water savings tracking & historical logs

### SILA — Market Intelligence
- When to sell, at what price
- Direct buyer-distributor matching
- Negotiation system (pending → accepted/declined/countered)

---

## 3. TARGET USERS

| Side | User Type | Auth Method | Language |
|------|-----------|-------------|----------|
| B2C | African smallholder farmers | Phone number + OTP | Arabic (MSA) default |
| B2B | Produce distributors / buyers | Email + password | French / English |

---

## 4. CRITICAL LANGUAGE RULE (NON-NEGOTIABLE)

| Context | Language |
|---------|----------|
| **UI text visible to users** (buttons, labels, toasts, errors, AI chat) | **Modern Standard Arabic (MSA / العربية الفصحى)** by DEFAULT. French second. English third. |
| **Code comments, variable names, function names, file names, folder names, SQL columns/tables, internal docs** | **ENGLISH ONLY** |
| **AI responses to farmers** | Formal MSA (الفصحى). **Never Darija. Never dialect.** |
| **i18n translation keys** | English snake_case (e.g., `irrigation.water_amount`) |
| **UI Direction** | **RTL** for Arabic. LTR for French/English. |

---

## 5. THEME ALIGNMENT: ETHICS, POWER, SHARED FUTURES

Every feature must demonstrate these pillars:

1. **Explainability** — Farmer sees WHY the recommendation was given (factors, confidence %, data sources)
2. **Transparency** — "Data Sources Used" panel visible on every AI result
3. **Consent** — `data_sharing_consent` boolean per user. No data used for aggregates without consent.
4. **Data Ownership** — Farmers own their data. Open-source crop models committed post-hackathon.
5. **Shared Futures** — Cross-border community intelligence (e.g., "Farmers in Tunisia face the same pest")
6. **Audit Trail** — Every AI decision logged to `ai_explanations` + `data_audit_log`

---

## 6. COMPLETE FEATURE LIST

### A. AUTHENTICATION & ONBOARDING
- [ ] Farmer registration (phone number + OTP via WhatsApp/SMS)
- [ ] Distributor registration (email + password)
- [ ] Role-based access control (farmer vs. distributor vs. admin)
- [ ] Country selector during onboarding (Morocco active, others pending)
- [ ] Region/locality selection linked to geo-data
- [ ] Preferred language selection (ar / fr / en)
- [ ] Data sharing consent checkbox with plain-Arabic explanation
- [ ] "Ethics Charter" static page explaining data ownership & transparency

### B. MAÏ — IRRIGATION INTELLIGENCE
- [ ] Weather data fetch (Open-Meteo API, free, no key)
- [ ] ET₀ calculation via FAO-56 Penman-Monteith equation
- [ ] Country-specific crop coefficient database (Kc initial / mid / end)
- [ ] Growth stage tracking (initial → development → mid-season → late)
- [ ] Irrigation recommendation engine (water amount in mm, timing)
- [ ] Water savings calculator (compared to traditional scheduling)
- [ ] Morning weather job (cron at 5:30 AM) — auto-generate daily recommendation
- [ ] Historical irrigation logs per farm
- [ ] **Explainability panel** on every recommendation:
  - Weather factors (temp, humidity, wind, solar radiation)
  - Weighted factor breakdown
  - Confidence score (0.0–1.0)
  - Data sources used (Open-Meteo, FAO-56, local crop coefficients)

### C. SILA — MARKET INTELLIGENCE
- [ ] Multi-country price aggregation:
  - Morocco: ONCA (primary), WFP VAM, FAOSTAT
  - North Africa: WFP VAM, FAOSTAT
  - East Africa: RATIN, WFP VAM, Farmgain Africa
  - West Africa: Afrique Verte, WFP VAM, FEWS NET
  - Pan-Africa fallback: FAOSTAT
- [ ] Price history charts by crop / region / market
- [ ] Price trend analysis (rising / falling / stable)
- [ ] Sell timing recommendations ("Sell now" vs. "Wait 2 weeks")
- [ ] Currency normalization per country
- [ ] Confidence score on price data (based on source freshness)
- [ ] **Marketplace (Listings):**
  - Farmer creates harvest listing (crop, quantity, quality, price, location)
  - Distributor browses listings with filters (crop, region, price range)
  - Distributor sends offer (price negotiation)
  - Farmer accepts / declines / counters offer
  - Offer statuses: pending, accepted, declined, countered
  - Direct contact sharing upon mutual acceptance

### D. AI PHOTO DIAGNOSIS
- [ ] Farmer uploads crop photo (Supabase Storage)
- [ ] AI vision analysis (Claude Vision or OpenRouter Vision fallback)
  - Detect pest, disease, nutrient deficiency, or healthy plant
  - Severity assessment (low / medium / high / critical)
  - Treatment recommendations in MSA
- [ ] **Explainability:** What visual signals the AI detected
- [ ] Confidence score per diagnosis
- [ ] Save detection history per farm

### E. COMMUNITY ALERTS (CROSS-BORDER)
- [ ] Auto-generate alert from confirmed AI detection (pest/disease outbreak)
- [ ] 15km radius geo-fencing for nearby farmers
- [ ] Cross-border similarity matching ("Similar outbreak in Tunisia")
- [ ] Alert types: pest, disease, weather extreme, price spike
- [ ] Severity levels: low, medium, high, critical
- [x] **In-app notifications** via Supabase `notifications` table (active ✅)
- [ ] WhatsApp broadcast (AiSensy — commented out, keys in .env, future activation)
- [ ] Community verification (farmers can confirm/dismiss alerts)

### F. NOTIFICATIONS ⚠️ PLAN CHANGE
- [x] **In-App (Active):** `notificationService.sendInApp()` → writes to Supabase `notifications` table
  - Irrigation alerts (`sendIrrigationAlert`)
  - Price alerts (`sendPriceAlert`)
  - Community alerts (`sendCommunityAlert`)
  - OTP log (dev only — production will use SMS)
- [ ] **WhatsApp (Future):** AiSensy Cloud API — keys in `.env`, code commented out
- [ ] **SMS (Future):** Twilio — keys in `.env`, code commented out
- [x] Notification preferences per user (default: in_app for all channels)
- [ ] All notifications logged to `data_audit_log`

### G. MAPS & GEOSPATIAL
- [ ] Leaflet.js interactive map
- [ ] Farm location pinning
- [ ] 15km radius visualization for community alerts
- [ ] Regional market locations
- [ ] Climate zone overlay

### H. ANALYTICS & DASHBOARD
- [ ] Farmer dashboard:
  - Today's irrigation recommendation
  - Water savings total (liters or dirhams saved)
  - Active listings status
  - Recent community alerts
  - Weather mini-widget
- [ ] Distributor dashboard:
  - Available listings by crop/region
  - Price trend charts
  - Active offers / negotiations
  - Favorite farmers/regions

### I. SETTINGS & PROFILE
- [ ] Profile editing (name, phone, farm details)
- [ ] Farm management (multiple plots per user)
- [ ] Language switcher (Arabic | Français | English)
- [ ] Theme toggle (light / dark)
- [ ] Data transparency toggle ("Show data sources on AI results")
- [ ] Consent management (view/withdraw data sharing consent)
- [ ] Download my data (GDPR-style export)

### J. ADMIN / INTERNAL
- [ ] Country activation toggle (Morocco active, others staged)
- [ ] Template message management (WhatsApp templates for AiSensy)
- [ ] Price source health monitoring (is ONCA scraping working? Is WFP VAM up?)
- [ ] Audit log viewer (all AI decisions, consent changes, data exports)

---

## 7. TECHNICAL STACK

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui |
| **State Management** | Zustand |
| **HTTP Client** | TanStack Query (React Query) |
| **Maps** | Leaflet.js |
| **Charts** | Recharts |
| **Backend** | Node.js + Express |
| **Database** | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| **Weather API** | Open-Meteo API (free, no API key) |
| **Text AI (irrigation/market)** | OpenRouter cascade — 14 free models, auto-fallback on 429/404 |
| **Vision AI (photo diagnosis)** | 4-tier VLM consensus: Gemini 2.5 Flash + Qwen3-VL → Claude arbitrator |
| **AI backup** | Claude Sonnet / Haiku (Anthropic direct — arbitrator for vision, future for text) |
| **Notifications** | In-App via Supabase `notifications` table (WhatsApp/SMS: keys kept, not active) |
| **i18n** | i18next (ar / fr / en) — AI returns MSA Arabic; frontend handles FR/EN |
| **Deployment** | Railway (backend) + Vercel (frontend) |

---

## 8. DATABASE SCHEMA (12 TABLES)

| Table | Purpose |
|-------|---------|
| `users` | Auth + profile + role + preferred_language + data_sharing_consent + country_code |
| `farms` | Farm details, crops, size, location, geo, country_code, region_id |
| `countries` | ISO code, names (en/fr/ar), currency, phone code, data_sources[], is_active |
| `regions` | country_code, name, climate_zone, centroid (GEOGRAPHY), bounding_box |
| `crop_coefficients` | country-specific Kc values, growth stages, water requirements |
| `irrigation_logs` | MAÏ recommendations, weather snapshot, water savings |
| `price_history` | crop/region/market prices, data_source, currency, confidence_score |
| `listings` | Farmer harvest listings for marketplace |
| `offers` | Distributor offers with negotiation statuses |
| `detections` | Photo diagnosis results (AI vision) |
| `community_alerts` | 15km radius alerts, severity, affected_area_km2, country_code |
| `ai_explanations` | Explainability log for every AI recommendation (factors, sources, confidence) |
| `data_audit_log` | Ethics/transparency logging (consent changes, AI decisions, data exports) |

---

## 9. AI RESPONSE CONTRACT (STRICT JSON)

Every LLM call must return:
```json
{
  "recommendation": "string (MSA)",
  "explanation": "string (MSA — why this advice)",
  "confidence": 0.0,
  "factors": [
    { "factor": "temperature", "weight": 0.4, "value": 32 }
  ],
  "action_items": ["خطوة 1", "خطوة 2"],
  "data_sources_used": ["open_meteo", "fao_56"]
}
```

---

## 10. PROJECT STATUS LOG
> **AGENTS: You MUST add a new entry here when you finish your session.**
> Format: ### [DATE] — [SHORT TITLE], then bullet list with Phase, What was done, What works now, Next step.
> This is how the next agent knows where you stopped. See .cursorrules for full instructions.

---

### 2026-05-05 — Project Scaffolding & Phase 0 Complete
- **Phase:** 0 (Setup) — COMPLETE
- **What was done:**
  - Created full backend folder structure: config/, data/, utils/, services/, middleware/, routes/, scripts/, jobs/, tests/
  - All files have stub comments describing their purpose
  - Every folder has a detailed whatFor.txt
  - schema.sql written (8 tables, enums, indexes)
  - constants.js coded (default locale, pilot country)
  - .env.example created with all needed keys
  - package.json with scripts for test:claude, test:openrouter, test:llm
  - Installed: @anthropic-ai/sdk, @openrouter/sdk, dotenv
  - testClaude.js and testOpenRouter.js written and passing ✅
  - WALKTHROUGH.md created with full 9-phase build guide
  - .cursorrules expanded with 3-step agent workflow
  - PROJECT_CONTEXT.txt updated with this status log section
- **What works now:**
  - `npm run test:claude` → Claude API responds ✅
  - `npm run test:openrouter` → OpenRouter API responds ✅
  - `node -e "console.log(require('./config/constants'))"` → prints constants ✅
- **Next step:** Phase 1 — Code config/supabase.js and config/database.js (need `npm install @supabase/supabase-js` first), then run schema.sql in Supabase SQL Editor

### 2026-05-07 — Phase 1 Config Layer Complete
- **Phase:** 1 (Config Layer) — COMPLETE
- **What was done:**
  - config/supabase.js — creates and exports the Supabase client (service role key, full backend access)
  - config/database.js — creates and exports a direct PostgreSQL connection pool (for scripts/migrations)
  - Installed `pg` dependency for direct Postgres access
  - Added .cursorrules extra rule: explain code in chat, keep comments simple, provide test instructions
  - JWT_SECRET generated and populated in .env
- **What works now:**
  - `node -e "const s = require('./config/supabase'); console.log(typeof s)"` → object ✅
  - `node -e "const p = require('./config/database'); console.log(typeof p.query); p.end()"` → function ✅
  - Supabase HTTPS connection → status 200 ✅
  - Direct Postgres (database.js) → DNS error on local network (code is correct, network issue)
  - `node -e "console.log(require('./config/constants'))"` → still works ✅Introduce ur self descripe exactly what's ur feature , what are u capable of doing , how far can u go in vibe cooding and project engenering and architecture
- **Next step:** Phase 2 — Code data/ files (cropCoefficients.js, shelfLifeTables.js, priceSeedData.js). Also: run schema.sql in Supabase SQL Editor when network allows.

### 2026-05-08 — Phase 2 Static Data Layer Complete
- **Phase:** 2 (Static Data) — COMPLETE
- **What was done:**
  - data/cropCoefficients.js — FAO-56 crop coefficient database (121 crops, 16 categories, 8 utility functions: findCropByName, searchCrops, getCropsByCategory, getAllCategories, calculateETc, getKcCurve, estimateKcForDay)
  - data/shelfLifeTables.js — FAO grain storage conditions database (42 crops, 11 categories, 5 utility functions: findStorageByName, searchStorage, getStorageByCategory, getAllStorageCategories, estimateStorageLife)
  - data/priceSeedData.js — Multi-country crop prices (92 entries, 19 countries, 18 crop types, 7 utility functions + exchange rates: getPricesByCountry, getPricesByCrop, getLatestPrice, getUniqueCountries, getUniqueCrops, getPriceInUSD)
  - PROJECT_CONTEXT.txt upgraded to complete master document (Sections 1-10, feature list A-J, 12-table schema, AI response contract)
  - .cursorrules expanded to 4 steps with multi-country architecture rules, AI/ethics rules, and communication rules
- **What works now:**
  - `node -e "const f = require('./data/cropCoefficients'); console.log(f.getAllCategories())"` → 16 categories ✅
  - `node -e "const f = require('./data/cropCoefficients'); console.log(f.calculateETc('Tomato','mid',5))"` → 5.75 ✅
  - `node -e "const f = require('./data/shelfLifeTables'); console.log(f.estimateStorageLife('Wheat',30,15))"` → HIGH risk ✅
  - `node -e "const f = require('./data/priceSeedData'); console.log(f.getUniqueCountries())"` → 19 countries ✅
  - All Phase 0 + Phase 1 tests still passing ✅
- **Known issue:** Crop naming inconsistencies between the 3 data files (e.g. corn vs maize, potato vs irish_potato). Will need a cropMapper utility in Phase 3.
- **Next step:** Phase 3 — Code utils/ files (validators.js, formatters.js, geospatial.js, promptBuilder.js, msaFallbackTemplates.js). Also: run schema.sql in Supabase SQL Editor when network allows.

### 2026-05-08 — Phase 3 Utility Helpers Complete
- **Phase:** 3 (Utility Helpers) — COMPLETE
- **What was done:**
  - utils/validators.js — Input validation (coords, crops, stages, roles, locales, country codes, confidence). Validates crop names against FAO-56 database.
  - utils/formatters.js — Formatting for Arabic locale: prices (13 African currencies), dates, temperatures, water amounts, distances, confidence scores.
  - utils/geospatial.js — Haversine distance calculation + isWithinRadius + findWithinRadius for 15km community alert system.
  - utils/promptBuilder.js — LLM prompt templates for MAÏ (irrigation), SILA (market), and Detection (photo diagnosis). Enforces MSA + JSON contract.
  - utils/msaFallbackTemplates.js — Hardcoded MSA Arabic strings for when AI is unavailable (irrigation, market, detection, alerts, errors).
- **What works now:**
  - `node -e "const v = require('./utils/validators'); console.log(v.isValidCrop('tomato'))"` → true ✅
  - `node -e "const f = require('./utils/formatters'); console.log(f.formatPrice(12.5,'MAD'))"` → 12.50 د.م. ✅
  - `node -e "const g = require('./utils/geospatial'); console.log(g.distanceKm(34.0,-6.8,34.1,-6.7))"` → 14.4 km ✅
  - `node -e "const p = require('./utils/promptBuilder'); console.log(typeof p.buildIrrigationPrompt)"` → function ✅
  - `node -e "const t = require('./utils/msaFallbackTemplates'); console.log(Object.keys(t))"` → 5 sections ✅
- All Phase 0 + Phase 1 + Phase 2 tests still passing ✅
  - **Next step:** Phase 4 — Code services/ (weatherService.js, etCalculator.js, aiTranslator.js, priceAnalyzer.js, storageCountdown.js, detectionService.js, communityService.js, notificationService.js). Also: run schema.sql in Supabase SQL Editor when network allows.

### 2026-05-08 — Phase 3.5 Data Reorganization Complete

- **New files created:**
  - `data/cropRegistry.js` — Single source of truth (44 crops, 9 fields each)
  - `scripts/validateCropData.js` — Self-verification script
  - `scripts/exportCsv.js` — CSV export utility
  - `data/csv/crops_registry.csv` — Registry export (44 rows)
  - `data/csv/crops_irrigation.csv` — Morocco irrigation defaults (44 rows)
  - `data/csv/crops_storage.csv` — Storage conditions (42 rows)
  - `data/csv/crops_prices.csv` — Normalized prices (92 rows)
  - `data/README.md` — Data layer documentation

- **What works now:**
  - `node -e "const r = require('./data/cropRegistry'); console.log(r.resolveBaseId('corn'))"` → 'maize' ✅
  - `node -e "const r = require('./data/cropRegistry'); console.log(r.resolveBaseId('irish_potato'))"` → 'potato' ✅
  - `node scripts/validateCropData.js` → Exit code 0 ✅
  - All 4 CSV files export successfully with semicolon delimiter + UTF-8 BOM ✅
  - Extended 30 Morocco crops + ~15 Africa crops unified ✅

- **Key decisions:**
  - Extended 30 over Essential 20 for stronger demo coverage
  - FAO global average fallback for missing data (auditable, not hidden)
  - Static JS registry over DB for simplicity
  - Reverse-lookup Map for O(1) price seeding performance

- **Validation:** `node scripts/validateCropData.js` → 0 orphans ✅

- **Next step:** Continue Phase 4 — Code services/

### 2026-05-08 — Phase 4 Services Layer Complete + Plan Changes
- **Phase:** 4 (Services Layer) — COMPLETE
- **What was done:**
  - services/weatherService.js — Open-Meteo API fetch, response normalizer, WMO weather codes, irrigation weather check.
  - services/etCalculator.js — FAO-56 Penman-Monteith ET₀, growth stage detection, Kc lookup, ETc calculation, 7-day schedule.
  - services/aiTranslator.js — AI interface; **now OpenRouter-only** (Claude key kept in .env but bypassed).
  - services/priceAnalyzer.js — Trend analysis from price_history + seed data fallback.
  - services/storageCountdown.js — Shelf-life estimation using FAO storage conditions + weather adjustment.
  - services/detectionService.js — Photo upload to Supabase Storage + AI diagnosis via aiTranslator.
  - services/communityService.js — 15km radius alert generation using geospatial utility.
  - services/notificationService.js — **WhatsApp/SMS replaced with in-app Supabase notifications**.
- **⚠️ PLAN CHANGES:**
  - **AI Provider:** Claude is DISABLED. OpenRouter is the sole active AI.
  - **Notifications:** WhatsApp/SMS replaced with `sendInApp()` writing to Supabase.
  - **Soil Type:** Farmer selects soil type in frontend onboarding instead of using an API.
  - **i18n:** AI returns Arabic only. UI static text will be handled by frontend.
- **What works now:**
  - weatherService fetches live Open-Meteo data ✅
  - etCalculator produces ETc from real weather ✅
  - aiTranslator calls OpenRouter and returns JSON ✅
  - notificationService writes alerts to Supabase ✅
- **Next step:** Phase 5 — Create `middleware/` and `routes/`. Run schema.sql in Supabase.

### 2026-05-09 — Phase 4 VLM Upgrade + Full Services Audit
- **Phase:** 4.5 (Services Hardening) — COMPLETE
- **What was done:**
  - **VLM Benchmark (testImage.js):** Tested 5 vision models. Results ranked: Gemini 2.5 Flash Lite (3.08s ✅) > Gemini 2.0 Flash Lite (4.10s ✅) > Claude Haiku (5.83s ✅) > Qwen3-VL-8B (14.39s ✅) > Claude Sonnet (19.56s ✅). NVIDIA free VLM rate-limited ❌.
  - **Text Model Benchmark (testModels.js):** Tested 17 free OpenRouter text models. Winners: minimax/minimax-m2.5 (FAO-56 math, Markdown tables, 75% conf) > gpt-oss-120b (6.25s, 92% conf) > gpt-oss-20b (8mm vs 5.8mm).
  - **detectionService.js — Full Rewrite:** 4-tier multi-model VLM consensus pipeline:
    - T1 `google/gemini-2.5-flash-lite` + T2 `qwen/qwen3-vl-8b-instruct` run **in parallel**
    - `shouldTriggerFallback()` checks confidence (<0.75), diagnosis category disagreement, visual signal gaps
    - T3 `claude-sonnet-4-6` (Anthropic direct) as arbitrator when T1+T2 disagree
    - T4 `claude-haiku-4-5-20251001` (Anthropic direct) as emergency
    - Prompt explicitly asks for self-reported confidence to drive fallback logic
    - Results enriched with `pipeline`, `consensus`, `severityLabel` fields
  - **aiTranslator.js — Model Cascade:** Replaced single-model call with a 14-model auto-cascade. Skips on 429/404. `OPENROUTER_MODEL` env var prepended as override.
  - **communityService.js:** `broadcast()` migrated from `notificationService.send(phone, msg, 'whatsapp')` → `notificationService.sendCommunityAlert(userId, { alert, distance, action })`
  - **Bug Fixes (full audit):**
    - `etCalculator.js` — Critical FAO-56 math bug: `es` was set equal to `ea`, zeroing VPD term. Fixed: `es` now calculated from temperature only; `ea = es × (humidity/100)`.
    - `weatherService.js` — `fetchForecast()` was broken: accessed `data.forecast.daily.dates` which doesn't exist in normalized format. Fixed: dedicated raw API call with `daily` endpoint, maps `daily.time` array directly.
    - `priceAnalyzer.js` — Arabic string had `'لا توجد بياناتprices'` (English leaked). Fixed to clean Arabic.
    - `storageCountdown.js` — Arabic string had `'مخاطر متوسطة -_monitor'` (dev artifact). Fixed to `راقب الحالة بانتظام`.
    - `aiTranslator.js` — Removed orphaned `VISION_MODEL` constant; fixed `callClaude` which used `response_format` (OpenAI-style, invalid in Anthropic SDK). JSON now enforced via system prompt.
- **⚠️ PLAN CHANGES:**
  - **Photo Diagnosis:** `detectionService.js` is now a **self-contained VLM pipeline** (does NOT go through `aiTranslator.js`). The two stacks are now decoupled.
  - **Vision Primary:** `google/gemini-2.5-flash-lite` (cheapest, fastest, $0.10/1M) replaces Claude as T1 for vision. Claude is now T3 arbitrator only.
  - **Community Broadcast:** Migrated from WhatsApp to in-app `sendCommunityAlert()`. Uses `farmer.user_id` not `farmer.phone`.
- **What works now:**
  - Full 4-tier VLM pipeline in detectionService ✅
  - 14-model text cascade in aiTranslator with auto-retry ✅
  - FAO-56 ET₀ calculation now produces correct non-zero VPD term ✅
  - fetchForecast returns correct day-by-day arrays ✅
  - All Arabic UI strings are clean (no English leakage) ✅
  - communityService.broadcast() writes to Supabase notifications table ✅
- **Next step:** Phase 5 — Create `middleware/` (auth, role, i18n, rate-limit, error) and `routes/` (irrigation, market, detection, community, notifications). Run `schema.sql` in Supabase SQL Editor.

### 2026-05-09 — Phase 5 Middleware + Routes Complete
- **Phase:** 5 (Middleware + Routes) — COMPLETE
- **What was done:**
  - `middleware/auth.js` — JWT token verification from Supabase Auth
  - `middleware/roleCheck.js` — Role-based access (farmer/distributor/admin)
  - `middleware/errorHandler.js` — Global error handler with audit logging
  - `routes/irrigation.js` — GET /recommend, GET /history, POST /log
  - `routes/market.js` — GET /price, /prices, /trend, /best-price, /crops
  - `routes/detection.js` — POST /analyze, GET /history
  - `routes/community.js` — GET /alerts, POST /verify, GET /farmers-nearby
  - `routes/notifications.js` — GET /, PUT /:id/read, PUT /read-all, DELETE /:id
  - `routes/auth.js` — POST /register, /login, /otp, /verify-otp, GET /me, /logout
  - `server.js` — Express entry point with all routes mounted
- **Test Results:**
  - Health endpoint: `{"status":"ok","timestamp":"2026-05-09..."}` ✅
  - Total routes: 23 endpoints across 6 route files
  - Middleware: 3 files (auth, roleCheck, errorHandler)
- **What works now:**
  - `node server.js` → starts on port 3000 ✅
  - `GET /api/health` → returns status: ok ✅
  - All routes respond with JSON ✅
- **Next step:** Phase 6 — Frontend (React + Vite + shadcn/ui)

### 2026-05-09 — Auth System Redesign (Split Registration)
- **Phase:** 5.5 (Auth Hardening) — COMPLETE
- **What was done:**
  - **`routes/auth.js` — Full Rewrite:**
    - Replaced single `/register` with split endpoints:
      - `POST /auth/register/farmer` → Phone + Password via Supabase Auth
      - `POST /auth/register/distributor` → Email + Password via Supabase Auth
    - `POST /auth/login` → Unified login: detects phone vs. email automatically, returns Supabase `access_token` + user profile
    - `POST /auth/otp` → Triggers Supabase SMS OTP (farmer forgot password)
    - `POST /auth/verify-otp` → Verifies OTP; with `new_password` → password reset; without → phone confirmation
    - `POST /auth/reset-password` → Sends Supabase password reset email (distributor)
    - `GET /auth/me` → Returns user + full `public.users` profile
    - `POST /auth/logout` → Invalidates Supabase session
    - Added input validation guards to every route
  - **`middleware/auth.js` — Critical Rewrite:**
    - Old: used `jwt.verify(token, JWT_SECRET, { issuer: 'filaha' })` — incompatible with Supabase tokens
    - New: uses `supabase.auth.getUser(token)` to verify tokens via Supabase's own secret
    - `req.user` now contains `{ id, sub, email, phone, role, name, country_code, user_metadata }`
    - Both `authenticate` (blocking) and `optionalAuth` (non-blocking) are async
    - Removed `generateToken()` helper — tokens come from Supabase, not generated locally
  - `middleware/roleCheck.js` — No changes needed; `user.role || user.user_metadata?.role` already handles the new token shape
- **⚠️ PLAN CHANGES:**
  - Auth is now split by role: farmers use Phone + Password, distributors use Email + Password
  - OTP is now a real Supabase SMS OTP (not the mock dev OTP from before)
  - For hackathon/dev testing: disable phone confirmation in Supabase Dashboard → Authentication → Settings → "Enable phone confirmations" OFF
  - `FRONTEND_URL` env var required for email redirect links
- **What works now:**
  - Farmer registration and login via phone ✅ (when Supabase phone auth is configured)
  - Distributor registration and login via email ✅
  - Token verification in middleware is now compatible with Supabase JWTs ✅
  - roleCheck.js correctly reads role from req.user for all protected routes ✅
- **Next step:** Phase 6 — Frontend (React + Vite + shadcn/ui) + Supabase DB trigger for `public.users` auto-creation

### 2026-05-10 — API Debugging & AI Translator Cascade Fix
- **Phase:** 5.6 (API Hardening) — COMPLETE
- **What was done:**
  - Diagnosed OpenRouter API free-tier outages (`429 Rate Limit`, `500 Internal Server Error`, `400 Bad Request`).
  - Modified `services/aiTranslator.js` to handle `error.status >= 400` gracefully. The cascade now aggressively skips models that crash instead of aborting the process.
  - Confirmed the emergency fallback response (`يرجى المحاولة لاحقاً.`) kicks in correctly to protect the application from third-party AI outages.
- **What works now:**
  - `GET /api/market/price` responds instantly with pure math/logic (does not crash) ✅
  - `GET /api/irrigation/recommend` correctly returns safe fallback JSON when OpenRouter crashes ✅
  - `node tests/testOpenRouter.js` successfully connects and parses OpenRouter replies ✅
- **Next step:** Phase 6 — Frontend (React + Vite + shadcn/ui) + Supabase DB trigger for `public.users` auto-creation