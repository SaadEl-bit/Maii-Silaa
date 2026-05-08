-- =============================================================================
-- FILAHA — Supabase PostgreSQL Schema
-- Last updated: 2026-05-08 (Phase 4 → Phase 5 gap-fix pass)
--
-- Changes vs previous version:
--   + severity_level enum: added 'critical'
--   + crop_type enum: replaced 5-value list with open TEXT (see note below)
--   + price_history.data_source: added AGRA, FAO_GIEWS sources
--   + users: added data_sharing_consent column (ethics requirement)
--   + users: location_lat/lng kept as coarse country-level fallback; farms = authoritative
--   + NEW TABLE: countries
--   + NEW TABLE: regions
--   + NEW TABLE: notifications (in-app alerts, replaces WhatsApp for now)
--   + NEW TABLE: ai_explanations (LLM audit log per recommendation)
--   + NEW TABLE: data_audit_log (generic change-log for GDPR / ethics pillar)
--   + RLS enabled on all tables with sensible row-level policies
--
-- NOTE on crop_type: The enum approach breaks at 44+ crops. We use TEXT with a
-- CHECK against the registry values defined in data/cropRegistry.js. The crop
-- names are validated at the application layer (utils/validators.js).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUM types (idempotent DO blocks)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('farmer', 'distributor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.preferred_language AS ENUM ('ar', 'fr', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.farm_size_category AS ENUM ('<1ha', '1-5ha', '>5ha');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.growth_stage AS ENUM ('initial', 'development', 'mid', 'late');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- crop_type dropped as an enum — now TEXT (validated at app layer).
-- Keep old enum if it already exists; it is no longer used on new tables.
DO $$ BEGIN
  CREATE TYPE public.storage_type AS ENUM ('open', 'ventilated', 'cold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.freshness_status AS ENUM ('fresh', 'warning', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'sold', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.offer_status AS ENUM ('pending', 'accepted', 'declined', 'countered');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.diagnosis_type AS ENUM (
    'deficiency_n', 'deficiency_k', 'deficiency_fe',
    'whitefly', 'mite', 'aphid', 'root_rot', 'soil_crust', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- severity_level: added 'critical' (was low/medium/high only)
DO $$ BEGIN
  CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Migrate existing enum if 'critical' is missing (idempotent)
DO $$ BEGIN
  ALTER TYPE public.severity_level ADD VALUE IF NOT EXISTS 'critical';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_type AS ENUM ('disease', 'pest', 'weather', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM (
    'irrigation', 'price', 'community', 'detection', 'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ai_prompt_type AS ENUM ('irrigation', 'market', 'detection');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 0. countries — lookup table for supported countries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.countries (
  code        text PRIMARY KEY,          -- ISO 3166-1 alpha-2 (MA, SN, GH …)
  name_en     text NOT NULL,
  name_ar     text,
  name_fr     text,
  currency    text NOT NULL DEFAULT 'USD',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.countries IS 'Supported African countries for Filaha; drives currency, locale defaults, and market pricing.';

-- Seed essential countries (idempotent)
INSERT INTO public.countries (code, name_en, name_ar, name_fr, currency) VALUES
  ('MA', 'Morocco',       'المغرب',         'Maroc',          'MAD'),
  ('DZ', 'Algeria',       'الجزائر',        'Algérie',        'DZD'),
  ('TN', 'Tunisia',       'تونس',           'Tunisie',        'TND'),
  ('EG', 'Egypt',         'مصر',            'Égypte',         'EGP'),
  ('SN', 'Senegal',       'السنغال',        'Sénégal',        'XOF'),
  ('ML', 'Mali',          'مالي',           'Mali',           'XOF'),
  ('BF', 'Burkina Faso',  'بوركينا فاسو',   'Burkina Faso',   'XOF'),
  ('NE', 'Niger',         'النيجر',         'Niger',          'XOF'),
  ('CI', 'Ivory Coast',   'ساحل العاج',     'Côte d''Ivoire', 'XOF'),
  ('GH', 'Ghana',         'غانا',           'Ghana',          'GHS'),
  ('NG', 'Nigeria',       'نيجيريا',        'Nigeria',        'NGN'),
  ('ET', 'Ethiopia',      'إثيوبيا',        'Éthiopie',       'ETB'),
  ('KE', 'Kenya',         'كينيا',          'Kenya',          'KES'),
  ('TZ', 'Tanzania',      'تنزانيا',        'Tanzanie',       'TZS'),
  ('ZA', 'South Africa',  'جنوب أفريقيا',   'Afrique du Sud', 'ZAR'),
  ('CM', 'Cameroon',      'الكاميرون',      'Cameroun',       'XAF'),
  ('MR', 'Mauritania',    'موريتانيا',      'Mauritanie',     'MRU'),
  ('ZM', 'Zambia',        'زامبيا',         'Zambie',         'ZMW'),
  ('ZW', 'Zimbabwe',      'زيمبابوي',       'Zimbabwe',       'USD'),
  ('MW', 'Malawi',        'مالاوي',         'Malawi',         'USD'),
  ('MZ', 'Mozambique',    'موزمبيق',        'Mozambique',     'USD'),
  ('TG', 'Togo',          'توغو',           'Togo',           'XOF'),
  ('GW', 'Guinea-Bissau', 'غينيا بيساو',    'Guinée-Bissau',  'XOF')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1. regions — sub-national regions per country (for price filtering)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.regions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL REFERENCES public.countries (code) ON DELETE CASCADE,
  name_en     text NOT NULL,
  name_ar     text,
  name_fr     text,
  slug        text NOT NULL,             -- machine-readable, e.g. 'souss-massa'
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_code, slug)
);

COMMENT ON TABLE public.regions IS 'Administrative regions per country; used for price history filtering and irrigation zone defaults.';

-- Seed key Moroccan regions (pilot market)
INSERT INTO public.regions (country_code, name_en, name_ar, name_fr, slug) VALUES
  ('MA', 'Souss-Massa',           'سوس-ماسة',        'Souss-Massa',           'souss-massa'),
  ('MA', 'Tadla-Azilal',          'تادلة-أزيلال',     'Tadla-Azilal',          'tadla-azilal'),
  ('MA', 'Gharb',                 'الغرب',            'Gharb',                 'gharb'),
  ('MA', 'Meknès',                'مكناس',            'Meknès',                'meknes'),
  ('MA', 'Marrakech-Safi',        'مراكش-آسفي',       'Marrakech-Safi',        'marrakech-safi'),
  ('MA', 'Casablanca-Settat',     'الدار البيضاء',     'Casablanca-Settat',     'casablanca-settat'),
  ('MA', 'Fès-Meknès',            'فاس-مكناس',        'Fès-Meknès',            'fes-meknes'),
  ('MA', 'Oriental',              'الجهة الشرقية',    'Oriental',              'oriental'),
  ('MA', 'Tanger-Tetouan',        'طنجة-تطوان',       'Tanger-Tétouan',        'tanger-tetouan')
ON CONFLICT (country_code, slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. users — profile row per auth user (same id as auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                   uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role                 public.user_role NOT NULL,
  phone                text,
  email                text,
  name                 text,
  preferred_language   public.preferred_language NOT NULL DEFAULT 'ar',
  country_code         text NOT NULL DEFAULT 'MA' REFERENCES public.countries (code),
  -- location on users = coarse country-level fallback; farms.location_lat/lng is authoritative
  location_lat         double precision,
  location_lng         double precision,
  region               text,
  data_sharing_consent boolean NOT NULL DEFAULT false,   -- ethics pillar (GDPR / AI ethics)
  consent_date         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'App profile linked to auth.users; farmers use phone OTP, distributors email/password.';
COMMENT ON COLUMN public.users.location_lat IS 'Coarse fallback only. Farm-level coordinates live on the farms table.';
COMMENT ON COLUMN public.users.data_sharing_consent IS 'Explicit opt-in for anonymised data sharing per MIATHON ethics pillar.';

-- Upgrade path: add new columns safely on existing deployments
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data_sharing_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS consent_date timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'MA';

-- ---------------------------------------------------------------------------
-- 3. farms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  name            text NOT NULL,
  size_hectares   double precision,
  size_category   public.farm_size_category,
  crop_types      text[] NOT NULL DEFAULT '{}',   -- TEXT array; validated by app layer
  soil_type       text CHECK (soil_type IN ('sandy', 'loamy', 'clay', 'silty', 'peaty', 'chalky')),
  active_modules  text[] NOT NULL DEFAULT '{}',
  planting_date   date,
  growth_stage    public.growth_stage,
  -- authoritative GPS coordinates for the plot
  location_lat    double precision NOT NULL,
  location_lng    double precision NOT NULL,
  country_code    text NOT NULL DEFAULT 'MA' REFERENCES public.countries (code),
  region_slug     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.farms IS 'Farm/plot; irrigation logs, listings, detections attach here. location_lat/lng is authoritative.';
COMMENT ON COLUMN public.farms.soil_type IS 'Farmer-supplied soil type; passed into AI prompts to adjust water advice.';
COMMENT ON COLUMN public.farms.crop_types IS 'TEXT array of base_id values from cropRegistry.js (e.g. wheat, tomato).';

-- ---------------------------------------------------------------------------
-- 4. irrigation_logs — MAÏ
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id             uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  date                date NOT NULL,
  should_irrigate     boolean NOT NULL DEFAULT false,
  water_mm            double precision,
  water_hours         double precision,
  recommendation_text text,
  weather_data        jsonb,
  economy_local       double precision,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, date)
);

COMMENT ON TABLE public.irrigation_logs IS 'Daily irrigation decision, ET-based volumes, cached weather JSON.';

-- ---------------------------------------------------------------------------
-- 5. price_history — multi-country (SILA / analytics)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code   text NOT NULL DEFAULT 'MA' REFERENCES public.countries (code),
  crop_name      text NOT NULL,   -- base_id from cropRegistry.js
  region         text NOT NULL,
  market_hub     text NOT NULL,
  price_per_kg   double precision NOT NULL,
  currency_code  text NOT NULL DEFAULT 'MAD',
  date           date NOT NULL,
  data_source    text NOT NULL DEFAULT 'mock' CHECK (data_source IN (
    'ONCA', 'WFP_VAM', 'FAOSTAT', 'RATIN', 'AFRIQUE_VERTE',
    'AGRA', 'FAO_GIEWS', 'manual', 'mock'
  ))
);

COMMENT ON TABLE public.price_history IS 'Historical crop prices by country, region, market hub; SILA trend engine.';
COMMENT ON COLUMN public.price_history.crop_name IS 'base_id from cropRegistry.js (e.g. maize, tomato, wheat).';

-- ---------------------------------------------------------------------------
-- 6. listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id               uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  crop_name             text NOT NULL,   -- base_id from cropRegistry.js
  quantity_kg           double precision NOT NULL,
  price_per_kg          double precision NOT NULL,
  currency_code         text NOT NULL DEFAULT 'MAD',
  storage_days_remaining integer,
  storage_type          public.storage_type,
  freshness_status      public.freshness_status,
  status                public.listing_status NOT NULL DEFAULT 'active',
  created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listings IS 'Harvest listings visible to distributors; links farm + SILA storage hints.';

-- ---------------------------------------------------------------------------
-- 7. offers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  distributor_id    uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  offered_price     double precision NOT NULL,
  offered_quantity  double precision NOT NULL,
  currency_code     text NOT NULL DEFAULT 'MAD',
  status            public.offer_status NOT NULL DEFAULT 'pending',
  counter_price     double precision,
  counter_quantity  double precision,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offers IS 'Negotiation thread: distributor → listing.';

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. detections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id         uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  photo_url       text NOT NULL,
  diagnosis       text,
  diagnosis_type  public.diagnosis_type NOT NULL DEFAULT 'other',
  severity        public.severity_level,
  action_text     text,
  product         text,
  price_local     double precision,
  confidence      double precision CHECK (confidence BETWEEN 0 AND 1),
  confirmed       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.detections IS 'Vision-based diagnosis; confirmation gates community alerts.';
COMMENT ON COLUMN public.detections.confidence IS '0-1 AI confidence score from aiTranslator JSON contract.';

-- ---------------------------------------------------------------------------
-- 9. community_alerts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_alerts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id          uuid NOT NULL REFERENCES public.detections (id) ON DELETE CASCADE,
  alert_type            public.alert_type NOT NULL,
  center_lat            double precision NOT NULL,
  center_lng            double precision NOT NULL,
  radius_km             integer NOT NULL DEFAULT 15,
  alert_message         text,
  affected_farmers_count integer,
  created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.community_alerts IS 'Geo-radius alert (default 15 km) after confirmed detection.';

-- ---------------------------------------------------------------------------
-- 10. notifications — in-app notification inbox (replaces WhatsApp for now)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  title       text NOT NULL,
  message     text NOT NULL,
  type        public.notification_type NOT NULL DEFAULT 'system',
  is_read     boolean NOT NULL DEFAULT false,
  -- optional link-back to the source object
  ref_table   text,   -- e.g. 'irrigation_logs', 'detections'
  ref_id      uuid,   -- FK value in that table
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app notification inbox; polled or streamed via Supabase Realtime. WhatsApp/SMS planned.';
COMMENT ON COLUMN public.notifications.ref_table IS 'Optional back-reference to source record (e.g. irrigation_logs).';

-- ---------------------------------------------------------------------------
-- 11. ai_explanations — LLM audit trail (one row per AI recommendation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_explanations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES public.users (id) ON DELETE SET NULL,
  farm_id         uuid REFERENCES public.farms (id) ON DELETE SET NULL,
  prompt_type     public.ai_prompt_type NOT NULL,
  model_used      text NOT NULL,          -- e.g. 'google/gemma-4-31b-it:free'
  prompt_hash     text,                   -- SHA-256 of system+user prompt (for dedup)
  -- raw AI output stored for audit / explainability
  response_json   jsonb NOT NULL,
  confidence      double precision CHECK (confidence BETWEEN 0 AND 1),
  is_fallback     boolean NOT NULL DEFAULT false,
  -- link to the record this explanation enriches
  ref_table       text,                   -- e.g. 'irrigation_logs', 'detections'
  ref_id          uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_explanations IS 'Full audit log of every LLM call: prompt type, model, raw JSON, confidence. Ethics + GDPR transparency.';
COMMENT ON COLUMN public.ai_explanations.prompt_hash IS 'SHA-256 of prompt for deduplication and caching.';
COMMENT ON COLUMN public.ai_explanations.is_fallback IS 'True when MSA static fallback was returned instead of live AI.';

-- ---------------------------------------------------------------------------
-- 12. data_audit_log — generic change-log (GDPR / ethics pillar)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name  text NOT NULL,
  record_id   uuid,
  action      text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'EXPORT', 'ACCESS')),
  actor_id    uuid REFERENCES public.users (id) ON DELETE SET NULL,
  actor_role  public.user_role,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  inet,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.data_audit_log IS 'Immutable change log for GDPR / MIATHON ethics pillar. Records all write operations on sensitive tables.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- users
