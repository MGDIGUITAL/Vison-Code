import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

/** Lee variables tanto en Vercel (process.env) como en dev (import.meta.env). */
export function env(key: string): string | undefined {
  return (typeof process !== 'undefined' ? process.env[key] : undefined) || (import.meta.env as any)[key] || undefined;
}

export const META_GRAPH = 'https://graph.facebook.com/v21.0';

/** Cliente con anon key (respeta RLS). */
export function anonClient(accessToken?: string): SupabaseClient | null {
  const url = env('PUBLIC_SUPABASE_URL');
  const key = env('PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

/** Cliente service-role (salta RLS). Solo para webhooks del servidor. */
export function serviceClient(): SupabaseClient | null {
  const url = env('PUBLIC_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function json(data: unknown, status = 200, customHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...customHeaders,
    },
  });
}

const ADMIN_SECRET = env('ADMIN_AUTH_SECRET') || 'vc_secure_token_secret_2026_master_key_visioncode';

/** Genera un token firmado con HMAC-SHA256 para el administrador verificado. */
export function createAdminToken(user: string): string {
  const timestamp = Date.now();
  const payload = `${user}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/** Verifica criptográficamente que el token de sesión haya sido firmado por este servidor. */
export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [user, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    // Válido por 14 días
    if (isNaN(timestamp) || Date.now() - timestamp > 14 * 24 * 60 * 60 * 1000) {
      return false;
    }
    const payload = `${user}:${timestampStr}`;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/** Verifica que la petición venga de un administrador logueado en el panel (Token firmado o Supabase). */
export async function requireAdmin(request: Request): Promise<{ ok: true; email: string; token: string } | { ok: false; res: Response }> {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');

  if (!token) return { ok: false, res: json({ error: 'unauthorized' }, 401) };

  // 1. Verificar si es token seguro firmado por el backend
  if (verifyAdminToken(token)) {
    return { ok: true, email: 'admin@vision-code.cl', token };
  }

  // 2. Fallback a sesión de Supabase Auth
  const sb = anonClient(token);
  if (sb) {
    const { data: userData, error } = await sb.auth.getUser(token);
    if (!error && userData?.user) {
      return { ok: true, email: userData.user.email || '', token };
    }
  }

  return { ok: false, res: json({ error: 'unauthorized' }, 401) };
}

const sha256 = (v: string) => crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

/**
 * Meta Conversions API (server-side). Se deduplica con el Pixel mediante event_id.
 * Requiere META_PIXEL_ID y META_CAPI_TOKEN. Si no existen, no hace nada.
 */
export async function sendMetaCapiEvent(opts: {
  eventName: string;
  eventId?: string;
  sourceUrl?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  ip?: string | null;
  userAgent?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  customData?: Record<string, unknown>;
}) {
  const pixelId = env('META_PIXEL_ID') || '2153421501952376';
  const token = env('META_CAPI_TOKEN');
  if (!token) return { skipped: true };

  const user_data: Record<string, unknown> = {};
  if (opts.email) user_data.em = [sha256(opts.email)];
  if (opts.phone) user_data.ph = [sha256(opts.phone.replace(/\D/g, ''))];
  if (opts.firstName) user_data.fn = [sha256(opts.firstName.split(' ')[0])];
  if (opts.ip) user_data.client_ip_address = opts.ip;
  if (opts.userAgent) user_data.client_user_agent = opts.userAgent;
  if (opts.fbp) user_data.fbp = opts.fbp;
  if (opts.fbclid) user_data.fbc = `fb.1.${Date.now()}.${opts.fbclid}`;

  const body: Record<string, unknown> = {
    data: [{
      event_name: opts.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: 'website',
      event_source_url: opts.sourceUrl,
      user_data,
      custom_data: opts.customData || {},
    }],
  };
  const testCode = env('META_TEST_EVENT_CODE');
  if (testCode) body.test_event_code = testCode;

  try {
    const r = await fetch(`${META_GRAPH}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await r.json();
  } catch (e) {
    console.warn('Meta CAPI error', e);
    return { error: true };
  }
}
