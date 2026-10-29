import React, { useEffect, useState } from 'react';
import { supabase, fmt, SECTION_NAMES, type Range } from '../lib';
import { useTop } from '../hooks';
import { Card, Stat, HBars, I, Skeleton } from '../ui';

function getEventBadge(ev: any) {
  switch (ev.event) {
    case 'whatsapp_click':
      return {
        label: 'Contacto WhatsApp',
        classes: '!bg-emerald-100 !text-emerald-800 font-semibold border-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'lead_submit':
      return {
        label: 'Cotización Enviada',
        classes: '!bg-lime !text-neutral-900 font-bold border-lime shadow-sm',
        dot: 'bg-neutral-900',
      };
    case 'cta_click':
      return {
        label: 'Clic en Cotizar',
        classes: '!bg-amber-100 !text-amber-900 font-medium border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'instagram_click':
      return {
        label: 'Visita Instagram',
        classes: '!bg-fuchsia-100 !text-fuchsia-900 font-medium border-fuchsia-300',
        dot: 'bg-fuchsia-500',
      };
    case 'page_view':
      return {
        label: 'Visita a la Web',
        classes: '!bg-neutral-100 text-neutral-800 border-neutral-300 font-medium',
        dot: 'bg-blue-500',
      };
    case 'section_view':
      return {
        label: 'Lectura de Sección',
        classes: '!bg-neutral-50 text-neutral-600 border-neutral-200',
        dot: 'bg-neutral-400',
      };
    default:
      return {
        label: ev.event || 'Evento',
        classes: '!bg-white text-neutral-700',
        dot: 'bg-neutral-300',
      };
  }
}

function getLocationText(ev: any) {
  if (ev.section) {
    const clean = ev.section.replace(/^#/, '');
    const readable = SECTION_NAMES[clean] || clean;
    return `Sección: ${readable}`;
  }
  const p = ev.path || '/';
  if (p === '/') return 'Portada / Inicio';
  if (p === '/cotizar') return 'Formulario de Cotización';
  if (p === '/tienda') return 'Catálogo de Planes';
  if (p === '/proyectos') return 'Portafolio de Trabajos';
  if (p === '/politicas') return 'Políticas de Privacidad';
  if (p.startsWith('/servicio/')) {
    const s = p.replace('/servicio/', '').replace(/-/g, ' ');
    return `Servicio: ${s}`;
  }
  return p;
}

function getDetailText(ev: any) {
  if (ev.event === 'page_view') {
    if (ev.utm_source) {
      return `Campaña ${ev.utm_source}${ev.utm_campaign ? ` (${ev.utm_campaign})` : ''}`;
    }
    return 'Ingreso directo al sitio web';
  }
  if (ev.event === 'section_view') {
    const sec = ev.section ? ev.section.replace(/^#/, '') : '';
    const name = SECTION_NAMES[sec] || sec || 'contenido';
    return `Navegando en ${name}`;
  }
  if (ev.event === 'whatsapp_click') {
    return ev.label ? `Botón: "${ev.label}"` : 'Clic en enlace de WhatsApp';
  }
  if (ev.event === 'cta_click') {
    return ev.label ? `Botón: "${ev.label}"` : 'Clic para cotizar servicio';
  }
  if (ev.event === 'lead_submit') {
    return 'Formulario completado y enviado';
  }
  if (ev.label && !ev.label.includes('Vision Code — Agencia')) {
    return ev.label;
  }
  return 'Interacción registrada';
}

function DevicePill({ device }: { device?: string | null }) {
  const d = (device || '').toLowerCase();
  const isMobile = d === 'mobile' || d === 'tablet';
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 font-medium">
      <I name={isMobile ? 'smartphone' : 'monitor'} className="w-3.5 h-3.5 text-neutral-400" />
      <span>{d === 'mobile' ? 'Móvil' : d === 'tablet' ? 'Tablet' : 'Escritorio'}</span>
    </span>
  );
}

export default function Traffic({ range }: { range: Range }) {
  const sections = useTop(range, 'section', 'section_view', 10);
  const paths = useTop(range, 'path', 'page_view', 10);
  const devices = useTop(range, 'device', 'page_view', 5);
  const labels = useTop(range, 'label', 'whatsapp_click', 8);

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchRecentEvents = async () => {
    setLoadingEvents(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setRecentEvents(data);
    setLoadingEvents(false);
  };

  useEffect(() => {
    fetchRecentEvents();
    const ch = supabase
      .channel('live_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        setRecentEvents((prev) => [payload.new, ...prev.slice(0, 19)]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="space-y-4">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Most Viewed Sections */}
        <Card title="Secciones Más Vistas" action={<span className="vc-tag">{range.label}</span>}>
          {sections.loading ? (
            <Skeleton className="h-44" />
          ) : (
            <HBars
              rows={sections.rows.map((r) => ({
                key: r.key,
                label: SECTION_NAMES[r.key] || r.key,
                value: r.visitors,
                extra: r.whatsapp ? (
                  <span className="vc-tag !text-[9px] !py-0.5 !px-1 text-emerald-700 bg-emerald-50">
                    <I name="whatsapp" className="w-2.5 h-2.5" /> {r.whatsapp} WA
                  </span>
                ) : undefined,
              }))}
              valueFmt={fmt.n}
            />
          )}
        </Card>

        {/* Clicks on WhatsApp by Origin/Label */}
        <Card title="Botones WhatsApp que Más Convierten" action={<span className="vc-tag">Conversión</span>}>
          {labels.loading ? (
            <Skeleton className="h-44" />
          ) : (
            <HBars
              rows={labels.rows.map((r) => ({
                key: r.key,
                label: r.key || 'Botón WhatsApp General',
                value: r.total,
              }))}
              valueFmt={fmt.n}
            />
          )}
        </Card>

        {/* Devices */}
        <Card title="Dispositivos de los Visitantes" action={<span className="vc-tag">Hardware</span>}>
          {devices.loading ? (
            <Skeleton className="h-44" />
          ) : (
            <HBars
              rows={devices.rows.map((r) => ({
                key: r.key,
                label: r.key === 'mobile' ? 'Móvil (Celulares)' : r.key === 'desktop' ? 'Computadores (Escritorio)' : r.key === 'tablet' ? 'Tablets' : r.key,
                value: r.visitors,
              }))}
              valueFmt={fmt.n}
            />
          )}
        </Card>
      </div>

      {/* Pages and Live Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pages visited */}
        <Card title="Páginas Más Visitadas (Rutas)" className="lg:col-span-5">
          {paths.loading ? (
            <Skeleton className="h-56" />
          ) : (
            <HBars
              rows={paths.rows.map((r) => ({
                key: r.key,
                label: r.key || '/',
                value: r.visitors,
              }))}
              valueFmt={fmt.n}
            />
          )}
        </Card>

        {/* Live Event Stream */}
        <Card
          title="Flujo de Actividad en Vivo"
          className="lg:col-span-7"
          action={
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">En tiempo real</span>
            </div>
          }
        >
          {loadingEvents ? (
            <Skeleton className="h-56" />
          ) : (
            <div className="overflow-x-auto -mx-2 max-h-[380px] overflow-y-auto">
              <table className="vc-table">
                <thead>
                  <tr>
                    <th>Acción del Usuario</th>
                    <th>Página / Sección</th>
                    <th>Detalle de Interacción</th>
                    <th>Dispositivo</th>
                    <th className="text-right">Cuándo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((ev) => {
                    const badge = getEventBadge(ev);
                    const isLead = ev.event === 'lead_submit';
                    return (
                      <tr key={ev.id} className={isLead ? 'bg-lime-soft/40 font-semibold' : ''}>
                        <td>
                          <span className={`vc-tag ${badge.classes} inline-flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="text-xs text-neutral-800 font-medium">
                          {getLocationText(ev)}
                        </td>
                        <td className="text-xs text-neutral-600 max-w-[200px] truncate" title={getDetailText(ev)}>
                          {getDetailText(ev)}
                        </td>
                        <td className="text-[11px] text-neutral-600 font-medium">
                          <DevicePill device={ev.device} />
                        </td>
                        <td className="text-right text-[11px] text-neutral-400 whitespace-nowrap">
                          {fmt.ago(ev.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
