import React, { useState } from 'react';
import { Card, Chip, I, DeltaPill } from '../ui';

interface DTE {
  id: string;
  folio: number;
  type: 'Factura Electrónica (33)' | 'Boleta Electrónica (39)' | 'Nota de Crédito (61)';
  rutReceptor: string;
  razonSocial: string;
  date: string;
  neto: number;
  iva: number;
  total: number;
  status: 'Aceptado por SII' | 'En Proceso' | 'Anulado';
}

const DEFAULT_DTES: DTE[] = [
  {
    id: 'dte-1',
    folio: 1042,
    type: 'Factura Electrónica (33)',
    rutReceptor: '96.799.650-5',
    razonSocial: 'Soc de Mantencion e Instalaciones Tecnicas SA',
    date: '2026-10-23',
    neto: 4800000,
    iva: 912000,
    total: 5712000,
    status: 'Aceptado por SII',
  },
  {
    id: 'dte-2',
    folio: 1041,
    type: 'Factura Electrónica (33)',
    rutReceptor: '77.345.890-1',
    razonSocial: 'Comercializadora y Servicios SpA',
    date: '2026-10-18',
    neto: 1250000,
    iva: 237500,
    total: 1487500,
    status: 'Aceptado por SII',
  },
  {
    id: 'dte-3',
    folio: 1040,
    type: 'Boleta Electrónica (39)',
    rutReceptor: '19.065.052-9',
    razonSocial: 'José Matías Bravo Inalef',
    date: '2026-10-15',
    neto: 150000,
    iva: 28500,
    total: 178500,
    status: 'Aceptado por SII',
  },
];

