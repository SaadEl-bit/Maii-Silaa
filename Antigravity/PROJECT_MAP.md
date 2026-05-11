# FILAHA — PROJECT MAP

> Last updated: 2026-05-08 (Phase 4 complete)
> Maintained by: Tech Lead — update on every phase completion

---

## TECH_STACK

| Layer | Technology | Version (Current) | Latest Stable |
|-------|-----------|-------------------|---------------|
| **Runtime** | Node.js | v24.12.0 | — |
| **Package Manager** | npm | 11.6.2 | — |
| **Backend Framework** | Express | (not yet installed) | 4.x |
| **Database** | Supabase (PostgreSQL) | — | — |
| **AI Primary** | OpenRouter (Gemma 4 31B free) | @openrouter/sdk ^0.12.28 | 0.12.35 |
| **AI Fallback** | Anthropic Claude (INACTIVE — key kept, not called) | @anthropic-ai/sdk ^0.52.0 | 0.95.1 ⚠️ |
| **DB Client** | Supabase JS | @supabase/supabase-js ^2.105.3 | latest |
| **DB Pool** | pg | ^8.20.0 | 8.20.0 |
| **Dotenv** | — | ^16.4.7 (installed 16.6.1) | **17.4.2** ⚠️ |
| **Frontend** | React + Vite + Tailwind + shadcn/ui | — | not installed |
| **State** | Zustand | — | not installed |
| **HTTP Client** | TanStack Query | — | not installed |
| **Maps** | Leaflet.js | — | not installed |
| **Charts** | Recharts | — | not installed |
| **i18n** | i18next | — | not installed |

### Dependency Health

| Dependency | Status | Action |
|-----------|--------|--------|
| `@anthropic-ai/sdk@0.52.0` | ⚠️ outdated (latest 0.95.1) | Update to 0.95.1 |
| `@openrouter/sdk@0.12.28` | ⚠️ outdated (latest 0.12.35) | Update to 0.12.35 |
| `@supabase/ssr@0.10.2` | ⚠️ outdated (latest 0.10.3) | Update to 0.10.3 |
| `dotenv@16.6.1` | ⚠️ outdated (latest 17.4.2) | Skip — contains breaking Node 22+ changes. Stay on 16.x for Node 24 compat. |
| `adk@0.0.7` (root package.json) | ❌ orphan dep | Remove — `adk` is unrelated (`@arcadible/cli` package) |
| Root `package.json` | ❌ duplicate `@anthropic-ai/sdk@^0.93.0` | Remove — backend already has its own |
| `CLAUDE_MODEL=claude-opus-4-7` in .env | ✅ moot | Claude is disabled — OpenRouter is sole provider. Kept for future re-enable. |
| NPM script `test:claude` | ❌ path mismatch | Points to `testClaudeApi.js` but file is `testClaude.js` — fix script path |

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FILAHA SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌──────────────────────────────────────────┐  │
│  │  Frontend    │     │            Backend (Node + Express)       │  │
│  │  (React +    │────▶│                                          │  │
│  │   Vite)      │     │  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
│  │             │     │  │ server.js │─▶│middleware│─▶│ routes │ │  │
│  │  RTL Arabic  │     │  └──────────┘  └──────────┘  └───┬────┘ │  │
│  │  LTR Fr/En   │     │                                  │      │  │
│  └─────────────┘     │  ┌─────────────────────────────────▼────┐ │  │
│                      │  │            services/                 │ │  │
│  ┌─────────────┐     │  │  ┌────────┐ ┌──────────┐ ┌────────┐ │ │  │
│  │  External   │     │  │  │weather │ │etCalcula-│ │aiTrans-│ │ │  │
│  │  APIs       │◀───▶│  │  │Service │ │tor       │ │lator   │ │ │  │
│  │             │     │  │  └────────┘ └──────────┘ └────────┘ │ │  │
│  │  Open-Meteo │     │  │  ┌────────┐ ┌──────────┐ ┌────────┐ │ │  │
│  │  Claude     │     │  │  │priceAn-│ │storage   │ │detect- │ │ │  │
│  │  OpenRouter │     │  │  │alyzer  │ │Countdown │ │ionServ │ │ │  │
│  │  Twilio     │     │  │  └────────┘ └──────────┘ └────────┘ │ │  │
│  └─────────────┘     │  │  ┌────────┐ ┌──────────┐            │ │  │
│                      │  │  │communi-│ │notificat│            │ │  │
│                      │  │  │tyServ  │ │ionServ  │            │ │  │
│  ┌─────────────┐     │  │  └────────┘ └──────────┘            │ │  │
│  │  Supabase   │◀───▶│  └─────────────────────────────────────┘ │  │
│  │  (Postgres) │     │                                          │  │
│  │  + Auth     │     │  ┌─────────────────────────────────────┐ │  │
│  │  + Storage  │     │  │  utils/    │  data/    │  config/  │ │  │
│  │  + Realtime │     │  │  (pure fn) │ (static)  │ (clients) │ │  │
│  └─────────────┘     │  └─────────────────────────────────────┘ │  │
│                      └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Architecture (Bottom-Up Dependency)

