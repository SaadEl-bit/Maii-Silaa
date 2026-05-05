-- Filaha / Supabase PostgreSQL schema: core tables, enums, FKs, indexes.
-- Identifiers and COMMENT text are English. User-facing copy is produced by the app/i18n (default locale: MSA via `preferred_language`).

-- ---------------------------------------------------------------------------
-- ENUM types (idempotent DO blocks; PostgreSQL has no CREATE TYPE IF NOT EXISTS)
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

DO $$ BEGIN
  CREATE TYPE public.crop_type AS ENUM ('tomato', 'pepper', 'wheat', 'olive', 'citrus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

DO $$ BEGIN
  CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_type AS ENUM ('disease', 'pest', 'weather', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Helper: sync offers.updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. users — profile row per auth user (same id as auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  phone text,
  email text,
  name text,
  preferred_language public.preferred_language NOT NULL DEFAULT 'ar',
  country_code text NOT NULL DEFAULT 'MA',
  location_lat double precision,
  location_lng double precision,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'App profile linked to auth.users; farmers often use phone OTP, distributors email/password.';
COMMENT ON COLUMN public.users.role IS 'farmer vs distributor; gates MAÏ/SILA vs marketplace.';
COMMENT ON COLUMN public.users.phone IS 'Farmer channel identifier (E.164 recommended).';
COMMENT ON COLUMN public.users.email IS 'Distributor channel identifier.';
COMMENT ON COLUMN public.users.preferred_language IS 'UI locale: ar (MSA default), fr secondary, en tertiary.';
COMMENT ON COLUMN public.users.country_code IS 'ISO 3166-1 alpha-2; Morocco MA is first pilot.';
COMMENT ON COLUMN public.users.region IS 'Administrative / regional label for coarse filtering (Africa-wide).';

-- ---------------------------------------------------------------------------
-- 2. farms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  size_hectares double precision,
  size_category public.farm_size_category,
  crop_types text[] NOT NULL DEFAULT '{}',
  active_modules text[] NOT NULL DEFAULT '{}',
  planting_date date,
  growth_stage public.growth_stage,
  location_lat double precision,
  location_lng double precision
);

COMMENT ON TABLE public.farms IS 'Farm or plot; irrigation logs, listings, detections attach here.';
COMMENT ON COLUMN public.farms.crop_types IS 'Crop labels; align with app constants.';
COMMENT ON COLUMN public.farms.active_modules IS 'Enabled modules per plot (e.g. mai, sila).';

-- ---------------------------------------------------------------------------
-- 3. irrigation_logs — MAÏ
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  date date NOT NULL,
  should_irrigate boolean NOT NULL DEFAULT false,
  water_mm double precision,
  water_hours double precision,
  recommendation_text text,
  weather_data jsonb,
  economy_local double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, date)
);

COMMENT ON TABLE public.irrigation_logs IS 'Daily irrigation decision, ET-based volumes, cached weather JSON.';
COMMENT ON COLUMN public.irrigation_logs.recommendation_text IS 'User-facing recommendation text (default locale MSA from product/i18n).';
COMMENT ON COLUMN public.irrigation_logs.economy_local IS 'Estimated water cost savings in local currency for dashboards / SMS.';

-- ---------------------------------------------------------------------------
-- 4. price_history — multi-country reference prices (SILA / analytics)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL DEFAULT 'MA',
  crop_type public.crop_type NOT NULL,
  region text NOT NULL,
  market_hub text NOT NULL,
  price_per_kg double precision NOT NULL,
  currency_code text NOT NULL DEFAULT 'MAD',
  date date NOT NULL,
  data_source text NOT NULL DEFAULT 'mock' CHECK (data_source IN (
    'ONCA', 'WFP_VAM', 'FAOSTAT', 'RATIN', 'AFRIQUE_VERTE', 'manual', 'mock'
  ))
);

COMMENT ON TABLE public.price_history IS 'Historical crop prices by country, region, and market hub; SILA trends.';
COMMENT ON COLUMN public.price_history.market_hub IS 'City or trade hub name (string; supports pan-African markets).';
COMMENT ON COLUMN public.price_history.data_source IS 'Ingestion source (Morocco ONCA, WFP VAM, FAOSTAT, RATIN, Afrique Verte, etc.).';

-- ---------------------------------------------------------------------------
-- 5. listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  crop_type public.crop_type NOT NULL,
  quantity_kg double precision NOT NULL,
  price_per_kg double precision NOT NULL,
  currency_code text NOT NULL DEFAULT 'MAD',
  storage_days_remaining integer,
  storage_type public.storage_type,
  freshness_status public.freshness_status,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listings IS 'Harvest listings for distributors; links farm and SILA storage hints.';
COMMENT ON COLUMN public.listings.currency_code IS 'ISO 4217 for listed price.';

-- ---------------------------------------------------------------------------
-- 6. offers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  offered_price double precision NOT NULL,
  offered_quantity double precision NOT NULL,
  currency_code text NOT NULL DEFAULT 'MAD',
  status public.offer_status NOT NULL DEFAULT 'pending',
  counter_price double precision,
  counter_quantity double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offers IS 'Negotiation thread from distributor to listing.';
COMMENT ON COLUMN public.offers.currency_code IS 'ISO 4217 for offered and counter prices.';

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. detections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  diagnosis text,
  diagnosis_type public.diagnosis_type NOT NULL DEFAULT 'other',
  severity public.severity_level,
  action_text text,
  product text,
  price_local double precision,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.detections IS 'Vision or rules-based diagnosis; confirmation gates community alerts.';
COMMENT ON COLUMN public.detections.action_text IS 'Recommended action text for the farmer (default MSA in UI).';
COMMENT ON COLUMN public.detections.price_local IS 'Indicative product price in local currency.';

-- ---------------------------------------------------------------------------
-- 8. community_alerts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid NOT NULL REFERENCES public.detections (id) ON DELETE CASCADE,
  alert_type public.alert_type NOT NULL,
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  radius_km integer NOT NULL DEFAULT 15,
  alert_message text,
  affected_farmers_count integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.community_alerts IS 'Radius alert (default 15 km) after confirmed detection.';
COMMENT ON COLUMN public.community_alerts.alert_message IS 'Broadcast message text (default MSA in UI).';

-- ---------------------------------------------------------------------------
-- Upgrade path (existing projects): CREATE TABLE IF NOT EXISTS does not add new columns.
-- Run these before indexes so columns referenced below exist on older deployments.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'MA';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms (user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location ON public.farms (location_lat, location_lng);

CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm_id ON public.irrigation_logs (farm_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_date ON public.irrigation_logs (date DESC);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm_date ON public.irrigation_logs (farm_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_country_crop ON public.price_history (country_code, crop_type, region, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_source_date ON public.price_history (data_source, date DESC);

CREATE INDEX IF NOT EXISTS idx_listings_farm_id ON public.listings (farm_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON public.listings (crop_type);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON public.offers (listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_distributor_id ON public.offers (distributor_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers (status);

CREATE INDEX IF NOT EXISTS idx_detections_farm_id ON public.detections (farm_id);
CREATE INDEX IF NOT EXISTS idx_detections_confirmed ON public.detections (confirmed) WHERE confirmed = true;
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON public.detections (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_alerts_detection_id ON public.community_alerts (detection_id);
CREATE INDEX IF NOT EXISTS idx_community_alerts_created_at ON public.community_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_alerts_center ON public.community_alerts (center_lat, center_lng);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users (country_code);
CREATE INDEX IF NOT EXISTS idx_users_region ON public.users (region) WHERE region IS NOT NULL;
