import React, { useState } from 'react';

/* ───────────────────────── Icons (stroke, 24px grid) ───────────────────────── */
const P = (d: string) => <path d={d} strokeLinecap="round" strokeLinejoin="round" />;
export const Icon = {
  grid: P('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'),
  users: <>{P('M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1')}<circle cx="9" cy="7" r="3.5" />{P('M22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75')}</>,
  megaphone: P('M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13'),
  chat: P('M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'),
  chart: P('M4 20V10M10 20V4M16 20v-7M22 20H2'),
  settings: <><circle cx="12" cy="12" r="3" />{P('M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z')}</>,
  logout: P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'),
  arrowUpRight: P('M7 17 17 7M8 7h9v9'),
  arrowDownRight: P('M7 7l10 10M17 8v9H8'),
  arrowRight: P('M5 12h14M12 5l7 7-7 7'),
  plus: P('M12 5v14M5 12h14'),
  search: <><circle cx="11" cy="11" r="7" />{P('m20 20-3.5-3.5')}</>,
  bell: P('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0'),
  calendar: <><rect x="3" y="4" width="18" height="18" rx="3" />{P('M16 2v4M8 2v4M3 10h18')}</>,
  clock: <><circle cx="12" cy="12" r="9" />{P('M12 7v5l3 2')}</>,
  close: P('M18 6 6 18M6 6l12 12'),
  whatsapp: <path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.5-.23-.36A9.45 9.45 0 0 1 2.5 12C2.5 6.76 6.78 2.5 12.05 2.5a9.5 9.5 0 0 1 9.5 9.5c0 5.24-4.27 9.5-9.5 9.5M20.12 3.9A11.4 11.4 0 0 0 12.05.5C5.73.5.6 5.63.6 11.95c0 2.02.53 3.99 1.53 5.72L.5 23.5l5.97-1.57a11.43 11.43 0 0 0 5.58 1.42h.01c6.31 0 11.45-5.13 11.45-11.45 0-3.06-1.19-5.94-3.36-8.1" />,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" />{P('m3 7 9 6 9-6')}</>,
  phone: P('M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z'),
  download: P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3'),
  refresh: P('M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5'),
  check: P('M20 6 9 17l-5-5'),
  link: P('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'),
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" />{P('M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')}</>,
  send: P('M22 2 11 13M22 2l-7 20-4-9-9-4z'),
  menu: P('M4 6h16M4 12h16M4 18h10'),
  eye: <>{P('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z')}<circle cx="12" cy="12" r="3" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  spark: P('M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8'),
  maximize: <>{P('M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3')}</>,
  minimize: <>{P('M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m6 0V4m0 6L3 3m14 7h6m-6 0V4m0 6l7-7')}</>,
  box: <>{P('M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z')}{P('m3.27 6.96 8.73 5.05 8.73-5.05')}{P('M12 22.08V12')}</>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" />{P('M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16')}</>,
  shield: P('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  creditCard: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" />{P('M1 10h22')}</>,
  tag: P('m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01'),
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  alertTriangle: <>{P('m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z')}{P('M12 9v4M12 17h.01')}</>,
  zap: P('M13 2 3 14h9l-1 8 10-12h-9l1-8z'),
  smartphone: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" />{P('M12 18h.01')}</>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" />{P('M8 21h8M12 17v4')}</>,
  user: <>{P('M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2')}<circle cx="12" cy="7" r="4" /></>,
  heart: P('M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'),
  bookmark: P('m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'),
  receipt: <><rect x="4" y="2" width="16" height="20" rx="2" />{P('M8 7h8M8 11h8M8 15h5')}</>,
  invoice: <>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6M16 13H8M16 17H8M10 9H8')}</>,
  quote: <>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6M12 18h6M12 14h6M8 14h.01M8 18h.01')}</>,
  trash: <>{P('M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6')}</>,
  edit: P('M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'),
};

export function I({ name, className = 'w-[18px] h-[18px]', strokeWidth = 1.8 }: { name: keyof typeof Icon; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      {Icon[name]}
    </svg>
  );
}

/* ───────────────────────── Building blocks ───────────────────────── */
export function Card({ children, className = '', title, dot = true, action }: { children: React.ReactNode; className?: string; title?: React.ReactNode; dot?: boolean; action?: React.ReactNode }) {
  return (
    <section className={`vc-card flex flex-col ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 mb-4 shrink-0">
          {title && (
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
              {dot && <span className="w-3.5 h-3.5 rounded-[5px] bg-lime shrink-0" />}
              <span className="truncate">{title}</span>
            </h3>
          )}
          {action}
        </header>
      )}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </section>
  );
}

export function DeltaPill({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const up = value >= 0;
  const good = inverse ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${good ? 'bg-lime text-neutral-900' : 'bg-neutral-900 text-white'}`}>
      <I name={up ? 'arrowUpRight' : 'arrowDownRight'} className="w-3 h-3" strokeWidth={2.4} />
      {Math.abs(value).toLocaleString('es-CL', { maximumFractionDigits: 1 })}%
    </span>
  );
}

export function Chip({ children, active, onClick, className = '' }: { children: React.ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${active ? 'bg-lime border-lime text-neutral-900' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'} ${className}`}>
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, delta: d, inverse }: { label: string; value: React.ReactNode; sub?: React.ReactNode; delta?: number; inverse?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-2">
        <div className="text-[30px] leading-none font-medium tracking-tight text-neutral-900 truncate">{value}</div>
        {d !== undefined && <DeltaPill value={d} inverse={inverse} />}
      </div>
      <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-neutral-400">{sub}</div>}
    </div>
  );
}

export function Empty({ title, children, icon = 'spark' }: { title: string; children?: React.ReactNode; icon?: keyof typeof Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="w-12 h-12 rounded-full bg-lime/60 flex items-center justify-center mb-3"><I name={icon} /></div>
      <div className="text-sm font-semibold text-neutral-800">{title}</div>
      {children && <div className="mt-1.5 text-xs text-neutral-500 max-w-sm leading-relaxed">{children}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-200/70 ${className}`} />;
}

/* ───────────────────────── Charts ───────────────────────── */
export function BarChart({ data, height = 190, valueFmt = (v: number) => String(v), highlight = 'max' }: {
  data: { label: string; value: number }[]; height?: number; valueFmt?: (v: number) => string; highlight?: 'max' | 'last';
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const hi = highlight === 'last' ? data.length - 1 : data.findIndex((d) => d.value === max);
  const ticks = [max, max / 2, 0];
  const step = Math.max(1, Math.ceil(data.length / 7));
  return (
    <div className="flex gap-3" style={{ height }}>
      <div className="flex flex-col justify-between text-[10px] text-neutral-400 pb-5 shrink-0 w-8 text-right">
        {ticks.map((t, i) => <span key={i}>{valueFmt(Math.round(t))}</span>)}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-end gap-[3px] sm:gap-1.5 relative">
          {data.map((d, i) => {
            const h = Math.max(4, (d.value / max) * 100);
            const active = hover === i || (hover === null && i === hi);
            return (
              <div key={i} className="flex-1 h-full flex items-end justify-center relative min-w-[3px]"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {active && (
                  <div className="absolute z-10 -translate-y-full whitespace-nowrap rounded-full bg-white shadow-md border border-neutral-100 px-2 py-0.5 text-[10.5px] font-semibold text-neutral-800"
                    style={{ bottom: `calc(${h}% + 6px)` }}>
                    {valueFmt(d.value)}
                  </div>
                )}
                <div className={`w-full max-w-[22px] rounded-full transition-all duration-300 ${active ? 'bg-lime ring-2 ring-lime/40' : 'bg-neutral-900'}`}
                  style={{ height: `${h}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex gap-[3px] sm:gap-1.5 mt-2 h-3">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center text-[9.5px] text-neutral-400 truncate min-w-[3px]">{i % step === 0 ? d.label : ''}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HBars({ rows, valueFmt = (v: number) => String(v), extra }: {
  rows: { key: string; label: string; value: number; extra?: React.ReactNode }[]; valueFmt?: (v: number) => string; extra?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Empty title="Sin datos aún">Los datos aparecerán cuando lleguen visitas.</Empty>;
  return (
    <div className="space-y-2.5">
      {extra && <div className="flex justify-end text-[10px] uppercase tracking-wide text-neutral-400">{extra}</div>}
      {rows.map((r, i) => (
        <div key={r.key} className="group">
          <div className="flex items-center justify-between text-[12px] mb-1 gap-2">
            <span className="text-neutral-700 truncate">{r.label}</span>
            <span className="flex items-center gap-2 shrink-0">
              {r.extra}
              <span className="font-semibold text-neutral-900 tabular-nums">{valueFmt(r.value)}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-200/70 overflow-hidden">
            <div className={`h-full rounded-full ${i === 0 ? 'bg-lime' : 'bg-neutral-900'}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Ring({ value, size = 150, label, sub }: { value: number; size?: number; label: React.ReactNode; sub?: React.ReactNode }) {
  const r = (size - 18) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e9eadf" strokeWidth="12" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#d7f55a" strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[26px] font-medium tracking-tight text-neutral-900">{label}</div>
        {sub && <div className="text-[10px] text-neutral-500 uppercase tracking-wide">{sub}</div>}
      </div>
    </div>
  );
}

export function Sparkline({ values, width = 120, height = 36 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - (v / max) * (height - 4) - 2}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#171717" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/30 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-[24px] shadow-2xl p-6 max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="vc-icon-btn"><I name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-neutral-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
