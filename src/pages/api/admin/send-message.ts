import type { APIRoute } from 'astro';
import { env, json, requireAdmin, anonClient, META_GRAPH } from '../../../lib/server';

export const prerender = false;

/** Responder desde la bandeja: WhatsApp Cloud API o Instagram Messaging API. */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  const { conversation_id, text } = await request.json().catch(() => ({}));
  if (!conversation_id || !text?.trim()) return json({ error: 'Faltan datos' }, 400);

  const sb = anonClient(auth.token)!;
  const { data: conv, error } = await sb.from('conversations').select('*').eq('id', conversation_id).single();
  if (error || !conv) return json({ error: 'Conversación no encontrada' }, 404);

  let externalId: string | null = null;
  try {
    if (conv.channel === 'whatsapp') {
      const token = env('WHATSAPP_TOKEN');
      const phoneId = env('WHATSAPP_PHONE_NUMBER_ID');
      if (!token || !phoneId) return json({ error: 'WhatsApp Cloud API no configurada' }, 400);
      const r = await fetch(`${META_GRAPH}/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: conv.external_id, type: 'text', text: { body: text } }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      externalId = d.messages?.[0]?.id || null;
    } else if (conv.channel === 'instagram' || conv.channel === 'messenger') {
      const token = env('META_PAGE_ACCESS_TOKEN');
      if (!token) return json({ error: 'Instagram Messaging no configurado' }, 400);
      const r = await fetch(`${META_GRAPH}/me/messages?access_token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: { id: conv.external_id }, message: { text } }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      externalId = d.message_id || null;
    }
  } catch (e: any) {
    return json({ error: e?.message || 'Error enviando' }, 502);
  }

  await sb.from('messages').insert({ conversation_id, direction: 'out', body: text, external_id: externalId });
  await sb.from('conversations').update({ last_message: text.slice(0, 200), last_message_at: new Date().toISOString(), unread: 0 }).eq('id', conversation_id);
  return json({ ok: true });
};
