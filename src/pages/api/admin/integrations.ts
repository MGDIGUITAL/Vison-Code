import type { APIRoute } from 'astro';
import { env, json, requireAdmin } from '../../../lib/server';

export const prerender = false;

/** Estado de las integraciones (sin exponer secretos). */
export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;
  const has = (k: string) => Boolean(env(k));
  return json({
    email: auth.email,
    supabase: has('PUBLIC_SUPABASE_URL') && has('PUBLIC_SUPABASE_ANON_KEY'),
    serviceRole: has('SUPABASE_SERVICE_ROLE_KEY'),
    pixel: { id: env('META_PIXEL_ID') || '2153421501952376', capi: has('META_CAPI_TOKEN'), testCode: has('META_TEST_EVENT_CODE') },
    ads: has('META_ACCESS_TOKEN') && has('META_AD_ACCOUNT_ID'),
    whatsapp: has('WHATSAPP_TOKEN') && has('WHATSAPP_PHONE_NUMBER_ID'),
    instagram: has('META_PAGE_ACCESS_TOKEN'),
    webhook: has('META_WEBHOOK_VERIFY_TOKEN'),
    appSecret: has('META_APP_SECRET'),
  });
};
