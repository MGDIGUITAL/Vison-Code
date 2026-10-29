import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { env, serviceClient } from '../../../lib/server';

export const prerender = false;

/**
 * Webhook de Meta para WhatsApp Cloud API e Instagram Messaging.
 * Configurar en developers.facebook.com → tu App → Webhooks:
 *   URL: https://www.vision-code.cl/api/webhooks/meta
 *   Verify token: META_WEBHOOK_VERIFY_TOKEN
 */
export const GET: APIRoute = async ({ url }) => {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === env('META_WEBHOOK_VERIFY_TOKEN')) {
    return new Response(challenge || '', { status: 200 });
  }
  return new Response('forbidden', { status: 403 });
};

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();

  const secret = env('META_APP_SECRET');
  if (secret) {
    const sig = request.headers.get('x-hub-signature-256') || '';
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return new Response('bad signature', { status: 401 });
  }

  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response('ok'); }

  const sb = serviceClient();
  if (!sb) { console.warn('Webhook: falta SUPABASE_SERVICE_ROLE_KEY'); return new Response('ok'); }

  const save = async (channel: 'whatsapp' | 'instagram' | 'messenger', externalUser: string, name: string | null, direction: 'in' | 'out', text: string, msgId: string, ts: number, rawMsg: any) => {
    const { data: existing } = await sb.from('conversations').select('id, unread, contact_id').eq('channel', channel).eq('external_id', externalUser).maybeSingle();
    let convId = existing?.id as string | undefined;
    const preview = text.slice(0, 200);
    const at = new Date(ts).toISOString();
    if (!convId) {
      // Crear lead automáticamente en el CRM
      const { data: contact } = await sb.from('contacts').insert({
        name: name || (channel === 'whatsapp' ? `+${externalUser}` : `IG ${externalUser}`),
        phone: channel === 'whatsapp' ? `+${externalUser}` : null,
        message: preview, status: 'new', stage: 'nuevo', source: channel,
      }).select('id').single();
      const { data: conv } = await sb.from('conversations').insert({
        channel, external_id: externalUser, name, contact_id: contact?.id || null,
        last_message: preview, last_message_at: at, unread: direction === 'in' ? 1 : 0,
      }).select('id').single();
      convId = conv?.id;
    } else {
      await sb.from('conversations').update({
        last_message: preview, last_message_at: at,
        unread: direction === 'in' ? (existing!.unread || 0) + 1 : 0,
        ...(name ? { name } : {}),
      }).eq('id', convId);
    }
    if (convId) {
      await sb.from('messages').upsert({ conversation_id: convId, direction, body: text, external_id: msgId, raw: rawMsg, created_at: at }, { onConflict: 'external_id', ignoreDuplicates: true });
    }
  };

  const describe = (m: any): string => {
    if (m.text?.body) return m.text.body;
    if (m.button?.text) return m.button.text;
    if (m.interactive) return m.interactive.button_reply?.title || m.interactive.list_reply?.title || '[interactivo]';
    return `[${m.type || 'mensaje'}]`;
  };

  try {
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const v = change.value || {};
          const names: Record<string, string> = {};
          for (const c of v.contacts || []) names[c.wa_id] = c.profile?.name;
          for (const m of v.messages || []) {
            await save('whatsapp', m.from, names[m.from] || null, 'in', describe(m), m.id, Number(m.timestamp) * 1000, m);
          }
        }
      }
    } else if (body.object === 'instagram' || body.object === 'page') {
      for (const entry of body.entry || []) {
        for (const ev of entry.messaging || []) {
          if (!ev.message) continue;
          const isEcho = Boolean(ev.message.is_echo);
          const user = isEcho ? ev.recipient?.id : ev.sender?.id;
          if (!user) continue;
          const text = ev.message.text || (ev.message.attachments ? '[adjunto]' : '[mensaje]');
          await save(body.object === 'page' ? 'messenger' : 'instagram', user, null, isEcho ? 'out' : 'in', text, ev.message.mid, ev.timestamp || Date.now(), ev);
        }
      }
    }
  } catch (e) {
    console.error('webhook error', e);
  }
  return new Response('ok', { status: 200 });
};
