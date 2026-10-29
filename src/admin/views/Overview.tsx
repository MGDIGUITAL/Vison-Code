import React, { useEffect, useState } from 'react';
import { supabase, fmt, delta, type Range, type Contact, STAGES, SOURCES, SECTION_NAMES } from '../lib';
import { useKpis, useTop } from '../hooks';
import { Card, Stat, BarChart, HBars, Ring, Chip, I, DeltaPill, Skeleton, Empty } from '../ui';

type Metric = 'visitors' | 'pageviews' | 'whatsapp' | 'leads';
const METRICS: { id: Metric; label: string }[] = [
  { id: 'visitors', label: 'Visitantes' },
  { id: 'pageviews', label: 'Páginas vistas' },
  { id: 'whatsapp', label: 'Clics WhatsApp' },
  { id: 'leads', label: 'Leads' },
];

export default function Overview({ range, go }: { range: Range; go: (v: any) => void }) {
  const { cur, prev, daily, loading, error } = useKpis(range);
  const sections = useTop(range, 'section', 'section_view', 6);
  const sources = useTop(range, 'source', 'page_view', 6);
  const [metric, setMetric] = useState<Metric>('visitors');
  const [leads, setLeads] = useState<Contact[]>([]);
  const [pipeline, setPipeline] = useState<{ open: number; won: number; count: number; wonCount: number }>({ open: 0, won: 0, count: 0, wonCount: 0 });

  useEffect(() => {
    supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(6).then(({ data }) => setLeads((data as Contact[]) || []));
    supabase.from('contacts').select('stage,value').then(({ data }) => {
      const rows = (data || []) as { stage: string; value: number }[];
      setPipeline({
        open: rows.filter((r) => !['ganado', 'perdido'].includes(r.stage || 'nuevo')).reduce((s, r) => s + Number(r.value || 0), 0),
        won: rows.filter((r) => r.stage === 'ganado').reduce((s, r) => s + Number(r.value || 0), 0),
        count: rows.filter((r) => !['ganado', 'perdido'].includes(r.stage || 'nuevo')).length,
        wonCount: rows.filter((r) => r.stage === 'ganado').length,
      });
    });
  }, []);

  const conv = cur.visitors ? ((cur.whatsapp_visitors + cur.leads) / cur.visitors) * 100 : 0;
  const prevConv = prev.visitors ? ((prev.whatsapp_visitors + prev.leads) / prev.visitors) * 100 : 0;
  const chartData = daily.map((d) => ({
    label: new Date(d.day + 'T12:00:00').toLocaleDateString('es-CL', range.key === '90d' ? { day: '2-digit', month: 'short' } : { day: '2-digit' }),
    value: d[metric],
  }));
  const servicesSeen = sections.rows.find((r) => r.key === 'servicios')?.visitors || 0;

  const funnel = [
    { label: 'Visitantes', value: cur.visitors },
    { label: 'Vieron servicios', value: servicesSeen },
    { label: 'Clic WhatsApp / Cotizar', value: cur.whatsapp_visitors + cur.cta_clicks },
    { label: 'Leads (formulario)', value: cur.leads },
  ];

  return (
    <div className="space-y-4">
      {error && <SetupBanner error={error} />}

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card title="Audiencia" className="lg:col-span-3" action={<span className="vc-tag">{range.label}</span>}>
          {loading ? <Skeleton className="h-40" /> : (
            <div className="flex-1 flex flex-col">
              <Stat label="Visitantes únicos" value={fmt.n(cur.visitors)} delta={delta(cur.visitors, prev.visitors)} />
              <div className="mt-6 text-[10px] uppercase tracking-wide text-neutral-500 leading-relaxed">
                Tráfico pagado <span className="underline decoration-lime decoration-2 underline-offset-2">Meta Ads</span><br />
                <span className="text-neutral-900 font-semibold text-sm normal-case">{fmt.n(cur.paid_visitors)}</span> visitantes · {fmt.pct(cur.visitors ? (cur.paid_visitors / cur.visitors) * 100 : 0)}
              </div>
              <div className="mt-auto pt-5 grid grid-cols-2 border-t border-neutral-200 -mx-5 px-5">
                <div className="pt-4 pr-3 border-r border-neutral-200">
                  <div className="text-[26px] font-medium tracking-tight">{fmt.n(cur.pageviews)}</div>
                  <div className="text-[10.5px] text-neutral-500">Páginas vistas</div>
                </div>
                <div className="pt-4 pl-4">
                  <div className="flex items-start gap-1.5"><span className="text-[26px] font-medium tracking-tight">{fmt.n(cur.sessions)}</span></div>
                  <div className="text-[10.5px] text-neutral-500">Sesiones</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Analítica" className="lg:col-span-6"
          action={<div className="flex items-center gap-3"><span className="text-[11px] text-neutral-500">Total</span><span className="text-[22px] font-medium tracking-tight">{fmt.n(daily.reduce((s, d) => s + d[metric], 0))}</span></div>}>
          {loading ? <Skeleton className="h-[230px]" /> : <BarChart data={chartData} height={200} valueFmt={(v) => fmt.compact(v)} />}
          <div className="mt-4 flex flex-wrap gap-2">
            {METRICS.map((m) => <Chip key={m.id} active={metric === m.id} onClick={() => setMetric(m.id)}>{m.label}</Chip>)}
          </div>
        </Card>

        <Card title="Embudo de conversión" className="lg:col-span-3">
          <div className="space-y-2">
            {funnel.map((f, i) => {
              const pct = funnel[0].value ? (f.value / funnel[0].value) * 100 : 0;
              return (
                <div key={f.label} className="rounded-2xl bg-white px-3.5 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] text-neutral-600">{f.label}</span>
                    {i > 0 && <span className="text-[10.5px] text-neutral-400">{fmt.pct(pct)}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-medium tracking-tight w-14">{fmt.n(f.value)}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden"><div className={`h-full rounded-full ${i === funnel.length - 1 ? 'bg-lime' : 'bg-neutral-900'}`} style={{ width: `${Math.max(i === 0 ? 100 : pct, 2)}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4 !bg-white border border-neutral-100" dot={false}>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex flex-col gap-1 mb-3">{[0, 1, 2].map((i) => <span key={i} className={`w-1 h-1 rounded-full ${i === 1 ? 'bg-neutral-900' : 'bg-neutral-300'}`} />)}</div>
              <h3 className="text-[20px] leading-tight font-medium tracking-tight">Tasa de conversión<br />de visitantes a contacto</h3>
              <p className="mt-3 text-[11.5px] text-neutral-500 leading-relaxed">Visitantes que hicieron clic en WhatsApp o enviaron una cotización.</p>
              <div className="mt-4 flex items-center gap-3">
                <button className="vc-btn plain !h-9 text-[11.5px]" onClick={() => go('crm')}><I name="plus" className="w-3.5 h-3.5" />Ver leads</button>
                <button className="text-[11.5px] text-neutral-500 hover:text-neutral-900" onClick={() => go('traffic')}>Ver detalle</button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-lime/30 blur-2xl" />
              <div className="relative"><Ring value={conv * 4} label={fmt.pct(conv)} sub={<DeltaPill value={delta(conv, prevConv)} />} /></div>
            </div>
          </div>
        </Card>

        <Card title="Secciones más vistas" className="lg:col-span-4" action={<button onClick={() => go('traffic')} className="vc-icon-btn !w-8 !h-8"><I name="arrowUpRight" className="w-3.5 h-3.5" /></button>}>
          {sections.loading ? <Skeleton className="h-40" /> : (
            <HBars rows={sections.rows.map((r) => ({
              key: r.key, label: SECTION_NAMES[r.key] || r.key, value: r.visitors,
              extra: r.whatsapp ? <span className="vc-tag !py-0.5 !px-1.5"><I name="whatsapp" className="w-3 h-3" />{r.whatsapp}</span> : undefined,
            }))} valueFmt={fmt.n} />
          )}
        </Card>

        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <MiniTile label="Clics WhatsApp" value={cur.whatsapp_clicks} d={delta(cur.whatsapp_clicks, prev.whatsapp_clicks)} icon="whatsapp" lime />
          <MiniTile label="Leads web" value={cur.leads} d={delta(cur.leads, prev.leads)} icon="target" />
          <MiniTile label="Clics Instagram" value={cur.instagram_clicks} d={delta(cur.instagram_clicks, prev.instagram_clicks)} icon="instagram" />
          <MiniTile label="Clics Cotizar" value={cur.cta_clicks} d={delta(cur.cta_clicks, prev.cta_clicks)} icon="arrowUpRight" />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card title="Leads recientes" className="lg:col-span-8" action={<button className="vc-btn !h-9 text-[11.5px]" onClick={() => go('crm')}>Abrir CRM<span className="vc-btn-dot !w-6 !h-6"><I name="arrowRight" className="w-3 h-3" /></span></button>}>
          {leads.length === 0 ? <Empty title="Aún no hay leads" icon="users">Cuando alguien envíe el formulario de cotización o escriba por WhatsApp aparecerá aquí.</Empty> : (
            <div className="overflow-x-auto -mx-2">
              <table className="vc-table">
                <thead><tr><th>Cliente</th><th>Servicio</th><th>Origen</th><th>Etapa</th><th className="text-right">Fecha</th></tr></thead>
                <tbody>
                  {leads.map((l) => {
                    const st = STAGES.find((s) => s.id === (l.stage || 'nuevo'));
                    return (
                      <tr key={l.id} className="cursor-pointer" onClick={() => go('crm')}>
                        <td><div className="font-medium">{l.name || '—'}</div><div className="text-[11px] text-neutral-400">{l.company || l.email || l.phone}</div></td>
                        <td className="max-w-[220px] truncate text-neutral-600">{l.plan || '—'}</td>
                        <td><span className="vc-tag">{SOURCES[l.source || 'web'] || l.source}{l.utm_campaign ? ` · ${l.utm_campaign}` : ''}</span></td>
                        <td><span className="vc-tag !border-0" style={{ background: st?.color }}>{st?.label || l.stage}</span></td>
                        <td className="text-right text-neutral-500 whitespace-nowrap">{fmt.ago(l.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="lg:col-span-4 grid grid-rows-[auto_1fr] gap-4">
          <div className="vc-card lime">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide">Pipeline abierto</span>
              <span className="vc-tag !bg-white/60 !border-0">{pipeline.count} oportunidades</span>
            </div>
            <div className="mt-3 text-[34px] font-medium tracking-tight leading-none">{fmt.money(pipeline.open)}</div>
            <div className="mt-3 flex items-center justify-between text-[11.5px]">
              <span>Ganado: <b>{fmt.money(pipeline.won)}</b></span>
              <span>{pipeline.wonCount} clientes</span>
            </div>
          </div>
          <Card title="Fuentes de tráfico">
            {sources.loading ? <Skeleton className="h-32" /> : (
              <HBars rows={sources.rows.map((r) => ({ key: r.key, label: r.key, value: r.visitors }))} valueFmt={fmt.n} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniTile({ label, value, d, icon, lime }: { label: string; value: number; d: number; icon: any; lime?: boolean }) {
  return (
    <div className={`vc-card flex flex-col justify-between min-h-[120px] ${lime ? '!bg-lime-soft' : ''}`}>
      <div className="flex items-center justify-between">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${lime ? 'bg-lime' : 'bg-white'}`}><I name={icon} className="w-4 h-4" /></span>
        <DeltaPill value={d} />
      </div>
      <div>
        <div className="text-[28px] font-medium tracking-tight leading-none mt-3">{fmt.n(value)}</div>
        <div className="text-[10.5px] text-neutral-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

export function SetupBanner({ error }: { error: string }) {
  return (
    <div className="rounded-[20px] bg-neutral-900 text-white p-5 flex flex-wrap items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-lime text-neutral-900 flex items-center justify-center"><I name="spark" /></div>
      <div className="flex-1 min-w-[240px]">
        <div className="font-semibold text-sm">Falta ejecutar la migración de base de datos</div>
        <div className="text-xs text-white/60 mt-0.5">Ejecuta <code className="text-lime">supabase/migrations/001_crm_saas.sql</code> en Supabase → SQL Editor. Detalle: {error}</div>
      </div>
    </div>
  );
}
