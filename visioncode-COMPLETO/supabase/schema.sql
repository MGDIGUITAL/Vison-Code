-- ================================================
-- SUPABASE: Tabla de contactos para Vision Code
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ================================================

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  company     TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  plan        TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'new',        -- new | read | replied
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede insertar (formulario público)
CREATE POLICY "Allow public insert" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Política: solo el dueño autenticado puede leer
CREATE POLICY "Allow authenticated read" ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: solo el dueño autenticado puede actualizar
CREATE POLICY "Allow authenticated update" ON contacts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Índices útiles
CREATE INDEX idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX idx_contacts_status ON contacts (status);

-- ================================================
-- INSTRUCCIONES:
-- 1. Ir a app.supabase.com → tu proyecto → SQL Editor
-- 2. Pegar y ejecutar este script
-- 3. Ir a Settings → API → copiar:
--    - Project URL  → reemplazar YOUR_SUPABASE_URL en Contact.astro
--    - anon/public key → reemplazar YOUR_SUPABASE_ANON_KEY en Contact.astro
-- ================================================
