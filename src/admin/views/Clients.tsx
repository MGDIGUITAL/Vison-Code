import React, { useEffect, useState } from 'react';
import { authFetch, fmt, waLink, downloadCsv } from '../lib';
import { Card, I, Chip } from '../ui';
import type { ActiveClient } from '../../pages/api/admin/clients';

export default function Clients() {
  const [clients, setClients] = useState<ActiveClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [editingClient, setEditingClient] = useState<ActiveClient | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/clients');
      const data = await res.json();
      if (data.ok && Array.isArray(data.clients)) {
        setClients(data.clients);
        localStorage.setItem('vc_active_clients', JSON.stringify(data.clients));
      } else {
        const saved = localStorage.getItem('vc_active_clients');
        if (saved) setClients(JSON.parse(saved));
      }
    } catch {
      const saved = localStorage.getItem('vc_active_clients');
      if (saved) setClients(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSaveClient = async (clientData: ActiveClient) => {
    setSaving(true);
    try {
      const updated = clients.map(c => c.id === clientData.id ? clientData : c);
      if (!clients.some(c => c.id === clientData.id)) {
        updated.unshift(clientData);
      }
      setClients(updated);
      localStorage.setItem('vc_active_clients', JSON.stringify(updated));

      await authFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({ client: clientData })
      });
    } catch {}
    finally {
      setSaving(false);
      setEditingClient(null);
      setIsNewModalOpen(false);
    }
  };

  // Quick inline status change without opening modal
  const handleQuickStatusChange = (client: ActiveClient, newStatus: ActiveClient['status']) => {
    const updated: ActiveClient = {
      ...client,
      status: newStatus,
      paymentStatus: newStatus === 'por_renovar' ? 'por_renovar' : newStatus === 'pausado' ? 'pendiente' : client.paymentStatus
    };
    handleSaveClient(updated);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('¿Deseas eliminar este cliente de la cartera activa?')) return;
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('vc_active_clients', JSON.stringify(updated));
    try {
      await authFetch('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id })
      });
    } catch {}
  };

  // Helper: check renewal status and countdown
  const getRenewalInfo = (c: ActiveClient) => {
    if (c.type !== 'suscripcion' || !c.nextBillingDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(c.nextBillingDate + 'T00:00:00');
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      dateFormatted: c.nextBillingDate,
      diffDays,
      isDueSoon: diffDays >= 0 && diffDays <= 7,
      isOverdue: diffDays < 0,
    };
  };

  const filtered = clients.filter(c => {
    const renewal = getRenewalInfo(c);

    // Specific filters requested: activo, inactivo, por renovar
    let matchFilter = true;
    if (filterStatus === 'activo') {
      matchFilter = c.status === 'activo';
    } else if (filterStatus === 'por_renovar') {
      matchFilter = c.status === 'por_renovar' || c.paymentStatus === 'por_renovar' || (renewal !== null && (renewal.isDueSoon || renewal.isOverdue));
    } else if (filterStatus === 'inactivo') {
      matchFilter = c.status === 'pausado' || c.status === 'finalizado';
    } else if (filterStatus === 'en_desarrollo') {
      matchFilter = c.status === 'en_desarrollo';
    } else if (filterStatus === 'suscripcion') {
      matchFilter = c.type === 'suscripcion';
    } else if (filterStatus === 'pago_unico') {
      matchFilter = c.type === 'pago_unico';
    } else if (filterStatus === 'pendiente') {
      matchFilter = c.paymentStatus === 'pendiente';
    }

    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      (c.rut && c.rut.toLowerCase().includes(q)) ||
      c.servicePlan.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  const mrrTotal = clients
    .filter(c => (c.status === 'activo' || c.status === 'por_renovar') && c.type === 'suscripcion')
    .reduce((sum, c) => sum + (c.mrr || 0), 0);

  const activeCount = clients.filter(c => c.status === 'activo').length;
  const renewalCount = clients.filter(c => {
    const r = getRenewalInfo(c);
    return c.status === 'por_renovar' || (r && (r.isDueSoon || r.isOverdue));
  }).length;
  const inDevCount = clients.filter(c => c.status === 'en_desarrollo').length;
  const inactiveCount = clients.filter(c => c.status === 'pausado' || c.status === 'finalizado').length;

  return (
    <div className="space-y-6 vc-fade pb-20">
      {/* ── FILA 1: TARJETAS DE MÉTRICAS (Espaciado Prolijo, Sin Desbordes) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Clientes Activos" action={<span className="vc-tag">Operando</span>}>
          <div className="pt-1">
            <div className="text-[34px] leading-none font-medium tracking-tight text-neutral-900">{activeCount}</div>
            <div className="mt-2 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Servicios en Operación Normal</div>
            <div className="mt-1 text-[11px] text-neutral-400">Total registrados: {clients.length} cuentas</div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px]">En Desarrollo Activo:</span>
            <span className="font-bold text-neutral-800">{inDevCount} proyectos</span>
          </div>
        </Card>

        <Card title="Por Renovar / Cobranza" action={
          <span className={`vc-tag ${renewalCount > 0 ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold' : ''}`}>
            {renewalCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <I name="bell" className="w-3 h-3" strokeWidth={2.2} />
                <span>{renewalCount} Alertas</span>
              </span>
            ) : 'Al Día'}
          </span>
        }>
          <div className="pt-1">
            <div className="text-[34px] leading-none font-medium tracking-tight text-neutral-900">{renewalCount}</div>
            <div className="mt-2 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Vencimientos Próximos (7 días)</div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium">Requieren cobro o confirmación</div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px]">Pausados / Inactivos:</span>
            <span className="font-bold text-neutral-700">{inactiveCount} cuentas</span>
          </div>
        </Card>

        <Card title="Ingreso Recurrente MRR" action={<span className="vc-tag bg-lime/40 border-lime/60 text-neutral-900 font-bold">Mensual</span>}>
          <div className="pt-1">
            <div className="text-[32px] leading-none font-medium tracking-tight text-neutral-900">${fmt.n(mrrTotal)}</div>
            <div className="mt-2 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Facturación Mensual por Suscripción</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-semibold">CLP / Mes Activo</div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px]">Ticket Promedio MRR:</span>
            <span className="font-bold text-neutral-800">
              ${fmt.n(activeCount > 0 ? Math.round(mrrTotal / Math.max(clients.filter(c => c.type === 'suscripcion').length, 1)) : 0)} CLP
            </span>
          </div>
        </Card>

        <Card title="Salud de Cartera" action={<button onClick={() => downloadCsv('cartera_clientes_vc.csv', clients as any)} className="text-[10.5px] font-bold text-neutral-600 hover:text-black underline">Exportar CSV</button>}>
          <div className="pt-1">
            <div className="text-[34px] leading-none font-medium tracking-tight text-neutral-900">
              {clients.filter(c => c.paymentStatus === 'al_dia' || c.paymentStatus === 'pagado').length} / {clients.length}
            </div>
            <div className="mt-2 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Cuentas con Pagos al Día</div>
            <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Cartera formalizada activa</div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
            <span className="text-neutral-500 text-[11px]">Estado General:</span>
            <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
              <I name="check" className="w-3.5 h-3.5" strokeWidth={2.4} />
              <span>Operación Normal</span>
            </span>
          </div>
        </Card>
      </div>

      {/* ── FILA 2: BARRA SISTEMÁTICA CON TODOS LOS FILTROS SOLICITADOS (Iconos SVG Profesionales) ── */}
      <Card title="Cartera de Clientes &amp; Suscripciones" action={
        <div className="flex items-center gap-2">
          {/* Toggle Grid vs Table */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-full p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-full text-xs transition-colors ${viewLayout === 'grid' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-black'}`}
              title="Vista de Tarjetas Sistemáticas"
            >
              <I name="grid" className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-full text-xs transition-colors ${viewLayout === 'table' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-black'}`}
              title="Vista de Tabla Detallada"
            >
              <I name="menu" className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="vc-btn plain !h-8 text-xs font-bold bg-lime text-neutral-900 hover:bg-lime/80 flex items-center gap-1.5 shadow-xs"
          >
            <I name="plus" className="w-3.5 h-3.5" />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      }>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-1">
          {/* Filtros solicitados: Activos, Inactivos, Por Renovar, etc. con ICONOS PROFESIONALES */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'activo', label: 'Activos', icon: 'check' as const, count: activeCount },
              { id: 'por_renovar', label: 'Por Renovar', icon: 'bell' as const, count: renewalCount },
              { id: 'inactivo', label: 'Inactivos', icon: 'pause' as const, count: inactiveCount },
              { id: 'en_desarrollo', label: 'En Desarrollo', icon: 'clock' as const, count: inDevCount },
              { id: 'suscripcion', label: 'Solo Suscripciones', icon: 'refresh' as const },
              { id: 'pago_unico', label: 'Proyectos Únicos', icon: 'box' as const },
            ].map(tab => (
              <Chip
                key={tab.id}
                active={filterStatus === tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className="flex items-center gap-1.5 shrink-0"
              >
                {tab.icon && (
                  <I name={tab.icon} className="w-3.5 h-3.5" strokeWidth={2.2} />
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    filterStatus === tab.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </Chip>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-64">
            <input
              type="text"
              placeholder="Buscar empresa, RUT o titular..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vc-input !py-2 !pl-8 text-xs w-full bg-white"
            />
            <span className="absolute left-2.5 top-2.5 text-neutral-400">
              <I name="search" className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>

      {/* ── FILA 3: GRID DE CLIENTES (Compacto, Prolijo, Sin Espacios Vacíos) ── */}
      {viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => {
            const renewal = getRenewalInfo(client);
            const domainUrl = client.domain
              ? (client.domain.startsWith('http') ? client.domain : `https://${client.domain}`)
              : null;

            // WhatsApp contextual text
            const waText = client.status === 'por_renovar' || (renewal && renewal.isDueSoon)
              ? `Hola ${client.name}, te escribimos desde Vision Code para recordarte que tu ${client.servicePlan} tiene fecha de renovación el ${client.nextBillingDate}. Te dejamos los datos de pago para mantener tu plataforma 100% activa.`
              : `Hola ${client.name}, te escribimos desde Vision Code para saber cómo va todo con tu servicio (${client.servicePlan}).`;
            const wa = waLink(client.phone, waText);

            return (
              <div
                key={client.id}
                className="bg-white rounded-[22px] border border-neutral-200/90 p-5 shadow-xs hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar + Empresa + Selector Rápido de Estado */}
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 text-lime flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        {client.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13.5px] font-bold text-neutral-900 truncate leading-snug">
                          {client.company}
                        </h4>
                        <div className="text-[10.5px] text-neutral-400 font-mono">
                          {client.rut ? `RUT: ${client.rut}` : 'Particular'}
                        </div>
                      </div>
                    </div>

                    {/* Selector de Estado Rápido (Activo / Por Renovar / Pausado) */}
                    <select
                      value={client.status}
                      onChange={(e) => handleQuickStatusChange(client, e.target.value as any)}
                      className={`text-[9.5px] font-black uppercase rounded-full px-2.5 py-1 border cursor-pointer outline-none transition-colors ${
                        client.status === 'activo'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : client.status === 'por_renovar'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : client.status === 'en_desarrollo'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      <option value="activo">Activo</option>
                      <option value="por_renovar">Por Renovar</option>
                      <option value="en_desarrollo">En Desarrollo</option>
                      <option value="pausado">Pausado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  {/* Plan & Financial Box */}
                  <div className="p-3 rounded-xl bg-[#f5f6f7] border border-neutral-200/60 mb-3">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{client.type === 'suscripcion' ? 'Suscripción' : 'Proyecto Único'}</span>
                        {client.type === 'suscripcion' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                            {client.billingCycle ? client.billingCycle.toUpperCase() : 'MENSUAL'}
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-neutral-700 inline-flex items-center gap-1">
                        {client.paymentStatus === 'al_dia' ? (
                          <>
                            <I name="check" className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                            <span>Pago al Día</span>
                          </>
                        ) : client.paymentStatus === 'por_renovar' ? (
                          <>
                            <I name="bell" className="w-3 h-3 text-amber-600" />
                            <span>Por Renovar</span>
                          </>
                        ) : (
                          <>
                            <I name="clock" className="w-3 h-3 text-neutral-500" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-xs font-black text-neutral-900 truncate mb-1.5">
                      {client.servicePlan}
                    </div>

                    <div className="flex items-baseline justify-between pt-1.5 border-t border-neutral-200/60">
                      <span className="text-sm font-black text-neutral-900">
                        ${fmt.n(client.mrr)} <span className="text-[10px] font-bold text-neutral-500">{client.type === 'suscripcion' ? 'CLP/mes' : 'CLP'}</span>
                      </span>

                      {/* Alerta de Renovación */}
                      {renewal && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          renewal.isOverdue
                            ? 'bg-red-100 text-red-800'
                            : renewal.isDueSoon
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-white text-neutral-600 border border-neutral-200'
                        }`}>
                          {renewal.isOverdue ? (
                            <>
                              <I name="alertTriangle" className="w-3 h-3 text-red-700" strokeWidth={2.2} />
                              <span>Vencido ({renewal.dateFormatted})</span>
                            </>
                          ) : renewal.isDueSoon ? (
                            <>
                              <I name="bell" className="w-3 h-3 text-amber-700" strokeWidth={2.2} />
                              <span>Vence en {renewal.diffDays}d</span>
                            </>
                          ) : (
                            <>
                              <I name="calendar" className="w-3 h-3 text-neutral-500" />
                              <span>Próx: {renewal.dateFormatted}</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Titular de la cuenta */}
                  <div className="space-y-0.5 text-xs text-neutral-600 mb-3 px-0.5">
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-neutral-400">Titular:</span>
                      <span className="font-bold text-neutral-800 truncate">{client.name}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span className="text-neutral-400">Fono:</span>
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* ── BOTÓN DIRECTO PARA ABRIR SITIO WEB (Toca y abre en nueva pestaña) ── */}
                  <div className="mb-3.5">
                    {domainUrl ? (
                      <a
                        href={domainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#f0f0f1] hover:bg-neutral-900 hover:text-white border border-neutral-200 hover:border-neutral-900 transition-all text-xs font-semibold group/web cursor-pointer shadow-xs"
                        title={`Toca para abrir la web de ${client.company}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-lime group-hover/web:animate-ping shrink-0" />
                          <span className="font-mono text-[11px] truncate text-neutral-700 group-hover/web:text-white">
                            {domainUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold shrink-0 flex items-center gap-1 text-neutral-500 group-hover/web:text-lime">
                          <span>Visitar Web</span>
                          <I name="arrowUpRight" className="w-3 h-3" />
                        </span>
                      </a>
                    ) : (
                      <div className="w-full px-3 py-2 rounded-xl bg-neutral-100 text-neutral-400 text-[11px] font-mono text-center">
                        Sin sitio web registrado
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: WhatsApp Directo + Editar */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          client.status === 'por_renovar'
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title={client.status === 'por_renovar' ? 'Enviar recordatorio de renovación por WhatsApp' : 'Abrir chat de WhatsApp'}
                      >
                        <I name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px]">{client.status === 'por_renovar' ? 'Recordar Pago' : 'WhatsApp'}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingClient(client)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-colors"
                    >
                      Editar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar cliente"
                  >
                    <I name="close" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── VISTA TABLA SISTEMÁTICA ── */
        <Card className="!p-0 overflow-hidden bg-white border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="vc-table">
              <thead>
                <tr>
                  <th className="!pl-5">Empresa / RUT</th>
                  <th>Titular &amp; Contacto</th>
                  <th>Servicio / Plan</th>
                  <th>Monto</th>
                  <th>Próx. Renovación</th>
                  <th>Sitio Web</th>
                  <th>Estado</th>
                  <th className="!pr-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => {
                  const renewal = getRenewalInfo(client);
                  const domainUrl = client.domain
                    ? (client.domain.startsWith('http') ? client.domain : `https://${client.domain}`)
                    : null;
                  const waText = client.status === 'por_renovar'
                    ? `Hola ${client.name}, te recordamos que tu plan ${client.servicePlan} vence pronto.`
                    : `Hola ${client.name}, te contactamos de Vision Code.`;
                  const wa = waLink(client.phone, waText);

                  return (
                    <tr key={client.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="!pl-5">
                        <div className="font-bold text-neutral-900 text-xs">{client.company}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{client.rut || 'Particular'}</div>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-neutral-800">{client.name}</div>
                        <div className="text-[10.5px] text-neutral-400">{client.phone || client.email}</div>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-neutral-800 block truncate max-w-[170px]">{client.servicePlan}</span>
                        <span className="text-[10px] text-neutral-400">
                          {client.type === 'suscripcion'
                            ? `Suscripción · ${client.billingCycle ? client.billingCycle.toUpperCase() : 'MENSUAL'}`
                            : 'Pago Único'}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs font-black text-neutral-900">${fmt.n(client.mrr)} CLP</div>
                        <div className="text-[10px] text-neutral-500">{client.type === 'suscripcion' ? '/ mes' : 'único'}</div>
                      </td>
                      <td>
                        {renewal ? (
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            renewal.isOverdue ? 'bg-red-100 text-red-800' : renewal.isDueSoon ? 'bg-amber-100 text-amber-900' : 'text-neutral-700'
                          }`}>
                            {renewal.dateFormatted} {renewal.isDueSoon && `(${renewal.diffDays}d)`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">—</span>
                        )}
                      </td>
                      <td>
                        {domainUrl ? (
                          <a
                            href={domainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f0f0f1] hover:bg-neutral-900 hover:text-white text-xs font-mono transition-colors text-neutral-700"
                            title="Toca para abrir el sitio web"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                            <span className="truncate max-w-[120px]">{domainUrl.replace(/^https?:\/\//, '')}</span>
                            <I name="arrowUpRight" className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-neutral-400 italic">Sin web</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={client.status}
                          onChange={(e) => handleQuickStatusChange(client, e.target.value as any)}
                          className="text-[9.5px] font-bold uppercase rounded-lg px-2 py-0.5 border bg-white"
                        >
                          <option value="activo">Activo</option>
                          <option value="por_renovar">Por Renovar</option>
                          <option value="en_desarrollo">En Desarrollo</option>
                          <option value="pausado">Pausado</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      </td>
                      <td className="!pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="Chat WhatsApp"
                            >
                              <I name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingClient(client)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white text-[11px] font-bold"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal para Crear / Editar Cliente */}
      {(editingClient || isNewModalOpen) && (
        <ClientModal
          client={editingClient || {
            id: `cli_${Date.now()}`,
            name: '',
            company: '',
            rut: '',
            email: '',
            phone: '',
            servicePlan: 'Plan VISION SCALE',
            type: 'suscripcion',
            mrr: 59990,
            status: 'activo',
            paymentStatus: 'al_dia',
            startDate: new Date().toISOString().slice(0, 10),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            domain: 'https://',
            notes: '',
            created_at: new Date().toISOString()
          }}
          isNew={isNewModalOpen}
          saving={saving}
          onClose={() => {
            setEditingClient(null);
            setIsNewModalOpen(false);
          }}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
}

function ClientModal({
  client,
  isNew,
  saving,
  onClose,
  onSave
}: {
  client: ActiveClient;
  isNew: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (c: ActiveClient) => void;
}) {
  const [formData, setFormData] = useState<ActiveClient>({ ...client });

  const handleChange = (field: keyof ActiveClient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto vc-fade">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-black text-neutral-900">
              {isNew ? 'Nuevo Cliente Activo' : `Editar: ${formData.company}`}
            </h3>
            <p className="text-xs text-neutral-500">
              Control de servicios contratados, facturación y fecha de renovación.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
          >
            <I name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Empresa / Razón Social *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Ej. Distribuidora Andes SpA"
                className="vc-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">RUT Empresa</label>
              <input
                type="text"
                value={formData.rut || ''}
                onChange={(e) => handleChange('rut', e.target.value)}
                placeholder="76.123.456-7"
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nombre Contacto *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="vc-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@empresa.cl"
                className="vc-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Sitio Web / Dominio</label>
              <input
                type="text"
                value={formData.domain || ''}
                onChange={(e) => handleChange('domain', e.target.value)}
                placeholder="https://empresa.cl"
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <span className="text-xs font-bold text-neutral-800">Servicio &amp; Facturación</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Plan / Servicio</label>
                <input
                  type="text"
                  required
                  value={formData.servicePlan}
                  onChange={(e) => handleChange('servicePlan', e.target.value)}
                  placeholder="Plan VISION SCALE"
                  className="vc-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Tipo de Facturación</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="vc-input w-full text-xs"
                >
                  <option value="suscripcion">Suscripción Recurrente</option>
                  <option value="pago_unico">Pago Único (Proyecto)</option>
                </select>
              </div>
              {formData.type === 'suscripcion' && (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-600 mb-1">Ciclo de Cobro</label>
                  <select
                    value={formData.billingCycle || 'mensual'}
                    onChange={(e) => handleChange('billingCycle', e.target.value)}
                    className="vc-input w-full text-xs font-semibold"
                  >
                    <option value="mensual">Mensual (1 mes)</option>
                    <option value="trimestral">Trimestral (3 meses)</option>
                    <option value="semestral">Semestral (6 meses)</option>
                    <option value="anual">Anual (12 meses)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Monto ($ CLP)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.mrr}
                  onChange={(e) => handleChange('mrr', parseFloat(e.target.value) || 0)}
                  className="vc-input w-full text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Estado del Cliente</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="vc-input w-full text-xs"
                >
                  <option value="activo">Activo</option>
                  <option value="por_renovar">Por Renovar</option>
                  <option value="en_desarrollo">En Desarrollo</option>
                  <option value="pausado">Pausado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Estado del Pago</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  className="vc-input w-full text-xs"
                >
                  <option value="al_dia">Al Día</option>
                  <option value="por_renovar">Por Renovar</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Próx. Renovación</label>
                <input
                  type="date"
                  value={formData.nextBillingDate || ''}
                  onChange={(e) => handleChange('nextBillingDate', e.target.value)}
                  className="vc-input w-full text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">Notas Internas</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Detalles del servidor, accesos, requerimientos..."
              className="vc-input w-full text-xs"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-lime text-neutral-900 hover:bg-lime/90"
            >
              {saving ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
