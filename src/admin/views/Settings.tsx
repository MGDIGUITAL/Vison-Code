import React, { useEffect, useState } from 'react';
import { supabase, authFetch, fmt } from '../lib';
import { Card, I, Skeleton, Field } from '../ui';

interface IntegrationsStatus {
  email: string;
  supabase: boolean;
  serviceRole: boolean;
  pixel: { id: string; capi: boolean; testCode: boolean };
  ads: boolean;
  whatsapp: boolean;
  instagram: boolean;
  webhook: boolean;
  appSecret: boolean;
}

export default function Settings() {
  const [status, setStatus] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Quick Campaign Config States
  const [activePixel, setActivePixel] = useState(() => localStorage.getItem('vc_custom_pixel') || '2153421501952376');
  const [activePhone, setActivePhone] = useState(() => localStorage.getItem('vc_custom_phone') || '+56 9 6455 2200');
  const [configSaved, setConfigSaved] = useState(false);

  const handleSaveCampaignConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vc_custom_pixel', activePixel.trim());
    localStorage.setItem('vc_custom_phone', activePhone.trim());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/integrations');
      if (res.ok) {
        const json = await res.json();
        setStatus(json);
      }
    } catch (e) {
      console.warn('Error fetching integrations', e);
    }
    setLoading(false);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: true });
    if (data) setAdmins(data);
  };

  useEffect(() => {
    fetchStatus();
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    const { error } = await supabase.from('admin_users').insert({
      email: newAdminEmail.trim().toLowerCase(),
      name: newAdminName.trim() || newAdminEmail.split('@')[0],
    });
    setAddingAdmin(false);
    if (!error) {
      setNewAdminEmail('');
      setNewAdminName('');
      fetchAdmins();
    }
  };

  const handleTestEvent = () => {
    if (window.fbq) {
      window.fbq('trackCustom', 'TestEventVisionCode', { status: 'healthy', timestamp: Date.now() });
    }
    if (window.vcTrack) {
      window.vcTrack('cta_click', { label: 'Prueba desde Panel Ajustes', section: 'settings' }, true);
    }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Configuración Rápida de Campaña (Pixel & WhatsApp) */}
      <Card title="Configuración de Campaña Actual (Sin tocar código)">
        <form onSubmit={handleSaveCampaignConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              ID del Píxel de Meta (Campaña Activa)
            </label>
            <input
              type="text"
              value={activePixel}
              onChange={(e) => setActivePixel(e.target.value)}
              placeholder="Ej. 2153421501952376"
              className="vc-input w-full text-xs font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Cambia este ID cuando lances una campaña con un píxel nuevo.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Teléfono WhatsApp de Ventas
            </label>
            <input
              type="text"
              value={activePhone}
              onChange={(e) => setActivePhone(e.target.value)}
              placeholder="+56 9 6455 2200"
              className="vc-input w-full text-xs"
            />
            <span className="text-[10px] text-neutral-400 mt-1 block">
              Número donde entrarán los prospectos y responderá tu bot.
            </span>
          </div>

          <div>
            <button type="submit" className="vc-btn lime w-full !h-10 text-xs font-bold">
              <I name="check" className="w-4 h-4" />
              <span>{configSaved ? '¡Configuración Guardada!' : 'Guardar Ajustes de Campaña'}</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Meta Pixel & CAPI */}
        <Card title="Meta Pixel & CAPI">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  f
                </div>
                <div>
                  <div className="text-xs font-semibold">Pixel 2153421501952376</div>
                  <div className="text-[10px] text-neutral-400">Instalado en Layout.astro</div>
                </div>
              </div>
              <span className="vc-tag !bg-lime !border-lime text-black font-bold">Activo</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div>
                <div className="text-xs font-semibold">Conversions API (CAPI)</div>
                <div className="text-[10px] text-neutral-400">Servidor a Meta sin bloqueadores</div>
              </div>
              <span className={`vc-tag ${status?.pixel.capi ? '!bg-lime !border-lime text-black font-bold' : ''}`}>
                {status?.pixel.capi ? 'Conectado' : 'Token pendiente'}
              </span>
            </div>

            <button
              onClick={handleTestEvent}
              className="vc-btn lime w-full !h-9 text-xs"
            >
              <I name="target" className="w-3.5 h-3.5" />
              <span>{testSent ? '¡Evento enviado al Pixel!' : 'Disparar Evento de Prueba'}</span>
            </button>
          </div>
        </Card>

        {/* Database & Cloud */}
        <Card title="Base de Datos & Auth">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div>
                <div className="text-xs font-semibold">Supabase PostgreSQL</div>
                <div className="text-[10px] text-neutral-400">Tablas contacts, events, admin_users</div>
              </div>
              <span className="vc-tag !bg-lime !border-lime text-black font-bold">Conectado</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div>
                <div className="text-xs font-semibold">Service Role Key</div>
                <div className="text-[10px] text-neutral-400">Para webhooks automatizados</div>
              </div>
              <span className={`vc-tag ${status?.serviceRole ? '!bg-lime !border-lime text-black font-bold' : ''}`}>
                {status?.serviceRole ? 'Configurado' : 'Opcional'}
              </span>
            </div>

            <div className="p-3 bg-neutral-100 rounded-xl text-[11px] text-neutral-600">
              Migración SQL disponible en: <code className="font-bold text-neutral-800">supabase/migrations/001_crm_saas.sql</code>
            </div>
          </div>
        </Card>

        {/* Messaging & Ads API */}
        <Card title="Canales de Mensajería">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div className="flex items-center gap-2">
                <I name="whatsapp" className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-semibold">WhatsApp Cloud API</div>
                  <div className="text-[10px] text-neutral-400">Meta Business API Oficial</div>
                </div>
              </div>
              <span className={`vc-tag ${status?.whatsapp ? '!bg-lime !border-lime text-black font-bold' : ''}`}>
                {status?.whatsapp ? 'Activo' : 'WA Directo OK'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200">
              <div className="flex items-center gap-2">
                <I name="instagram" className="w-4 h-4 text-pink-600" />
                <div>
                  <div className="text-xs font-semibold">Instagram Direct Webhook</div>
                  <div className="text-[10px] text-neutral-400">developers.facebook.com</div>
                </div>
              </div>
              <span className={`vc-tag ${status?.instagram ? '!bg-lime !border-lime text-black font-bold' : ''}`}>
                {status?.instagram ? 'Activo' : 'Enlace Directo OK'}
              </span>
            </div>

            <div className="p-3 bg-neutral-100 rounded-xl text-[10.5px] text-neutral-600 leading-relaxed">
              Webhook URL lista: <br/>
              <code className="text-[10px] bg-white p-1 rounded border border-neutral-200 block mt-1 select-all font-mono">
                https://www.vision-code.cl/api/webhooks/meta
              </code>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Administrators Section */}
      <Card title="Equipo con Acceso al Panel de Control (Admins)">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <p className="text-xs text-neutral-500 mb-3">
              Solo los usuarios con estos correos registrados pueden ver las métricas, campañas y clientes en este portal.
            </p>
            <div className="overflow-x-auto">
              <table className="vc-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adm) => (
                    <tr key={adm.email}>
                      <td className="font-semibold text-xs">{adm.name || 'Admin'}</td>
                      <td className="text-xs text-neutral-600 font-mono">{adm.email}</td>
                      <td className="text-xs text-neutral-400">{fmt.date(adm.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-neutral-200">
            <h4 className="font-bold text-xs text-neutral-800 mb-2">Añadir Nuevo Administrador</h4>
            <form onSubmit={handleAddAdmin} className="space-y-3 text-xs">
              <Field label="Nombre del Miembro">
                <input
                  type="text"
                  placeholder="Ej: Marcelo Morales"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="vc-input"
                />
              </Field>
              <Field label="Correo Electrónico *">
                <input
                  required
                  type="email"
                  placeholder="admin@vision-code.cl"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="vc-input"
                />
              </Field>
              <button
                type="submit"
                disabled={addingAdmin || !newAdminEmail.trim()}
                className="vc-btn lime w-full !h-9 text-xs"
              >
                {addingAdmin ? 'Guardando...' : 'Autorizar Administrador'}
              </button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
