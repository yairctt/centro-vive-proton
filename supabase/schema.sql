-- =============================================================================
-- Pulso Jarocho · Schema de base de datos
-- Integrante 3 (feat/backend) · Reto 6 · Centro Histórico de Veracruz
-- NOTA: Este archivo ya fue ejecutado en Supabase. No re-ejecutar completo;
--       usarlo como referencia y para migraciones incrementales.
-- =============================================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tabla: profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id    UUID UNIQUE,                           -- Supabase Auth user.id
  alias      TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'visitante'
               CHECK (role IN ('visitante','comercio','admin')),
  points     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: places
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'historia',
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  opens_at      TIME,                               -- "HH:MM" ej. 09:00
  closes_at     TIME,
  avg_visit_min INTEGER NOT NULL DEFAULT 30,
  price_level   TEXT NOT NULL DEFAULT 'bajo'
                  CHECK (price_level IN ('bajo','medio','alto')),
  opportunity   NUMERIC(3,2) NOT NULL DEFAULT 0.50, -- 0.00–1.00
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  meta          JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: businesses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS businesses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  owner_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  contact    TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  meta       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  place_id   UUID REFERENCES places(id) ON DELETE SET NULL,
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ,
  category   TEXT NOT NULL DEFAULT 'cultura',
  source     TEXT NOT NULL DEFAULT '',
  verified   BOOLEAN NOT NULL DEFAULT FALSE,
  meta       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: missions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id    UUID REFERENCES places(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  points      INTEGER NOT NULL DEFAULT 10,
  night_bonus BOOLEAN NOT NULL DEFAULT FALSE,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: mission_accepts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_accepts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, mission_id)
);

-- ---------------------------------------------------------------------------
-- Tabla: qr_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id   UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: visits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  place_id       UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  mission_id     UUID REFERENCES missions(id) ON DELETE SET NULL,
  method         TEXT NOT NULL DEFAULT 'qr' CHECK (method IN ('qr','manual')),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: rewards
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rewards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  conditions  TEXT NOT NULL DEFAULT '',
  cost_points INTEGER NOT NULL DEFAULT 50,
  valid_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Tabla: redemptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id   UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  confirmed   BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Función helper: increment_points(profile_id, delta)
-- Suma puntos de forma atómica. Usada en POST /api/visits/validate.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_points(profile_id UUID, delta INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles
     SET points = points + delta
   WHERE id = profile_id
  RETURNING points INTO new_total;
  RETURN new_total;
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS (Row Level Security)
-- ---------------------------------------------------------------------------
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE places        ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_accepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions   ENABLE ROW LEVEL SECURITY;

-- places: lectura pública
CREATE POLICY IF NOT EXISTS "places_select_public"
  ON places FOR SELECT USING (true);

-- events: lectura pública
CREATE POLICY IF NOT EXISTS "events_select_public"
  ON events FOR SELECT USING (true);

-- missions: lectura pública de activas
CREATE POLICY IF NOT EXISTS "missions_select_public"
  ON missions FOR SELECT USING (active = true);

-- qr_tokens: lectura pública de activos
CREATE POLICY IF NOT EXISTS "qr_tokens_select_public"
  ON qr_tokens FOR SELECT USING (active = true);

-- rewards: lectura pública
CREATE POLICY IF NOT EXISTS "rewards_select_public"
  ON rewards FOR SELECT USING (true);

-- profiles: cada usuario ve su perfil; service role lo gestiona todo
CREATE POLICY IF NOT EXISTS "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_id OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_id OR auth.role() = 'service_role');

-- visits: service role escribe; usuario ve las suyas
CREATE POLICY IF NOT EXISTS "visits_select_own"
  ON visits FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ) OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "visits_insert_service"
  ON visits FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- mission_accepts: service role escribe; usuario ve los suyos
CREATE POLICY IF NOT EXISTS "mission_accepts_select_own"
  ON mission_accepts FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ) OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "mission_accepts_insert_service"
  ON mission_accepts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- redemptions: service role gestiona
CREATE POLICY IF NOT EXISTS "redemptions_select_service"
  ON redemptions FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "redemptions_insert_service"
  ON redemptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "redemptions_update_service"
  ON redemptions FOR UPDATE
  USING (auth.role() = 'service_role');

