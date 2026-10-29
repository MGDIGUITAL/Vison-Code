import React, { useEffect, useState } from 'react';
import { supabase, fmt, waLink, downloadCsv, STAGES, SOURCES, type Contact } from '../lib';
import { Card, I, Modal, Field, Empty, Skeleton } from '../ui';

export default function Crm() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setContacts(data as Contact[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
    const ch = supabase
      .channel('crm_contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchContacts();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (!activeContact?.id) {
      setActivities([]);
      return;
    }
    supabase
      .from('lead_activities')
      .select('*')
      .eq('contact_id', activeContact.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setActivities(data || []));
  }, [activeContact?.id]);

  const updateContactStage = async (id: string, stage: string) => {
    const prev = contacts.find(c => c.id === id);
    setContacts(contacts.map(c => c.id === id ? { ...c, stage } : c));
    if (activeContact?.id === id) setActiveContact(prev => prev ? { ...prev, stage } : null);

    const { error } = await supabase.from('contacts').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      await supabase.from('lead_activities').insert({
        contact_id: id,
        type: 'cambio_etapa',
        body: `Cambio de etapa: ${prev?.stage || 'nuevo'} ➔ ${stage}`,
      });
    }
  };

  const updateContactValue = async (id: string, value: number) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, value } : c));
    if (activeContact?.id === id) setActiveContact(prev => prev ? { ...prev, value } : null);
    await supabase.from('contacts').update({ value, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact?.id || !newNote.trim()) return;
    setSavingNote(true);
    const { data, error } = await supabase.from('lead_activities').insert({
      contact_id: activeContact.id,
      type: 'nota',
      body: newNote.trim(),
    }).select().single();
    setSavingNote(false);
    if (!error && data) {
      setActivities([data, ...activities]);
      setNewNote('');
    }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (c.name?.toLowerCase().includes(q)) ||
      (c.company?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.phone?.toLowerCase().includes(q)) ||
      (c.plan?.toLowerCase().includes(q));
    const matchStage = selectedStage === 'all' || (c.stage || 'nuevo') === selectedStage;
    return matchSearch && matchStage;
  });

  const totalValue = filtered.reduce((s, c) => s + Number(c.value || 0), 0);
  const wonValue = filtered.filter(c => c.stage === 'ganado').reduce((s, c) => s + Number(c.value || 0), 0);

  const exportData = () => {
    const rows = filtered.map(c => ({
      ID: c.id,
      Fecha: c.created_at,
      Nombre: c.name || '',
      Empresa: c.company || '',
      Email: c.email || '',
      Telefono: c.phone || '',
      Servicio: c.plan || '',
      Etapa: c.stage || 'nuevo',
      Valor_CLP: c.value || 0,
      Origen: c.source || 'web',
      Campana: c.utm_campaign || '',
      Medio: c.utm_medium || '',
      Fuente: c.utm_source || '',
      Mensaje: c.message || '',
    }));
    downloadCsv(`visioncode-leads-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f6f7] p-3 rounded-2xl border border-neutral-200">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <I name="search" className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por cliente, empresa, teléfono o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vc-input !pl-10 !py-2 text-xs"
            />
          </div>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="vc-select !py-2 text-xs w-36"
          >
            <option value="all">Todas las etapas</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-full p-1 border border-neutral-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-full ${viewMode === 'kanban' ? 'bg-lime text-black font-semibold' : 'text-neutral-500'}`}
              title="Vista Kanban"
            >
              <I name="grid" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-lime text-black font-semibold' : 'text-neutral-500'}`}
              title="Vista Lista"
            >
              <I name="menu" className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={exportData} className="vc-btn ghost !h-9 text-xs" title="Exportar CSV">
            <I name="download" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button onClick={() => setIsNewModalOpen(true)} className="vc-btn lime !h-9 text-xs">
            <I name="plus" className="w-3.5 h-3.5" />
            <span>Nuevo Lead</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="vc-card !py-3">
          <div className="text-[10.5px] uppercase tracking-wide text-neutral-500">Total Leads</div>
          <div className="text-2xl font-medium tracking-tight mt-0.5">{filtered.length}</div>
        </div>
        <div className="vc-card !py-3">
          <div className="text-[10.5px] uppercase tracking-wide text-neutral-500">Pipeline Activo</div>
          <div className="text-2xl font-medium tracking-tight mt-0.5">{fmt.money(totalValue)}</div>
        </div>
        <div className="vc-card !py-3 !bg-lime-soft">
          <div className="text-[10.5px] uppercase tracking-wide text-neutral-600">Cerrado Ganado</div>
          <div className="text-2xl font-medium tracking-tight mt-0.5">{fmt.money(wonValue)}</div>
        </div>
        <div className="vc-card !py-3">
          <div className="text-[10.5px] uppercase tracking-wide text-neutral-500">Tasa de Cierre</div>
          <div className="text-2xl font-medium tracking-tight mt-0.5">
            {filtered.length ? fmt.pct((filtered.filter(c => c.stage === 'ganado').length / filtered.length) * 100) : '0%'}
          </div>
        </div>
      </div>

      {/* Main Content Area: Kanban or List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {STAGES.map(s => <Skeleton key={s.id} className="h-96 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="No hay leads coincidentes" icon="users">
          No se encontraron contactos con los filtros actuales. Crea un nuevo lead o ajusta la búsqueda.
        </Empty>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 overflow-x-auto pb-4 items-start">
          {STAGES.map(stage => {
            const stageLeads = filtered.filter(c => (c.stage || 'nuevo') === stage.id);
            const stageTotal = stageLeads.reduce((s, c) => s + Number(c.value || 0), 0);
            return (
              <div
                key={stage.id}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  const leadId = e.dataTransfer.getData('text/plain');
                  if (leadId) updateContactStage(leadId, stage.id);
                }}
                className="bg-[#f5f6f7] rounded-2xl p-3 border border-neutral-200/80 min-h-[500px] flex flex-col transition-all"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold text-neutral-800">{stage.label}</span>
                    <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-full border border-neutral-200 text-neutral-500 font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">{fmt.compact(stageTotal)}</span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2 flex-1">
                  {stageLeads.map(lead => {
                    const wa = waLink(lead.phone, `Hola ${lead.name || ''}, te contacto de Vision Code sobre tu cotización.`);
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
                        onClick={() => setActiveContact(lead)}
                        className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm hover:border-neutral-400 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-black line-clamp-1">
                            {lead.name || 'Sin nombre'}
                          </h4>
                          {lead.value ? (
                            <span className="text-[11px] font-semibold text-neutral-800 shrink-0">
                              {fmt.compact(lead.value)}
                            </span>
                          ) : null}
                        </div>

                        {lead.company && (
                          <div className="text-[10.5px] text-neutral-500 truncate mt-0.5">
                            {lead.company}
                          </div>
                        )}

                        {lead.plan && (
                          <div className="text-[10px] text-neutral-600 bg-neutral-100 rounded px-1.5 py-0.5 mt-2 line-clamp-1 inline-block">
                            {lead.plan}
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                          <span className="vc-tag !text-[9.5px] !py-0.5 !px-1.5">
                            {SOURCES[lead.source || 'web'] || lead.source}
                          </span>
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {wa && (
                              <a href={wa} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:scale-110 transition-transform" title="Abrir WhatsApp">
                                <I name="whatsapp" className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <span>{fmt.ago(lead.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vc-table">
              <thead>
                <tr>
                  <th>Cliente / Empresa</th>
                  <th>Contacto</th>
                  <th>Servicio Interesado</th>
                  <th>Valor Estimado</th>
                  <th>Origen / Campaña</th>
                  <th>Etapa</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const st = STAGES.find(s => s.id === (lead.stage || 'nuevo'));
                  const wa = waLink(lead.phone, `Hola ${lead.name || ''}, te contacto de Vision Code.`);
                  return (
                    <tr key={lead.id} className="cursor-pointer" onClick={() => setActiveContact(lead)}>
                      <td>
                        <div className="font-semibold text-xs text-neutral-900">{lead.name || 'Sin nombre'}</div>
                        <div className="text-[11px] text-neutral-400">{lead.company || '—'}</div>
                      </td>
                      <td>
                        <div className="text-[11.5px] text-neutral-700">{lead.email || '—'}</div>
                        <div className="text-[10.5px] text-neutral-400">{lead.phone || '—'}</div>
                      </td>
                      <td className="max-w-[200px] truncate text-xs text-neutral-600">{lead.plan || '—'}</td>
                      <td className="font-semibold text-xs">{lead.value ? fmt.money(lead.value) : '—'}</td>
                      <td>
                        <span className="vc-tag">
                          {SOURCES[lead.source || 'web'] || lead.source}
                          {lead.utm_campaign ? ` · ${lead.utm_campaign}` : ''}
                        </span>
                      </td>
                      <td>
                        <select
                          value={lead.stage || 'nuevo'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateContactStage(lead.id, e.target.value)}
                          className="vc-select !py-1 !px-2 text-xs font-semibold"
                          style={{ backgroundColor: st?.color || '#eee' }}
                        >
                          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" className="vc-icon-btn !w-8 !h-8 text-emerald-600" title="WhatsApp">
                              <I name="whatsapp" className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="vc-icon-btn !w-8 !h-8" title="Enviar Email">
                              <I name="mail" className="w-3.5 h-3.5" />
                            </a>
                          )}
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

      {/* Modal: Lead Details & Activity Log */}
      <Modal
        open={Boolean(activeContact)}
        onClose={() => setActiveContact(null)}
        title={activeContact?.name ? `Lead: ${activeContact.name}` : 'Detalles del Lead'}
        wide
      >
        {activeContact && (
          <div className="space-y-5 text-xs">
            {/* Top Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">Empresa</span>
                <span className="font-semibold text-sm text-neutral-800">{activeContact.company || 'No especificada'}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">Teléfono</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-neutral-800">{activeContact.phone || '—'}</span>
                  {activeContact.phone && (
                    <a
                      href={waLink(activeContact.phone, `Hola ${activeContact.name || ''}, te contacto de Vision Code.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <I name="whatsapp" className="w-3 h-3" /> WA
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">Correo Electrónico</span>
                <span className="font-semibold text-neutral-800 truncate block mt-0.5">{activeContact.email || '—'}</span>
              </div>
            </div>

            {/* Stage and Value row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Etapa en el Pipeline">
                <select
                  value={activeContact.stage || 'nuevo'}
                  onChange={(e) => updateContactStage(activeContact.id, e.target.value)}
                  className="vc-select"
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>

              <Field label="Valor estimado del trato (CLP)">
                <input
                  type="number"
                  value={activeContact.value || 0}
                  onChange={(e) => updateContactValue(activeContact.id, Number(e.target.value))}
                  placeholder="Ej: 850000"
                  className="vc-input"
                />
              </Field>
            </div>

            {/* Full Message/Details */}
            {activeContact.message && (
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block mb-1">
                  Requerimiento / Mensaje original
                </span>
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {activeContact.message}
                </p>
              </div>
            )}

            {/* Marketing Attribution Card */}
            <div className="p-3 bg-lime-soft/40 rounded-xl border border-lime/30 text-[11px]">
              <span className="font-bold text-neutral-800 block mb-1">Atribución de Marketing y Campañas</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-600">
                <div><b>Canal:</b> {SOURCES[activeContact.source || 'web'] || activeContact.source}</div>
                <div><b>Campaña:</b> {activeContact.utm_campaign || 'Orgánico / Ninguna'}</div>
                <div><b>Medio:</b> {activeContact.utm_medium || '—'}</div>
                <div><b>Meta fbclid:</b> {activeContact.fbclid ? 'Registrado' : '—'}</div>
              </div>
            </div>

            {/* Activity History & Notes */}
            <div className="border-t border-neutral-200 pt-4">
              <h4 className="font-bold text-neutral-800 mb-2 flex items-center justify-between">
                <span>Bitácora de Seguimiento ({activities.length})</span>
                <span className="text-[10px] text-neutral-400 font-normal">Notas internas y cambios de etapa</span>
              </h4>

              <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Escribe una nota interna sobre esta llamada o reunión..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="vc-input flex-1"
                />
                <button type="submit" disabled={savingNote || !newNote.trim()} className="vc-btn lime !h-10 text-xs shrink-0">
                  {savingNote ? 'Guardando...' : 'Añadir Nota'}
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-neutral-400 italic text-center py-3">Aún no hay notas registradas para este lead.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-neutral-800">{act.body}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{act.type} · {fmt.dateTime(act.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Create Lead Manually */}
      <CreateLeadModal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={() => { setIsNewModalOpen(false); fetchContacts(); }}
      />
    </div>
  );
}

function CreateLeadModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    plan: 'Desarrollo Web & Plataforma',
    value: 0,
    source: 'manual',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('contacts').insert([{
      name: form.name.trim(),
      company: form.company.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      plan: form.plan,
      value: Number(form.value) || 0,
      source: form.source,
      message: form.notes.trim() || 'Ingresado manualmente desde el CRM',
      stage: 'nuevo',
      status: 'new',
    }]);
    setLoading(false);
    if (!error) {
      onCreated();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Ingresar Nuevo Lead Manual">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <Field label="Nombre del Cliente *">
          <input
            required
            type="text"
            placeholder="Ej: Marcelo Morales"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="vc-input"
          />
        </Field>
        <Field label="Empresa / Negocio">
          <input
            type="text"
            placeholder="Ej: Inmobiliaria Andes"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="vc-input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Teléfono / WhatsApp">
            <input
              type="text"
              placeholder="+56 9 1234 5678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="vc-input"
            />
          </Field>
          <Field label="Correo Electrónico">
            <input
              type="email"
              placeholder="cliente@empresa.cl"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="vc-input"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Servicio de Interés">
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="vc-select"
            >
              <option value="Desarrollo Web & Plataforma">Desarrollo Web & Plataforma</option>
              <option value="E-Commerce de Alto Rendimiento">E-Commerce de Alto Rendimiento</option>
              <option value="Agente de IA y Automatización WhatsApp">Agente de IA y WhatsApp</option>
              <option value="Campaña Meta Ads + CRM">Campaña Meta Ads + CRM</option>
              <option value="Consultoría / Auditoría">Consultoría / Auditoría</option>
            </select>
          </Field>
          <Field label="Valor Estimado (CLP)">
            <input
              type="number"
              placeholder="850000"
              value={form.value || ''}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="vc-input"
            />
          </Field>
        </div>
        <Field label="Canal de Origen">
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="vc-select"
          >
            <option value="manual">Ingreso Manual / En Persona</option>
            <option value="whatsapp">WhatsApp Directo</option>
            <option value="instagram">Instagram DM</option>
            <option value="referido">Referido / Recomendación</option>
            <option value="llamada">Llamada Telefónica</option>
          </select>
        </Field>
        <Field label="Notas iniciales">
          <textarea
            placeholder="Detalles sobre lo que necesita, presupuesto conversado o fecha límite..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="vc-textarea"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="vc-btn ghost">Cancelar</button>
          <button type="submit" disabled={loading} className="vc-btn lime">
            {loading ? 'Creando...' : 'Crear Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
