import type { APIRoute } from 'astro';
import { env, json, requireAdmin, META_GRAPH } from '../../../lib/server';

export const prerender = false;

/**
 * Métricas de Meta Ads (Facebook/Instagram) para el panel.
 * Requiere META_ACCESS_TOKEN (System User token con ads_read) y META_AD_ACCOUNT_ID.
 * Query: ?since=YYYY-MM-DD&until=YYYY-MM-DD
 */
export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  const token = env('META_ACCESS_TOKEN');
  const rawAccount = env('META_AD_ACCOUNT_ID');
  if (!token || !rawAccount) return json({ configured: false });
  const account = rawAccount.startsWith('act_') ? rawAccount : `act_${rawAccount}`;

  const since = url.searchParams.get('since') || new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
  const until = url.searchParams.get('until') || new Date().toISOString().slice(0, 10);
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }));
  const fields = 'campaign_id,campaign_name,spend,reach,impressions,clicks,inline_link_clicks,ctr,cpc,cpm,frequency,actions,cost_per_action_type';

  const get = async (path: string) => {
    const r = await fetch(`${META_GRAPH}/${path}${path.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(token)}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    return d;
  };

  try {
    const [campaignInsights, campaigns, daily, totals] = await Promise.all([
      get(`${account}/insights?level=campaign&fields=${fields}&time_range=${timeRange}&limit=100`),
      get(`${account}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time&limit=100`),
      get(`${account}/insights?fields=spend,reach,impressions,clicks,actions&time_range=${timeRange}&time_increment=1&limit=120`),
      get(`${account}/insights?fields=spend,reach,impressions,clicks,inline_link_clicks,ctr,cpc,cpm,frequency,actions,account_currency&time_range=${timeRange}`),
    ]);

    const pick = (actions: any[] | undefined, types: string[]) =>
      (actions || []).filter((a) => types.includes(a.action_type)).reduce((s, a) => s + Number(a.value || 0), 0);
    const LEAD = ['lead', 'offsite_conversion.fb_pixel_lead', 'onsite_conversion.lead_grouped'];
    const CONTACT = ['contact', 'offsite_conversion.fb_pixel_contact', 'onsite_conversion.messaging_conversation_started_7d'];
    const MSG = ['onsite_conversion.messaging_conversation_started_7d', 'onsite_conversion.total_messaging_connection'];

    const statusById: Record<string, any> = {};
    for (const c of campaigns.data || []) statusById[c.id] = c;

    const rows = (campaignInsights.data || []).map((r: any) => {
      const spend = Number(r.spend || 0);
      const leads = pick(r.actions, LEAD);
      const contacts = pick(r.actions, CONTACT);
      const conversations = pick(r.actions, MSG);
      const meta = statusById[r.campaign_id] || {};
      return {
        id: r.campaign_id,
        name: r.campaign_name,
        status: meta.effective_status || meta.status || 'UNKNOWN',
        objective: meta.objective || null,
        daily_budget: meta.daily_budget ? Number(meta.daily_budget) / 100 : null,
        spend,
        reach: Number(r.reach || 0),
        impressions: Number(r.impressions || 0),
        clicks: Number(r.inline_link_clicks || r.clicks || 0),
        ctr: Number(r.ctr || 0),
        cpc: Number(r.cpc || 0),
        cpm: Number(r.cpm || 0),
        frequency: Number(r.frequency || 0),
        leads,
        contacts,
        conversations,
        cpl: leads ? spend / leads : null,
      };
    });

    // Campañas sin entrega en el rango
    for (const c of campaigns.data || []) {
      if (!rows.find((r: any) => r.id === c.id)) {
        rows.push({ id: c.id, name: c.name, status: c.effective_status || c.status, objective: c.objective,
          daily_budget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
          spend: 0, reach: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, frequency: 0, leads: 0, contacts: 0, conversations: 0, cpl: null });
      }
    }

    const t = (totals.data || [])[0] || {};
    return json({
      configured: true,
      currency: t.account_currency || 'CLP',
      totals: {
        spend: Number(t.spend || 0),
        reach: Number(t.reach || 0),
        impressions: Number(t.impressions || 0),
        clicks: Number(t.inline_link_clicks || t.clicks || 0),
        ctr: Number(t.ctr || 0),
        cpc: Number(t.cpc || 0),
        cpm: Number(t.cpm || 0),
        frequency: Number(t.frequency || 0),
        leads: pick(t.actions, LEAD),
        contacts: pick(t.actions, CONTACT),
        conversations: pick(t.actions, MSG),
      },
      daily: (daily.data || []).map((d: any) => ({
        day: d.date_start,
        spend: Number(d.spend || 0),
        reach: Number(d.reach || 0),
        impressions: Number(d.impressions || 0),
        clicks: Number(d.clicks || 0),
        leads: pick(d.actions, LEAD),
      })),
      campaigns: rows.sort((a: any, b: any) => b.spend - a.spend),
    });
  } catch (e: any) {
    return json({ configured: true, error: e?.message || 'Meta API error' }, 502);
  }
};