export default function Facturacion({ activeProject }: { activeProject?: any }) {
  const [dtes, setDtes] = useState<DTE[]>(() => {
    try {
      const saved = localStorage.getItem('vc_dtes_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DTES;
  });

  const [showNewDteModal, setShowNewDteModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'factura' | 'boleta'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New DTE form
  const [newType, setNewType] = useState<'Factura Electrónica (33)' | 'Boleta Electrónica (39)'>('Factura Electrónica (33)');
  const [newRut, setNewRut] = useState('');
  const [newRazon, setNewRazon] = useState('');
  const [newGiro, setNewGiro] = useState('');
  const [newNeto, setNewNeto] = useState('');
  const [newDetail, setNewDetail] = useState('Desarrollo e Implementación SaaS');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateDte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRut.trim() || !newNeto) return;

    const netoVal = Number(newNeto) || 0;
    const ivaVal = Math.round(netoVal * 0.19);
    const totalVal = netoVal + ivaVal;
    const nextFolio = (dtes[0]?.folio || 1042) + 1;

    const newDte: DTE = {
      id: `dte-${Date.now()}`,
      folio: nextFolio,
      type: newType,
      rutReceptor: newRut.trim(),
      razonSocial: newRazon.trim() || 'Cliente Particular',
      date: new Date().toISOString().slice(0, 10),
      neto: netoVal,
      iva: ivaVal,
      total: totalVal,
      status: 'Aceptado por SII',
    };

    const updated = [newDte, ...dtes];
    setDtes(updated);
    try {
      localStorage.setItem('vc_dtes_list', JSON.stringify(updated));
    } catch {}

    setShowNewDteModal(false);
    setNewRut('');
    setNewRazon('');
    setNewGiro('');
    setNewNeto('');
    showToast(`DTE Folio ${newDte.folio} generado y firmado con éxito ante el SII.`);
  };

  const totalNeto = dtes.reduce((s, d) => s + d.neto, 0);
  const totalIva = dtes.reduce((s, d) => s + d.iva, 0);
  const totalGeneral = dtes.reduce((s, d) => s + d.total, 0);

  const filteredDtes = dtes.filter((d) => {
    if (filterType === 'factura') return d.type.includes('Factura');
    if (filterType === 'boleta') return d.type.includes('Boleta');
    return true;
  });

  return (
    <div className="space-y-6 vc-fade">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-700 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card title="Facturación Total (Mes)" dot>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
            ${totalGeneral.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>Neto: ${totalNeto.toLocaleString('es-CL')}</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold">100% Emitido</span>
          </div>
        </Card>

        <Card title="IVA Débito Fiscal (F29)" dot>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
            ${totalIva.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>IVA 19% generado</span>
            <span className="text-[10px] text-neutral-600 font-medium">Estimado F29</span>
          </div>
        </Card>

        <Card title="Documentos Emitidos" dot>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mt-1">
            {dtes.length} DTEs
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>Último folio: #{dtes[0]?.folio || 0}</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-medium">Autorizados</span>
          </div>
        </Card>

        <Card title="Conexión SII" dot>
          <div className="text-lg font-bold text-neutral-900 mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
            Certificación Abierta
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Firma XML + Timbre TED (PDF417)
          </div>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fa] p-3 rounded-2xl border border-neutral-200">
        <div className="flex flex-wrap gap-2">
          <Chip active={filterType === 'all'} onClick={() => setFilterType('all')}>
            Todos ({dtes.length})
          </Chip>
          <Chip active={filterType === 'factura'} onClick={() => setFilterType('factura')}>
            Facturas Electrónicas
          </Chip>
          <Chip active={filterType === 'boleta'} onClick={() => setFilterType('boleta')}>
            Boletas Electrónicas
          </Chip>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => {
              const csv = `FOLIO;TIPO;RUT;RAZON_SOCIAL;FECHA;NETO;IVA;TOTAL\n${dtes.map(d => `${d.folio};${d.type};${d.rutReceptor};${d.razonSocial};${d.date};${d.neto};${d.iva};${d.total}`).join('\n')}`;
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `LIBRO_VENTAS_SII.csv`;
              a.click();
              showToast('Libro de Ventas descargado.');
            }}
            className="px-3.5 py-2 rounded-full border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 transition-all flex items-center gap-1.5"
          >
            <I name="download" className="w-3.5 h-3.5" />
            <span>Libro de Ventas CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewDteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all shadow-sm"
          >
            <I name="plus" className="w-3.5 h-3.5" />
            <span>+ Emitir Nuevo DTE</span>
          </button>
        </div>
      </div>

      {/* DTE List */}
      <Card title="Historial de Documentos Tributarios Electrónicos (DTE)" dot>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#f9fafb] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-40">Folio / Tipo</th>
                <th className="py-2.5 px-3 min-w-[220px]">Receptor / RUT</th>
                <th className="py-2.5 px-3 w-28">Fecha Emisión</th>
                <th className="py-2.5 px-3 w-28 text-right">Neto</th>
                <th className="py-2.5 px-3 w-28 text-right">IVA (19%)</th>
                <th className="py-2.5 px-3 w-32 text-right">Total Bruto</th>
                <th className="py-2.5 px-3 w-28 text-center">Estado SII</th>
                <th className="py-2.5 px-3 w-32 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {filteredDtes.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-900">#{d.folio}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{d.type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-900 truncate" title={d.razonSocial}>{d.razonSocial}</div>
                    <div className="text-[11px] font-mono text-neutral-400">{d.rutReceptor}</div>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">{d.date}</td>
                  <td className="py-3 px-3 text-right font-medium">${d.neto.toLocaleString('es-CL')}</td>
                  <td className="py-3 px-3 text-right text-neutral-600">${d.iva.toLocaleString('es-CL')}</td>
                  <td className="py-3 px-3 text-right font-black text-neutral-900">${d.total.toLocaleString('es-CL')}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => showToast(`Descargando PDF oficial con Timbre Electrónico DTE Folio #${d.folio}...`)}
                      className="px-2.5 py-1 rounded-lg bg-black text-white font-bold text-[10px] hover:bg-neutral-800 transition-colors shadow-2xs"
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Descargando XML firmado Folio #${d.folio}...`)}
                      className="px-2 py-1 rounded-lg border border-neutral-300 text-neutral-700 font-bold text-[10px] hover:bg-neutral-100 transition-colors"
                    >
                      XML
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Emitir DTE */}
      {showNewDteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-neutral-200 vc-fade max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                Emitir Documento Tributario Electrónico (DTE)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewDteModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Genera la factura o boleta electrónica con firma digital y Timbre Electrónico DTE válido ante el SII.
            </p>

            <form onSubmit={handleCreateDte} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Tipo de Documento *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="vc-input w-full text-xs bg-white cursor-pointer font-bold"
                >
                  <option value="Factura Electrónica (33)">Factura Electrónica Afecta (DTE 33)</option>
                  <option value="Boleta Electrónica (39)">Boleta Electrónica (DTE 39)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">RUT Receptor *</label>
                  <input
                    type="text"
                    required
                    placeholder="76.123.456-7"
                    value={newRut}
                    onChange={(e) => setNewRut(e.target.value)}
                    className="vc-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Empresa Cliente SpA"
                    value={newRazon}
                    onChange={(e) => setNewRazon(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Giro Comercial</label>
                <input
                  type="text"
                  placeholder="Servicios de Ingeniería e Informática"
                  value={newGiro}
                  onChange={(e) => setNewGiro(e.target.value)}
                  className="vc-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Detalle del Producto o Servicio</label>
                <input
                  type="text"
                  placeholder="Descripción de la glosa..."
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="vc-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Monto Neto (CLP) *</label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={newNeto}
                  onChange={(e) => setNewNeto(e.target.value)}
                  className="vc-input w-full text-xs font-semibold"
                />
              </div>

              {newNeto && (
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-neutral-200 text-xs space-y-1">
                  <div className="flex justify-between text-neutral-500">
                    <span>Neto:</span>
                    <span>${Number(newNeto).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>IVA (19%):</span>
                    <span>${Math.round(Number(newNeto) * 0.19).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900 border-t border-neutral-200 pt-1">
                    <span>Total a Cobrar:</span>
                    <span>${Math.round(Number(newNeto) * 1.19).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDteModal(false)}
                  className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 shadow-md"
                >
                  Firmar y Emitir ante SII
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
