-- =====================================================================
-- VISION CODE · SaaS / CRM  — Migración 001
-- Ejecutar completo en Supabase → SQL Editor (es idempotente).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ADMINISTRADORES (correos autorizados para el panel)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  email       TEXT PRIMARY KEY,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

INSERT INTO admin_users (email, name) VALUES 
  ('vision.code.vs@gmail.com', 'Vision Code'),
  ('mpeg.tec.2000@gmail.com', 'Admin Master'),
  ('hagamosplata@vision-code.cl', 'Hagamos Plata')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT true;
$$;

DROP POLICY IF EXISTS "admins read admins" ON admin_users;
CREATE POLICY "admins read admins" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 2. EVENTOS DE TRÁFICO (visitas, secciones, clics WhatsApp, leads…)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  event         TEXT NOT NULL,          -- page_view | section_view | whatsapp_click | instagram_click | cta_click | lead_submit
  visitor_id    TEXT,
  session_id    TEXT,
  path          TEXT,
  section       TEXT,
  label         TEXT,
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  fbclid        TEXT,
  device        TEXT,
  country       TEXT,
  city          TEXT,
  props         JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_events_created ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event   ON events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events (visitor_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all events" ON events;
CREATE POLICY "allow all events" ON events FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 3. CRM: TABLA CONTACTS Y ACTIVIDADES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT,
  phone       TEXT,
  plan        TEXT,
  message     TEXT,
  status      TEXT DEFAULT 'new',        -- new | read | replied
  stage       TEXT DEFAULT 'nuevo',      -- nuevo | contactado | propuesta | negociacion | ganado | perdido
  value       NUMERIC DEFAULT 0,
  source      TEXT DEFAULT 'web',        -- web | whatsapp | instagram | referido | manual
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  fbclid      TEXT,
  visitor_id  TEXT,
  notes       TEXT,
  next_action_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Columnas añadidas por si ya existía la tabla previa
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS stage           TEXT DEFAULT 'nuevo';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS value           NUMERIC DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source          TEXT DEFAULT 'web';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS utm_source      TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS utm_medium      TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS utm_campaign    TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS utm_content     TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS fbclid          TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS visitor_id      TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS next_action_at  TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contacts ALTER COLUMN message DROP NOT NULL;
ALTER TABLE contacts ALTER COLUMN email   DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts (stage);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all contacts" ON contacts;
CREATE POLICY "allow all contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS lead_activities (
  id          BIGSERIAL PRIMARY KEY,
  contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'nota',   -- nota | llamada | whatsapp | email | reunion | cambio_etapa
  body        TEXT,
  author      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON lead_activities (contact_id, created_at DESC);
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all activities" ON lead_activities;
CREATE POLICY "allow all activities" ON lead_activities FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 4. BANDEJA UNIFICADA (WhatsApp + Instagram)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel          TEXT NOT NULL,          -- whatsapp | instagram
  external_id      TEXT NOT NULL,          -- teléfono WA o IGSID
  name             TEXT,
  contact_id       UUID REFERENCES contacts(id) ON DELETE SET NULL,
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ DEFAULT NOW(),
  unread           INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (channel, external_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id               BIGSERIAL PRIMARY KEY,
  conversation_id  UUID REFERENCES conversations(id) ON DELETE CASCADE,
  direction        TEXT NOT NULL,          -- in | out
  body             TEXT,
  external_id      TEXT UNIQUE,
  raw              JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages (conversation_id, created_at);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all conversations" ON conversations;
DROP POLICY IF EXISTS "allow all messages"      ON messages;
CREATE POLICY "allow all conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all messages"      ON messages      FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- 5. FUNCIONES DE MÉTRICAS (agregación en servidor)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION vc_kpis(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r JSON;
BEGIN
  SELECT json_build_object(
    'visitors',        COUNT(DISTINCT visitor_id),
    'sessions',        COUNT(DISTINCT session_id),
    'pageviews',       COUNT(*) FILTER (WHERE event = 'page_view'),
    'whatsapp_clicks', COUNT(*) FILTER (WHERE event = 'whatsapp_click'),
    'whatsapp_visitors', COUNT(DISTINCT visitor_id) FILTER (WHERE event = 'whatsapp_click'),
    'instagram_clicks',COUNT(*) FILTER (WHERE event = 'instagram_click'),
    'cta_clicks',      COUNT(*) FILTER (WHERE event = 'cta_click'),
    'leads',           COUNT(*) FILTER (WHERE event = 'lead_submit'),
    'paid_visitors',   COUNT(DISTINCT visitor_id) FILTER (WHERE fbclid IS NOT NULL OR utm_medium IN ('cpc','paid','paid_social','ads'))
  ) INTO r
  FROM events WHERE created_at >= p_from AND created_at < p_to;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION vc_daily(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS TABLE (day DATE, visitors BIGINT, pageviews BIGINT, whatsapp BIGINT, leads BIGINT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT (e.created_at AT TIME ZONE 'America/Santiago')::date AS day,
         COUNT(DISTINCT e.visitor_id),
         COUNT(*) FILTER (WHERE e.event = 'page_view'),
         COUNT(*) FILTER (WHERE e.event = 'whatsapp_click'),
         COUNT(*) FILTER (WHERE e.event = 'lead_submit')
  FROM events e
  WHERE e.created_at >= p_from AND e.created_at < p_to
  GROUP BY 1 ORDER BY 1;
END $$;

CREATE OR REPLACE FUNCTION vc_top(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ, p_dim TEXT, p_event TEXT DEFAULT NULL, p_limit INT DEFAULT 10)
RETURNS TABLE (key TEXT, total BIGINT, visitors BIGINT, whatsapp BIGINT, leads BIGINT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE col TEXT;
BEGIN
  col := CASE p_dim
    WHEN 'section'  THEN 'section'
    WHEN 'path'     THEN 'path'
    WHEN 'source'   THEN 'coalesce(utm_source, CASE WHEN fbclid IS NOT NULL THEN ''facebook'' END, nullif(split_part(split_part(referrer, ''//'', 2), ''/'', 1), ''''), ''directo'')'
    WHEN 'campaign' THEN 'coalesce(utm_campaign, ''(sin campaña)'')'
    WHEN 'device'   THEN 'coalesce(device, ''desconocido'')'
    WHEN 'country'  THEN 'coalesce(country, ''??'')'
    WHEN 'label'    THEN 'coalesce(label, ''(sin etiqueta)'')'
    ELSE NULL END;
  IF col IS NULL THEN RAISE EXCEPTION 'bad dimension'; END IF;
  RETURN QUERY EXECUTE format(
    'SELECT %s::text AS key,
            COUNT(*) FILTER (WHERE ($3 IS NULL OR event = $3)) AS total,
            COUNT(DISTINCT visitor_id) AS visitors,
            COUNT(*) FILTER (WHERE event = ''whatsapp_click'') AS whatsapp,
            COUNT(*) FILTER (WHERE event = ''lead_submit'') AS leads
     FROM events
     WHERE created_at >= $1 AND created_at < $2
       AND ($3 IS NULL OR event = $3 OR event IN (''whatsapp_click'',''lead_submit''))
       AND %s IS NOT NULL
     GROUP BY 1 HAVING COUNT(*) FILTER (WHERE ($3 IS NULL OR event = $3)) > 0
     ORDER BY 2 DESC LIMIT $4', col, col)
  USING p_from, p_to, p_event, p_limit;
END $$;

GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vc_kpis(TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vc_daily(TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION vc_top(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, INT) TO anon, authenticated;

-- Realtime para la bandeja
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION WHEN others THEN NULL; END $$;
