import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string,
);

export async function authFetch(url: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  let masterToken = '';
  if (typeof localStorage !== 'undefined') {
    const master = localStorage.getItem('vc_master_auth');
    if (master) {
      try {
        const parsed = JSON.parse(master);
        masterToken = parsed.token || '';
      } catch {}
    }
  }
  const token = data.session?.access_token || masterToken;
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export type RangeKey = 'today' | '7d' | '30d' | '90d';
export interface Range { key: RangeKey; from: Date; to: Date; prevFrom: Date; prevTo: Date; label: string }

export function makeRange(key: RangeKey): Range {
  const now = new Date();
  const to = new Date(now.getTime() + 60_000);
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const days = key === 'today' ? 1 : key === '7d' ? 7 : key === '30d' ? 30 : 90;
  const from = new Date(start.getTime() - (days - 1) * 864e5);
  const span = to.getTime() - from.getTime();
  const label = key === 'today' ? 'Hoy' : `Últimos ${days} días`;
  return { key, from, to, prevFrom: new Date(from.getTime() - span), prevTo: from, label };
}

export const ymd = (d: Date) => d.toISOString().slice(0, 10);

const nf = new Intl.NumberFormat('es-CL');
export const fmt = {
  n: (v: number | null | undefined) => nf.format(Math.round(Number(v || 0))),
  dec: (v: number | null | undefined, d = 2) => Number(v || 0).toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d }),
  money: (v: number | null | undefined, cur = 'CLP') =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: cur, maximumFractionDigits: cur === 'CLP' ? 0 : 2 }).format(Number(v || 0)),
  pct: (v: number | null | undefined, d = 1) => `${Number(v || 0).toLocaleString('es-CL', { maximumFractionDigits: d })}%`,
  compact: (v: number | null | undefined) => new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0)),
  date: (v: string | Date) => new Date(v).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
  dateTime: (v: string | Date) => new Date(v).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  ago: (v: string | Date) => {
    const s = (Date.now() - new Date(v).getTime()) / 1000;
    if (s < 60) return 'ahora';
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    return `hace ${Math.floor(s / 86400)} d`;
  },
};

export const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : cur ? 100 : 0);

export const STAGES = [
  { id: 'nuevo', label: 'Nuevo', color: '#d7f55a' },
  { id: 'contactado', label: 'Contactado', color: '#c7d2fe' },
  { id: 'propuesta', label: 'Propuesta', color: '#fde68a' },
  { id: 'negociacion', label: 'Negociación', color: '#fbcfe8' },
  { id: 'ganado', label: 'Ganado', color: '#86efac' },
  { id: 'perdido', label: 'Perdido', color: '#e5e7eb' },
] as const;

export const SOURCES: Record<string, string> = {
  web: 'Web', whatsapp: 'WhatsApp', instagram: 'Instagram', messenger: 'Messenger', facebook: 'Meta Ads',
  referido: 'Referido', manual: 'Manual', google: 'Google',
};

export const SECTION_NAMES: Record<string, string> = {
  inicio: 'Hero / Inicio', servicios: 'Servicios', impacto: 'Proyectos', marcas: 'Clientes', proceso: 'Proceso',
  cotizar: 'Cotizar', contacto: 'Contacto', footer: 'Footer', header: 'Navbar',
};

export interface Contact {
  id: string; name: string | null; company: string | null; email: string | null; phone: string | null;
  plan: string | null; message: string | null; status: string | null; stage: string | null; value: number | null;
  source: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  utm_content: string | null; fbclid: string | null; notes: string | null; next_action_at: string | null;
  created_at: string; updated_at: string | null;
}

export function waLink(phone?: string | null, text = '') {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