```
L0: config/   ─── Supabase client, DB pool, constants, schema.sql
L1: data/     ─── Static JS objects (crop coeffs, shelf life, prices)
L2: utils/    ─── Pure helpers (validators, formatters, geospatial, prompts)
L3: services/ ─── Business logic (weather, ET calc, AI, prices, detection, etc.)
L4: scripts/  ─── One-time CLI tasks (migrate, seed)
L5: middleware ─── Express pipeline (auth, role, i18n, rate limit, error)
L6: routes/   ─── HTTP endpoints (auth, weather, irrigation, sila, etc.)
L7: server.js ─── Entry point mounts middleware + routes + jobs
L8: jobs/     ─── Cron tasks (morning weather, price update)
```

**Principle**: Each layer only imports from layers below it. No circular deps.

---

## SYSTEM_FLOW

### User Journey 1: Farmer (B2C) — Irrigation

```
Register (phone OTP) → Onboard (country, language, consent)
  → Add Farm (crop, size, location, planting date)
    → GET /irrigation/recommend {farmId}
      → weatherService.fetch(lat, lng)
        → Open-Meteo API → {temp, humidity, wind, rain, solar}
      → etCalculator.calculate(weather, crop, stage)
        → cropCoefficients.getKc(crop, stage)
        → FAO-56 ET₀ → ETc
        → {shouldIrrigate, waterMm, waterHours}
      → promptBuilder.buildIrrigationPrompt(...)
      → aiTranslator.translate(prompt)
        → Claude API → JSON contract
      → INSERT irrigation_logs + ai_explanations
      → Return {recommendation, confidence, factors}
```

### User Journey 2: Farmer — Photo Diagnosis

```
POST /detection/analyze {farmId, photo}
  → detectionService.analyze(photo, farm)
    → Upload to Supabase Storage
    → Claude Vision (or OpenRouter fallback)
    → Parse JSON: {diagnosis, severity, action, product}
    → INSERT detections + ai_explanations
    → If confirmed & severity >= medium:
      → communityService.broadcast(detection)
        → geospatial.findWithinRadius(center, 15km)
        → INSERT community_alerts
        → notificationService.send(farmers, alert)
  → Return {diagnosis, severity, actionItems, confidence}
```

### User Journey 3: Farmer — Market (SILA)

```
POST /sila/sell-window {farmId, cropType, harvestDate, storageType}
  → priceAnalyzer.trend(crop, region)
    → price_history DB query → trend analysis
  → storageCountdown.estimate(crop, weather, storageType)
    → shelfLifeTables.estimateStorageLife(...)
  → promptBuilder.buildMarketPrompt(...)
  → aiTranslator.translate(prompt) → Claude API
  → Return {recommendation, sellWindow, confidence}
```

### User Journey 4: Distributor (B2B)

```
Register (email + password) → Onboard
  → GET /listings?crop=...&region=...&priceMin=...&priceMax=...
    → Supabase query listing + farm join
  → POST /offers {listingId, offeredPrice, quantity}
    → INSERT offers (status: pending)
  → Farmer responds: accept / decline / counter
    → UPDATE offers (status: accepted|declined|countered)
```

### Data Flow: MAÏ (Irrigation Intelligence)

```
lat/lng ──→ Open-Meteo ──→ weatherService ──→ etCalculator ──→ promptBuilder ──→ Claude AI
  (farm coords)   (free API)    (normalized)    (ET₀ + Kc → ETc)    (Arabic prompt)    (JSON contract)
                                                        ↑
                                              data/cropCoefficients.js
```

### Data Flow: SILA (Market Intelligence)

```
crop + region ──→ priceAnalyzer ──→ promptBuilder ──→ Claude AI
                     ↑                    ↑
              price_history DB    shelfLifeTables.js
              priceSeedData.js    storageCountdown.js
```

---

## VERIFIABLE GOALS (Milestones)

### Milestone M1: MAÏ — Irrigation Engine (Phase 4a)
- [ ] `weatherService.js` — fetches Open-Meteo, normalizes response, handles errors
- [ ] `etCalculator.js` — ET₀ via FAO-56 Penman-Monteith, ETc via Kc from cropCoefficients
- [ ] `aiTranslator.js` — sends prompts to Claude, validates JSON contract, falls back to OpenRouter
- **Verification**: `node -e "const ws = require('./services/weatherService'); ws.fetchWeather(34,-6).then(console.log)"` returns `{temp, humidity, wind, rain, solar}`
- **Verification**: `node -e "const et = require('./services/etCalculator'); et.calculate({temp:32,humidity:45},{kc:1.2}).then(console.log)"` returns `{shouldIrrigate, waterMm}`

