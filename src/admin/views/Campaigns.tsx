import React, { useEffect, useState } from 'react';
import { authFetch, fmt, type Range } from '../lib';
import { Card, Stat, Chip, I, Empty, Skeleton, Field } from '../ui';

interface MetaData {
  configured: boolean;
  currency?: string;
  error?: string;
  totals?: {
    spend: number;
    reach: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    frequency: number;
    leads: number;
    contacts: number;
    conversations: number;
  };
  campaigns?: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    daily_budget: number | null;
    spend: number;
    reach: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    leads: number;
    contacts: number;
    cpl: number | null;
  }>;
}

export default function Campaigns({ range }: { range: Range }) {
  const [data, setData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);

  // UTM Generator tool states
  const [baseUrl, setBaseUrl] = useState('https://www.vision-code.cl/');
  const [utmCampaign, setUtmCampaign] = useState('lanzamiento_q4');
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('paid_social');
  const [utmContent, setUtmContent] = useState('video_hook_01');
  const [copied, setCopied] = useState(false);

  const fetchMetaInsights = async () => {
    setLoading(true);
    try {
      const since = range.from.toISOString().slice(0, 10);
      const until = range.to.toISOString().slice(0, 10);
      const res = await authFetch(`/api/admin/meta-insights?since=${since}&until=${until}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ configured: false });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetaInsights();
  }, [range.key, range.from.getTime()]);

  const generatedUrl = `${baseUrl.replace(/\/$/, '')}${baseUrl.includes('?') ? '&' : '?'}utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}${utmContent ? `&utm_content=${encodeURIComponent(utmContent)}` : ''}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigured = data?.configured && !data?.error;
  const totals = data?.totals || {
    spend: 0,
    reach: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    frequency: 0,
    leads: 0,
    contacts: 0,
    conversations: 0,
  };

  return (
    <div className="space-y-4">
      {/* Meta API status alert if not yet connected */}
      {!loading && !isConfigured && (
        <div className="rounded-2xl bg-neutral-900 text-white p-5 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">Meta Ads Marketing API & Conversiones</div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {data?.error ? `Error: ${data.error}` : 'El Pixel de Meta (2153421501952376) ya está activo y rastreando en el sitio. Para sincronizar el gasto y alcance en vivo de tus anuncios, agrega tu META_ACCESS_TOKEN y META_AD_ACCOUNT_ID en .env.local.'}
              </div>
            </div>
          </div>
          <span className="vc-tag !bg-lime !text-black !border-0 font-bold shrink-0">
            Pixel 2153421501952376 Activo
          </span>
        </div>
      )}

      {/* Top Ads KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <Stat
            label="Inversión Total"
            value={fmt.money(totals.spend, data?.currency || 'CLP')}
            sub={`${fmt.n(totals.impressions)} impresiones`}
          />
        </Card>
        <Card>
          <Stat
            label="Alcance Único"
            value={fmt.n(totals.reach)}
            sub={`Frecuencia: ${fmt.dec(totals.frequency, 1)}`}
          />
        </Card>
        <Card>
          <Stat
            label="Clics en el Enlace"
            value={fmt.n(totals.clicks)}
            sub={`CTR: ${fmt.pct(totals.ctr)} · CPC: ${fmt.money(totals.cpc, data?.currency || 'CLP')}`}
          />
        </Card>
        <Card className="!bg-lime-soft">
          <Stat
            label="Conversiones Totales (Leads + WA)"
            value={fmt.n(totals.leads + totals.contacts)}
            sub={totals.leads ? `CPL Promedio: ${fmt.money(totals.spend / totals.leads, data?.currency || 'CLP')}` : 'Sin leads en el rango'}
          />
        </Card>
      </div>

      {/* Campaigns Table & UTM Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Campaigns List */}
        <Card
          title="Rendimiento por Campaña"
          className="lg:col-span-8"
          action={
            <button onClick={fetchMetaInsights} className="vc-icon-btn !w-8 !h-8" title="Actualizar datos">
              <I name="refresh" className="w-3.5 h-3.5" />
            </button>
          }
        >
          {loading ? (
            <Skeleton className="h-64" />
          ) : !isConfigured || !data?.campaigns?.length ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-lime/40 text-neutral-800 flex items-center justify-center mx-auto mb-3">
                <I name="megaphone" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-800">Crea tu primera campaña con tracking</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                Usa el <b>Generador de Enlaces UTM</b> a la derecha para etiquetar los anuncios que publiques en Facebook e Instagram Ads. El sistema registrará cada clic, sesión y cotización asociada automáticamente.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold bg-neutral-100 rounded-full px-4 py-2 text-neutral-700">
                <I name="check" className="w-4 h-4 text-emerald-600" />
                <span>Pixel de Meta deduplicado con eventos CAPI listo</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="vc-table">
                <thead>
                  <tr>
                    <th>Campaña</th>
                    <th>Estado</th>
                    <th>Inversión</th>
                    <th>Alcance</th>
                    <th>Clics</th>
                    <th>CTR</th>
                    <th>Leads</th>
                    <th className="text-right">CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="font-semibold text-xs text-neutral-900">{c.name}</div>
                        <div className="text-[10px] text-neutral-400">ID: {c.id}</div>
                      </td>
                      <td>
                        <span className={`vc-tag ${c.status === 'ACTIVE' ? '!bg-lime !border-lime text-black font-semibold' : ''}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="font-medium text-xs">{fmt.money(c.spend, data.currency)}</td>
                      <td className="text-neutral-600 text-xs">{fmt.n(c.reach)}</td>
                      <td className="text-neutral-600 text-xs">{fmt.n(c.clicks)}</td>
                      <td className="text-neutral-600 text-xs">{fmt.pct(c.ctr)}</td>
                      <td>
                        <span className="font-bold text-xs text-neutral-900">{c.leads || c.contacts}</span>
                      </td>
                      <td className="text-right font-medium text-xs">
                        {c.cpl ? fmt.money(c.cpl, data.currency) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Campaign UTM Generator */}
        <Card title="Generador de Enlaces de Campaña (UTM)" className="lg:col-span-4">
          <p className="text-[11.5px] text-neutral-500 mb-4 leading-relaxed">
            Genera enlaces etiquetados para que el sistema de Vision Code identifique con precisión qué anuncio o historia trajo al cliente.
          </p>

          <div className="space-y-3 text-xs">
            <Field label="Página de Destino">
              <select
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="vc-select"
              >
                <option value="https://www.vision-code.cl/">Inicio (Landing Principal)</option>
                <option value="https://www.vision-code.cl/cotizar">Página de Cotización (/cotizar)</option>
                <option value="https://www.vision-code.cl/proyectos">Portafolio (/proyectos)</option>
                <option value="https://www.vision-code.cl/servicio/desarrollo-web-sistemas">Servicio Desarrollo Web</option>
                <option value="https://www.vision-code.cl/servicio/agente-ia-whatsapp-premium">Servicio Agente IA WhatsApp</option>
              </select>
            </Field>

            <Field label="Nombre de la Campaña (utm_campaign)">
              <input
                type="text"
                placeholder="Ej: promo_abril_web"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="vc-input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Fuente (utm_source)">
                <select
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="vc-select"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="google">Google Ads</option>
                </select>
              </Field>
              <Field label="Medio (utm_medium)">
                <select
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="vc-select"
                >
                  <option value="paid_social">Feed / Anuncio Pago</option>
                  <option value="stories">Stories</option>
                  <option value="reels">Reels</option>
                  <option value="bio">Enlace Bio</option>
                </select>
              </Field>
            </div>

            <Field label="Contenido / Creativo (utm_content)">
              <input
                type="text"
                placeholder="Ej: carrusel_testimonios"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                className="vc-input"
              />
            </Field>

            <div className="pt-2">
              <div className="p-2.5 bg-neutral-900 text-white rounded-xl break-all font-mono text-[10.5px]">
                {generatedUrl}
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className="vc-btn lime w-full mt-2.5 !h-10 text-xs"
              >
                <I name={copied ? 'check' : 'copy'} className="w-4 h-4" />
                <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace para el Anuncio'}</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
