import { useEffect, useState } from 'react';
import { supabase, type Range, ymd } from './lib';

export interface Kpis {
  visitors: number; sessions: number; pageviews: number; whatsapp_clicks: number; whatsapp_visitors: number;
  instagram_clicks: number; cta_clicks: number; leads: number; paid_visitors: number;
}
export interface Daily { day: string; visitors: number; pageviews: number; whatsapp: number; leads: number }
export interface TopRow { key: string; total: number; visitors: number; whatsapp: number; leads: number }

const EMPTY: Kpis = { visitors: 0, sessions: 0, pageviews: 0, whatsapp_clicks: 0, whatsapp_visitors: 0, instagram_clicks: 0, cta_clicks: 0, leads: 0, paid_visitors: 0 };

/** Rellena días sin datos para que el gráfico sea continuo. */
export function fillDays(rows: Daily[], range: Range): Daily[] {
  const map = new Map(rows.map((r) => [String(r.day).slice(0, 10), r]));
  const out: Daily[] = [];
  const d = new Date(range.from);
  while (d <= range.to) {
    const k = ymd(new Date(d.getTime() - d.getTimezoneOffset() * 60000));
    const r = map.get(k);
    out.push({ day: k, visitors: Number(r?.visitors || 0), pageviews: Number(r?.pageviews || 0), whatsapp: Number(r?.whatsapp || 0), leads: Number(r?.leads || 0) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function useKpis(range: Range) {
  const [state, setState] = useState<{ cur: Kpis; prev: Kpis; daily: Daily[]; loading: boolean; error: string | null }>({ cur: EMPTY, prev: EMPTY, daily: [], loading: true, error: null });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    Promise.all([
      supabase.rpc('vc_kpis', { p_from: range.from.toISOString(), p_to: range.to.toISOString() }),
      supabase.rpc('vc_kpis', { p_from: range.prevFrom.toISOString(), p_to: range.prevTo.toISOString() }),
      supabase.rpc('vc_daily', { p_from: range.from.toISOString(), p_to: range.to.toISOString() }),
    ]).then(([a, b, c]) => {
      if (!alive) return;
      const err = a.error || b.error || c.error;
      setState({
        cur: { ...EMPTY, ...(a.data || {}) },
        prev: { ...EMPTY, ...(b.data || {}) },
        daily: fillDays((c.data as Daily[]) || [], range),
        loading: false,
        error: err ? err.message : null,
      });
    });
    return () => { alive = false; };
  }, [range.key, range.from.getTime()]);
  return state;
}

export function useTop(range: Range, dim: string, event: string | null = null, limit = 10) {
  const [rows, setRows] = useState<TopRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    supabase.rpc('vc_top', { p_from: range.from.toISOString(), p_to: range.to.toISOString(), p_dim: dim, p_event: event, p_limit: limit })
      .then(({ data }) => { if (alive) { setRows(((data as TopRow[]) || []).map((r) => ({ ...r, total: Number(r.total), visitors: Number(r.visitors), whatsapp: Number(r.whatsapp), leads: Number(r.leads) }))); setLoading(false); } });
    return () => { alive = false; };
  }, [range.key, range.from.getTime(), dim, event, limit]);
  return { rows, loading };
}