### Milestone M2: SILA — Market Engine (Phase 4b)
- [ ] `priceAnalyzer.js` — trend analysis from price_history + seed data
- [ ] `storageCountdown.js` — shelf-life estimate from weather + storage type
- **Verification**: `node -e "const p = require('./services/priceAnalyzer'); p.analyzeTrend('tomato','MA').then(console.log)"` returns `{trend, recommendation}`
- **Verification**: `node -e "const s = require('./services/storageCountdown'); s.estimate('wheat',{temp:30,humidity:15},'ventilated')"` returns `{remainingDays, status}`

### Milestone M3: Detection + Community (Phase 4c) — COMPLETE
- [x] `detectionService.js` — vision analysis, severity assessment, treatment recs
- [x] `communityService.js` — 15km radius geo-alert generation
- [x] `notificationService.js` — **In-app Supabase notifications** (WhatsApp/SMS commented out for future)
  - `sendInApp(userId, title, message, type)` → writes to `notifications` table
  - `getUnread(userId)` → returns unread rows (frontend polls or uses Supabase Realtime)
  - WhatsApp/Twilio code preserved in comments — activate once API configured
- **Verification**: Detection returns AI JSON contract with explainability factors
- **Verification**: Community alert finds farmers within 15km radius

### Milestone M4: Backend Scaffold (Phases 5-8)
- [ ] `scripts/` — migrate, seed accounts, seed prices
- [ ] `middleware/` — auth, role check, i18n, rate limit, error handler
- [ ] `routes/` — all 8 route files with endpoints
- [ ] `server.js` — full Express app with middleware + routes + jobs
- **Verification**: `npm start` → server listening on :3000
- **Verification**: `curl /api/health` returns `{status: 'ok'}`

### Milestone M5: Background Jobs (Phase 9)
- [ ] `morningWeatherJob.js` — daily cron at 5:30 AM
- [ ] `priceUpdateJob.js` — every 6 hours
- **Verification**: Job runs without crashing, logs result

### Milestone M6: Frontend MVP
- [ ] React + Vite scaffold with Tailwind + shadcn/ui
- [ ] RTL Arabic layout
- [ ] Farmer dashboard with irrigation widget
- [ ] Distributor dashboard with listings browser
- **Verification**: `npm run dev` → opens in browser, RTL layout renders

---

## ORPHANS & PENDING

### Deprecations / Dead Code
| Item | Location | Issue | Action |
|------|----------|-------|--------|
| `adk` package | Root `package.json` | Unrelated package (`@arcadible/cli`) | Remove |
| `@anthropic-ai/sdk@^0.93.0` | Root `package.json` | Duplicate of backend's dep | Remove |
| `test:claude` script | Backend `package.json` | Path `testClaudeApi.js` doesn't exist | Fix to `testClaude.js` |

### Gaps vs Master Document
| Gap | Details | Priority |
|-----|---------|----------|
| Missing 4 DB tables | `countries`, `regions`, `ai_explanations`, `data_audit_log` not in schema.sql | HIGH |
| `data_sharing_consent` column | Required on `users` table per ethics pillar | HIGH |
| `crop_type` enum too limited | Only 5 values — needs expansion to match data files (121 crops) | HIGH |
| `severity_level` missing `critical` | Master doc specifies 4 levels (low/medium/high/critical), schema has 3 | MEDIUM |
| `users.location_lat/lng` | Should be on `farms` table not `users` — or both | MEDIUM |
| No `cropMapper` utility | Data files have naming inconsistencies (corn vs maize) | MEDIUM — solved by cropRegistry.js ✅ |
| Claude model is Opus | `.env` uses `claude-opus-4-7` — Claude is INACTIVE (OpenRouter is default) | RESOLVED ✅ |
| Frontend empty | No React/Vite scaffold | HIGH |
| `notifications` DB table | Required for in-app notifications — not yet in schema.sql | HIGH — add before Phase 5 |

### Phase 4 Implementation Order
```
1. weatherService.js    (no deps — only Open-Meteo)
2. etCalculator.js      (depends on weatherService + cropCoefficients)
3. aiTranslator.js      (depends on Claude/OpenRouter)
4. priceAnalyzer.js     (depends on priceSeedData)
5. storageCountdown.js  (depends on shelfLifeTables)
6. detectionService.js  (depends on Claude Vision)
7. communityService.js  (depends on geospatial)
8. notificationService.js (depends on Twilio)
```

---

## LOGGING STRATEGY

### Design: Async, Non-blocking, 4 Levels

```js
// utils/logger.js — to be created
// Levels: error, warn, info, debug
// Output: stdout + optional file rotation
// Pattern: logger.info('weatherService', 'fetch ok', { lat, lng, temp })
```

| Level | When to Use |
|-------|-------------|
| `error` | API failures, uncaught errors, DB connection failures |
| `warn` | Fallback triggered, degraded response, rate limiting |
| `info` | Route called, service completed, job run |
| `debug` | LLM prompt/response dumps, detailed flow traces |

All errors are caught by `middleware/errorHandler.js` and logged before returning JSON.
