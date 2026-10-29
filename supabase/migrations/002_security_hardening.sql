-- =====================================================================
-- VISION CODE · Blindaje de Seguridad & RLS — Migración 002
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run (es idempotente).
-- =====================================================================

-- 1. Actualizar función is_admin() para verificar el email real del usuario autenticado
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email'
  );
$$;

-- 2. Blindar tabla CONTACTS (Leads y clientes)
-- La clave anónima solo puede INSERTAR nuevos prospectos, jamás leer o descargar la base de datos.
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all contacts" ON contacts;
DROP POLICY IF EXISTS "anon insert contacts" ON contacts;
DROP POLICY IF EXISTS "admins manage contacts" ON contacts;

-- Permitir a los visitantes del sitio web enviar formularios o compras
CREATE POLICY "anon insert contacts" ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Solo administradores autenticados pueden ver, editar o borrar contactos
CREATE POLICY "admins manage contacts" ON contacts
  FOR ALL
  USING (is_admin() OR auth.role() = 'service_role')
  WITH CHECK (is_admin() OR auth.role() = 'service_role');

-- 3. Blindar tabla EVENTS (Métricas y tráfico)
-- Los visitantes pueden registrar eventos anónimos, pero no leer el historial de visitas.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow all events" ON events;
DROP POLICY IF EXISTS "anon insert events" ON events;
DROP POLICY IF EXISTS "admins read events" ON events;

CREATE POLICY "anon insert events" ON events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admins read events" ON events
  FOR SELECT
  USING (is_admin() OR auth.role() = 'service_role');

-- 4. Blindar tabla ADMIN_USERS
DROP POLICY IF EXISTS "admins read admins" ON admin_users;
CREATE POLICY "admins read admins" ON admin_users
  FOR SELECT
  USING (is_admin() OR auth.role() = 'service_role');
