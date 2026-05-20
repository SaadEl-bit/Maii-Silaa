# Filaha (فلاحة)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24-green.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Status](https://img.shields.io/badge/status-work%20in%20progress-yellow.svg)]()

> **الذكاء الزراعي الأفريقي** — African Agricultural Intelligence Platform

Pan-African ethical agricultural intelligence platform. **Morocco is the first pilot country**; the product targets African farmers broadly, with transparent, explainable AI recommendations.

> **Status:** This project is under active development. Features are being built and tested. Not production-ready yet.

---

## Overview

Filaha is a **dual-sided AI platform** built for African smallholder farmers and produce distributors. It features two intelligent "brains":

| Module | Name | Purpose |
|--------|------|---------|
| Irrigation Intelligence | **MAÏ** (ماء) | Tells the farmer **when** and **how much** to water using weather data and FAO-56 crop science |
| Market Intelligence | **SILA** | Tells the farmer **when to sell**, at **what price**, and connects them directly with buyers |

### Target Users

| Side | User Type | Auth Method |
|------|-----------|-------------|
| B2C | African smallholder farmers | Phone number + OTP |
| B2B | Produce distributors / buyers | Email + password |

---

## Ethical AI Pillars

Every feature is designed around these principles:

1. **Explainability** — Farmers see WHY a recommendation was given (factors, confidence %, data sources)
2. **Transparency** — "Data Sources Used" panel visible on every AI result
3. **Consent** — Explicit data sharing consent per user; no data used for aggregates without permission
4. **Data Ownership** — Farmers own their data; crop models are open-source
5. **Shared Futures** — Cross-border community intelligence (e.g., "Farmers in Tunisia face the same pest")
6. **Audit Trail** — Every AI decision logged for full traceability

---

## Features

### MAÏ — Smart Irrigation
- Weather data via Open-Meteo API (free, no API key)
- ET₀ calculation using FAO-56 Penman-Monteith equation
- Country-specific crop coefficient database (Kc values)
- Growth stage tracking (initial → development → mid-season → late)
- Irrigation recommendations (water amount in mm, timing)
- Water savings calculator vs. traditional scheduling
- Daily morning automated recommendations (cron job)
- Explainability panel on every recommendation

### SILA — Market Intelligence
- Multi-country price aggregation (Morocco, North/East/West Africa, Pan-Africa fallback)
- Price history, trend analysis, and sell timing recommendations
- Currency normalization per country
- Confidence scoring based on data source freshness

### Marketplace
- Farmers create harvest listings (crop, quantity, quality, price, location)
- Distributors browse and filter listings
- Offer/negotiation system (pending → accepted/declined/countered)
- Direct contact sharing upon mutual acceptance

### AI Photo Diagnosis
- Crop photo upload and AI-powered analysis
- Pest, disease, nutrient deficiency, or healthy plant detection
- Severity assessment (low / medium / high / critical)
- Treatment recommendations in Modern Standard Arabic
- 4-tier VLM consensus pipeline for accuracy

### Community Alerts
- Auto-generated alerts from confirmed AI detections
- 15km radius geo-fencing for nearby farmers
- Cross-border similarity matching
- Alert types: pest, disease, weather extreme, price spike
- In-app notifications via Supabase Realtime

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express |
| **Database** | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| **Weather API** | Open-Meteo (free, no key) |
| **Text AI** | OpenRouter cascade — 14 free models with auto-fallback |
| **Vision AI** | 4-tier VLM consensus: Gemini 2.5 Flash + Qwen3-VL → Claude arbitrator |
| **Frontend** | Vanilla HTML/CSS/JS (ES modules, no build tools) |
| **Maps** | Leaflet.js |
| **Charts** | Recharts |
| **i18n** | Custom i18n system (ar / fr / en) |

---

## Language Policy

| Layer | Language |
|-------|----------|
| User-facing UI (buttons, toasts, AI replies) | **Modern Standard Arabic (MSA)** default; **French** secondary; **English** tertiary |
| Code, DB identifiers, comments | **English** |
| AI responses to farmers | Formal MSA (الفصحى) — never dialect |
| UI Direction | **RTL** for Arabic, **LTR** for French/English |

---

## Project Structure

```
filaha/
├── backend/
│   ├── config/          # Supabase client, DB pool, constants, schema
│   ├── data/            # Static reference data (crop coeffs, prices, shelf life)
│   ├── middleware/      # Auth, role check, error handling
│   ├── routes/          # REST API endpoints
│   ├── services/        # Business logic (weather, ET, AI, prices, detection, etc.)
│   ├── utils/           # Pure helper functions
│   ├── jobs/            # Scheduled cron tasks
│   ├── scripts/         # One-time CLI tasks (migrate, seed)
│   ├── tests/           # API smoke tests
│   ├── server.js        # Express entry point
│   └── package.json
├── frontend2/           # Dashboard SPA (Vanilla HTML/CSS/JS)
│   └── index.html
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 24
- npm >= 11
- A [Supabase](https://supabase.com/) project (free tier works)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and fill in your Supabase credentials and API keys
```

### Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/config/schema.sql`
3. Your tables, enums, and indexes will be created

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin access) |
| `DATABASE_URL` | Optional | Direct PostgreSQL connection (for scripts) |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI text generation |
| `OPENROUTER_MODEL` | Optional | Model override (default: free-tier model) |
| `ANTHROPIC_API_KEY` | Optional | For vision AI arbitration (Claude) |
| `TWILIO_ACCOUNT_SID` | Optional | For future SMS notifications |
| `TWILIO_AUTH_TOKEN` | Optional | For future SMS notifications |

### Running the Backend

```bash
cd backend
npm start
# Server starts on http://localhost:3000
```

### Running the Frontend

```bash
# Option A: Using npx serve
npx serve frontend2 -p 5500

# Option B: Using Python
python -m http.server 8080 --directory frontend2

# Option C: VS Code Live Server
# Open frontend2/index.html with Live Server extension
```

Then open `http://localhost:<port>` in your browser.

---

## API Endpoints

### Health
- `GET /api/health` — Server status check

### Authentication
- `POST /api/auth/register/farmer` — Register a farmer (phone + password)
- `POST /api/auth/register/distributor` — Register a distributor (email + password)
- `POST /api/auth/login` — Login (auto-detects phone vs. email)
- `POST /api/auth/otp` — Trigger OTP (forgot password)
- `POST /api/auth/verify-otp` — Verify OTP
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/logout` — Invalidate session

### Irrigation (MAÏ)
- `GET /api/irrigation/recommend` — Get irrigation recommendation
- `GET /api/irrigation/history` — Get irrigation history
- `POST /api/irrigation/log` — Log an irrigation action

### Market (SILA)
- `GET /api/market/price` — Get price for a crop in a country
- `GET /api/market/prices` — Multi-country price comparison
- `GET /api/market/trend` — Price trend analysis with AI recommendation
- `GET /api/market/best-price` — Best price finder across all regions
- `GET /api/market/crops` — List available crops

### Marketplace
- `GET /api/marketplace/listings` — Browse all listings (public)
- `GET /api/marketplace/listings/my` — Get farmer's own listings
- `POST /api/marketplace/listings` — Create a new listing

### Detection
- `POST /api/detection/analyze` — Analyze a crop photo (AI diagnosis)
- `GET /api/detection/history` — Get detection history

### Community
- `GET /api/community/alerts` — Get nearby alerts (15km radius)
- `POST /api/community/verify` — Confirm or dismiss an alert
- `GET /api/community/farmers-nearby` — Find nearby farmers

### Notifications
- `GET /api/notifications` — Get all notifications
- `PUT /api/notifications/:id/read` — Mark a notification as read
- `PUT /api/notifications/read-all` — Mark all as read
- `DELETE /api/notifications/:id` — Delete a notification

---

## Database Schema

The platform uses 12+ tables in Supabase PostgreSQL:

| Table | Purpose |
|-------|---------|
| `users` | Auth + profile + role + language + consent |
| `farms` | Farm details, crops, size, location |
| `countries` | Country metadata, currencies, data sources |
| `regions` | Regional data with climate zones |
| `crop_coefficients` | FAO-56 Kc values per crop and growth stage |
| `irrigation_logs` | MAÏ recommendations and water savings |
| `price_history` | Multi-country crop prices |
| `listings` | Farmer harvest listings for marketplace |
| `offers` | Distributor offers with negotiation statuses |
| `detections` | AI photo diagnosis results |
| `community_alerts` | Geo-fenced alerts (15km radius) |
| `ai_explanations` | Explainability log for every AI decision |
| `data_audit_log` | Ethics/transparency audit trail |
| `notifications` | In-app notifications |

See `backend/config/schema.sql` for the full schema.

---

## AI Response Contract

Every LLM call returns a structured JSON response:

```json
{
  "recommendation": "string (MSA Arabic)",
  "explanation": "string (MSA — why this advice)",
  "confidence": 0.0,
  "factors": [
    { "factor": "temperature", "weight": 0.4, "value": 32 }
  ],
  "action_items": ["step 1", "step 2"],
  "data_sources_used": ["open_meteo", "fao_56"]
}
```

---

## Deployment

- **Backend**: Deploy to [Railway](https://railway.app/) or similar Node.js hosting
- **Frontend**: Deploy to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
- **Database**: Supabase (cloud-hosted PostgreSQL)

---

## License

MIT

---

## Team

Developed by a team of Moroccan students.

---

## Acknowledgments

- **Open-Meteo** — free weather API
- **FAO-56** — crop coefficient standards
- **Supabase** — database and backend infrastructure
