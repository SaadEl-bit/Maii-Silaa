-- Complete PostgreSQL schema for Supabase (Filaha): 8 core tables, enums, FKs, indexes.
-- Run in Supabase SQL Editor or pipe into psql. `public.users.id` references `auth.users(id)` (profile pattern).

-- ---------------------------------------------------------------------------
-- ENUM types (idempotent via DO blocks; PostgreSQL has no CREATE TYPE IF NOT EXISTS)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('farmer', 'distributor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.preferred_language AS ENUM ('darija', 'fr', 'ar');
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
  CREATE TYPE public.market_name AS ENUM ('casablanca', 'agadir', 'meknes', 'fes');
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
-- Helper: keep offers.updated_at in sync
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
-- 1. users — extends Supabase Auth; one row per auth user (create via trigger or app after signup)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  phone text,
  email text,
  name text,
  preferred_language public.preferred_language NOT NULL DEFAULT 'darija',
  location_lat double precision,
  location_lng double precision,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Application profile linked to auth.users; farmers use phone OTP, distributors email/password.';
COMMENT ON COLUMN public.users.role IS 'farmer | distributor — drives MAÏ/SILA vs marketplace flows.';
COMMENT ON COLUMN public.users.phone IS 'Primary identifier channel for farmers (E.164 recommended).';
COMMENT ON COLUMN public.users.email IS 'Primary identifier for distributors.';
COMMENT ON COLUMN public.users.preferred_language IS 'UI and notification language; Darija default.';
COMMENT ON COLUMN public.users.region IS 'One of 12 Moroccan regions (text fallback for coarse filtering).';

-- ---------------------------------------------------------------------------
-- 2. farms — plots linked to a farmer user
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

COMMENT ON TABLE public.farms IS 'A farm/plot owned by a user; drives irrigation logs, listings, and detections.';
COMMENT ON COLUMN public.farms.crop_types IS 'Multi-select crop labels (e.g. tomato, wheat); align with app constants.';
COMMENT ON COLUMN public.farms.active_modules IS 'Enabled product modules per plot, e.g. mai, sila.';

-- ---------------------------------------------------------------------------
-- 3. irrigation_logs — MAÏ daily recommendations and weather snapshot
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  date date NOT NULL,
  should_irrigate boolean NOT NULL DEFAULT false,
  water_mm double precision,
  water_hours double precision,
  recommendation_darija text,
  weather_data jsonb,
  economy_dh double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (farm_id, date)
);

COMMENT ON TABLE public.irrigation_logs IS 'Per-farm daily irrigation decision, ET-based volumes, Darija copy, cached weather JSON.';
COMMENT ON COLUMN public.irrigation_logs.economy_dh IS 'Estimated water cost savings (DH) for dashboard / SMS context.';

-- ---------------------------------------------------------------------------
-- 4. price_history — regional wholesale / reference prices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type public.crop_type NOT NULL,
  region text NOT NULL,
  market public.market_name NOT NULL,
  price_dh_per_kg double precision NOT NULL,
  date date NOT NULL,
  source public.price_source NOT NULL DEFAULT 'mock'
);

COMMENT ON TABLE public.price_history IS 'Historical crop prices by region and major market; SILA trends and charts.';
COMMENT ON COLUMN public.price_history.source IS 'ONCA official vs mock seed for development.';

-- ---------------------------------------------------------------------------
-- 5. listings — farmer harvest offers on marketplace
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  crop_type public.crop_type NOT NULL,
  quantity_kg double precision NOT NULL,
  price_dh_per_kg double precision NOT NULL,
  storage_days_remaining integer,
  storage_type public.storage_type,
  freshness_status public.freshness_status,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.listings IS 'Active or past harvest listings for distributors; ties to farm and SILA storage hints.';

-- ---------------------------------------------------------------------------
-- 6. offers — distributor bids / negotiation on a listing
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  offered_price double precision NOT NULL,
  offered_quantity double precision NOT NULL,
  status public.offer_status NOT NULL DEFAULT 'pending',
  counter_price double precision,
  counter_quantity double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offers IS 'Negotiation thread from distributor to farmer listing; counters optional.';
COMMENT ON COLUMN public.offers.counter_price IS 'Farmer or counter-party revised price (DH per kg or total — document in app).';

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. detections — AI / expert diagnosis from farm photo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms (id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  diagnosis text,
  diagnosis_type public.diagnosis_type NOT NULL DEFAULT 'other',
  severity public.severity_level,
  action_ar text,
  product text,
  price_dh double precision,
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.detections IS 'Vision or rules-based diagnosis; confirmation gates community alerts.';

-- ---------------------------------------------------------------------------
-- 8. community_alerts — broadcast events around a detection / area
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid NOT NULL REFERENCES public.detections (id) ON DELETE CASCADE,
  alert_type public.alert_type NOT NULL,
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  radius_km integer NOT NULL DEFAULT 15,
  message_darija text,
  affected_farmers_count integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.community_alerts IS 'Radius-based alert (default 15 km) after confirmed detection; heatmap / push.';

-- ---------------------------------------------------------------------------
-- Indexes (foreign keys + common filters)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms (user_id);
CREATE INDEX IF NOT EXISTS idx_farms_location ON public.farms (location_lat, location_lng);

CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm_id ON public.irrigation_logs (farm_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_date ON public.irrigation_logs (date DESC);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_farm_date ON public.irrigation_logs (farm_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_price_history_crop_region_date ON public.price_history (crop_type, region, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_market_date ON public.price_history (market, date DESC);

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
CREATE INDEX IF NOT EXISTS idx_users_region ON public.users (region) WHERE region IS NOT NULL;