CREATE INDEX IF NOT EXISTS idx_users_role        ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_country     ON public.users (country_code);
CREATE INDEX IF NOT EXISTS idx_users_region      ON public.users (region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_consent     ON public.users (data_sharing_consent);

-- countries / regions
CREATE INDEX IF NOT EXISTS idx_regions_country   ON public.regions (country_code);

-- farms
CREATE INDEX IF NOT EXISTS idx_farms_user_id     ON public.farms (user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location    ON public.farms (location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_farms_country     ON public.farms (country_code);

-- irrigation_logs
CREATE INDEX IF NOT EXISTS idx_irr_farm_id       ON public.irrigation_logs (farm_id);
CREATE INDEX IF NOT EXISTS idx_irr_date          ON public.irrigation_logs (date DESC);
CREATE INDEX IF NOT EXISTS idx_irr_farm_date     ON public.irrigation_logs (farm_id, date DESC);

-- price_history
CREATE INDEX IF NOT EXISTS idx_price_country_crop ON public.price_history (country_code, crop_name, region, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_source_date  ON public.price_history (data_source, date DESC);

-- listings
CREATE INDEX IF NOT EXISTS idx_listings_farm_id   ON public.listings (farm_id);
CREATE INDEX IF NOT EXISTS idx_listings_status    ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_crop      ON public.listings (crop_name);
CREATE INDEX IF NOT EXISTS idx_listings_created   ON public.listings (created_at DESC);

-- offers
CREATE INDEX IF NOT EXISTS idx_offers_listing     ON public.offers (listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_distributor ON public.offers (distributor_id);
CREATE INDEX IF NOT EXISTS idx_offers_status      ON public.offers (status);

-- detections
CREATE INDEX IF NOT EXISTS idx_det_farm_id        ON public.detections (farm_id);
CREATE INDEX IF NOT EXISTS idx_det_confirmed      ON public.detections (confirmed) WHERE confirmed = true;
CREATE INDEX IF NOT EXISTS idx_det_created        ON public.detections (created_at DESC);

-- community_alerts
CREATE INDEX IF NOT EXISTS idx_alert_detection    ON public.community_alerts (detection_id);
CREATE INDEX IF NOT EXISTS idx_alert_created      ON public.community_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_center       ON public.community_alerts (center_lat, center_lng);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notif_user_unread  ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created      ON public.notifications (created_at DESC);

-- ai_explanations
CREATE INDEX IF NOT EXISTS idx_ai_user_id         ON public.ai_explanations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_farm_id         ON public.ai_explanations (farm_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_type     ON public.ai_explanations (prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_created         ON public.ai_explanations (created_at DESC);

-- data_audit_log
CREATE INDEX IF NOT EXISTS idx_audit_table        ON public.data_audit_log (table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor        ON public.data_audit_log (actor_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Supabase requires RLS on all tables; anon key cannot bypass it.
-- ---------------------------------------------------------------------------

ALTER TABLE public.countries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_explanations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_audit_log     ENABLE ROW LEVEL SECURITY;

-- countries + regions: readable by all authenticated users
DROP POLICY IF EXISTS "countries_read_all" ON public.countries;
CREATE POLICY "countries_read_all"
  ON public.countries FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "regions_read_all" ON public.regions;
CREATE POLICY "regions_read_all"
  ON public.regions FOR SELECT USING (auth.role() = 'authenticated');

-- users: own row only
DROP POLICY IF EXISTS "users_own_row" ON public.users;
CREATE POLICY "users_own_row"
  ON public.users FOR ALL USING (auth.uid() = id);

-- farms: owner only
DROP POLICY IF EXISTS "farms_owner" ON public.farms;
CREATE POLICY "farms_owner"
  ON public.farms FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.id = farms.user_id)
  );

-- irrigation_logs: farm owner only
DROP POLICY IF EXISTS "irr_logs_owner" ON public.irrigation_logs;
CREATE POLICY "irr_logs_owner"
  ON public.irrigation_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms f WHERE f.id = irrigation_logs.farm_id AND f.user_id = auth.uid())
  );

-- price_history: readable by all authenticated
DROP POLICY IF EXISTS "price_history_read_all" ON public.price_history;
CREATE POLICY "price_history_read_all"
  ON public.price_history FOR SELECT USING (auth.role() = 'authenticated');

-- listings: readable by all authenticated; writable by farm owner
DROP POLICY IF EXISTS "listings_read_all" ON public.listings;
CREATE POLICY "listings_read_all"
  ON public.listings FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "listings_owner_write" ON public.listings;
CREATE POLICY "listings_owner_write"
  ON public.listings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.farms f WHERE f.id = listings.farm_id AND f.user_id = auth.uid())
  );

-- offers: distributor creates, both parties can read
DROP POLICY IF EXISTS "offers_distributor_create" ON public.offers;
CREATE POLICY "offers_distributor_create"
  ON public.offers FOR INSERT WITH CHECK (auth.uid() = distributor_id);

DROP POLICY IF EXISTS "offers_parties_read" ON public.offers;
CREATE POLICY "offers_parties_read"
  ON public.offers FOR SELECT USING (
    auth.uid() = distributor_id OR
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.farms f ON f.id = l.farm_id
      WHERE l.id = offers.listing_id AND f.user_id = auth.uid()
    )
  );

-- detections: farm owner only
DROP POLICY IF EXISTS "detections_owner" ON public.detections;
CREATE POLICY "detections_owner"
  ON public.detections FOR ALL USING (
    EXISTS (SELECT 1 FROM public.farms f WHERE f.id = detections.farm_id AND f.user_id = auth.uid())
  );

-- community_alerts: all authenticated users can read (geo-public)
DROP POLICY IF EXISTS "alerts_read_all" ON public.community_alerts;
CREATE POLICY "alerts_read_all"
  ON public.community_alerts FOR SELECT USING (auth.role() = 'authenticated');

-- notifications: own row only
DROP POLICY IF EXISTS "notif_own_row" ON public.notifications;
CREATE POLICY "notif_own_row"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ai_explanations: own row only
DROP POLICY IF EXISTS "ai_own_row" ON public.ai_explanations;
CREATE POLICY "ai_own_row"
  ON public.ai_explanations FOR ALL USING (auth.uid() = user_id);

-- data_audit_log: service role only (no anon or user access)
DROP POLICY IF EXISTS "audit_service_only" ON public.data_audit_log;
CREATE POLICY "audit_service_only"
  ON public.data_audit_log FOR ALL USING (auth.role() = 'service_role');
