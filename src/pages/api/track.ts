import type { APIRoute } from 'astro';
import { anonClient, sendMetaCapiEvent } from '../../lib/server';

export const prerender = false;

const ALLOWED = new Set(['page_view', 'section_view', 'whatsapp_click', 'instagram_click', 'cta_click', 'lead_submit', 'scroll_depth']);
const cut = (v: unknown, n = 300) => (typeof v === 'string' && v.length ? v.slice(0, n) : null);

/** Recibe eventos del tracker del sitio (sendBeacon) y los guarda en Supabase. */
export const POST: APIRoute = async ({ request }) => {
  let payload: any;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  const list: any[] = Array.isArray(payload?.events) ? payload.events.slice(0, 25) : [payload];
  const country = request.headers.get('x-vercel-ip-country');
  const cityRaw = request.headers.get('x-vercel-ip-city');
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;
  const ua = request.headers.get('user-agent') || '';
  if (/bot|crawl|spider|slurp|lighthouse|headless/i.test(ua)) return new Response(null, { status: 204 });

  const rows = list
    .filter((e) => e && ALLOWED.has(e.event))
    .map((e) => ({
      event: e.event,
      visitor_id: cut(e.visitor_id, 64),
      session_id: cut(e.session_id, 64),
      path: cut(e.path, 300),
      section: cut(e.section, 80),
      label: cut(e.label, 160),
      referrer: cut(e.referrer, 300),
      utm_source: cut(e.utm_source, 120),
      utm_medium: cut(e.utm_medium, 120),
      utm_campaign: cut(e.utm_campaign, 160),
      utm_content: cut(e.utm_content, 160),
      utm_term: cut(e.utm_term, 160),
      fbclid: cut(e.fbclid, 255),
      device: cut(e.device, 20),
      country,
      city,
      props: e.props && typeof e.props === 'object' ? e.props : {},
    }));

  if (!rows.length) return new Response(null, { status: 204 });

  const sb = anonClient();
  if (sb) {
    const { error } = await sb.from('events').insert(rows);
    if (error) console.warn('track insert error', error.message);
  }

  // Clics de WhatsApp → evento "Contact" también por Conversions API (deduplicado con el Pixel)
  for (const r of list) {
    if (r?.event === 'whatsapp_click' && r.event_id) {
      await sendMetaCapiEvent({
        eventName: 'Contact',
        eventId: r.event_id,
        sourceUrl: r.url,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: ua,
        fbclid: r.fbclid,
        fbp: r.fbp,
        customData: { content_name: r.label || 'whatsapp', section: r.section },
      });
    }
  }

  return new Response(null, { status: 204 });
};
