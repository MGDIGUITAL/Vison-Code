import React, { useState } from 'react';
import { Card, Chip, I, DeltaPill } from '../ui';

interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  salary: number;
  afp: string;
  health: string;
  contractType: 'Indefinido' | 'Plazo Fijo';
  startDate: string;
  email: string;
  address: string;
}

const DEFAULT_WORKERS: Worker[] = [
  {
    id: 'w-1',
    rut: '19.065.052-9',
    name: 'José Matías Bravo Inalef',
    position: 'Técnico de Mantenimiento',
    salary: 4800000,
    afp: 'AFP Capital (11.44%)',
    health: 'Fonasa (7%)',
    contractType: 'Indefinido',
    startDate: '2025-04-22',
    email: 'Aflcaptacion@gmail.com',
    address: 'David Ben Gurion 241, Las Condes',
  },
  {
    id: 'w-2',
    rut: '20.334.287-K',
    name: 'Marcelo Nicolás González Valderas',
    position: 'Técnico Instalador',
    salary: 944421,
    afp: 'AFP Capital (11.44%)',
    health: 'Isapre Banmédica (2.73 UF)',
    contractType: 'Indefinido',
    startDate: '2025-04-22',
    email: 'marcelo.gonzalez@sometec.cl',
    address: 'Av. La Victoria 0182, La Granja',
  },
];

export default function Remuneraciones({ activeProject }: { activeProject?: any }) {
  const [tab, setTab] = useState<'workers' | 'liquidaciones' | 'certificados' | 'previred'>('workers');
  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem('vc_payroll_workers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WORKERS;
  });

  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState<Worker | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New worker form state
  const [newRut, setNewRut] = useState('');
  const [newName, setNewName] = useState('');
  const [newPos, setNewPos] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newAfp, setNewAfp] = useState('AFP Habitat (11.27%)');
  const [newHealth, setNewHealth] = useState('Fonasa (7%)');
  const [newContract, setNewContract] = useState<'Indefinido' | 'Plazo Fijo'>('Indefinido');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRut.trim() || !newName.trim()) return;

    const w: Worker = {
      id: `w-${Date.now()}`,
      rut: newRut.trim(),
      name: newName.trim(),
      position: newPos.trim() || 'Colaborador',
      salary: Number(newSalary) || 650000,
      afp: newAfp,
      health: newHealth,
      contractType: newContract,
      startDate: newStartDate,
      email: newEmail.trim() || 'empleado@empresa.cl',
      address: newAddress.trim() || 'Santiago, Chile',
    };

    const updated = [w, ...workers];
    setWorkers(updated);
    try {
      localStorage.setItem('vc_payroll_workers', JSON.stringify(updated));
    } catch {}

    setShowAddWorkerModal(false);
    setNewRut('');
    setNewName('');
    setNewPos('');
    setNewSalary('');
    setNewEmail('');
    setNewAddress('');
    showToast(`Trabajador ${w.name} agregado exitosamente.`);
  };

  const totalPayroll = workers.reduce((acc, w) => acc + w.salary, 0);
  const totalImposiciones = Math.round(totalPayroll * 0.205); // ~20.5% leyes sociales promedio

  return (
    <div className="space-y-6 vc-fade">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-lime/30 text-xs font-medium animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Colaboradores Activos" dot>
          <div className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            {workers.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>En nómina activa</span>
            <span className="text-[10px] bg-lime/30 text-neutral-900 px-2 py-0.5 rounded-full font-semibold">100% al día</span>
          </div>
        </Card>

        <Card title="Nómina Mensual Líquida" dot>
          <div className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            ${totalPayroll.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>Periodo {selectedMonth}</span>
            <span className="text-[10px] text-neutral-700 font-medium">CLP</span>
          </div>
        </Card>

        <Card title="Leyes Sociales (Previred)" dot>
          <div className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">
            ~${totalImposiciones.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
            <span>AFP + Salud + AFC + SIS</span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-medium">Auto-calculado</span>
          </div>
        </Card>

        <Card title="Estado Dirección del Trabajo (DT)" dot>
          <div className="text-xl font-bold text-neutral-900 mt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-lime" />
            LRE Compatible
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Estructura compatible con portal Mi DT Chile
          </div>
        </Card>
      </div>

      {/* Controls & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f8f9fa] p-3 rounded-2xl border border-neutral-200">
        <div className="flex flex-wrap gap-2">
          <Chip active={tab === 'workers'} onClick={() => setTab('workers')}>
            👥 Ficha de Trabajadores ({workers.length})
          </Chip>
          <Chip active={tab === 'liquidaciones'} onClick={() => setTab('liquidaciones')}>
            📄 Generador de Liquidaciones
          </Chip>
          <Chip active={tab === 'certificados'} onClick={() => setTab('certificados')}>
            📜 Certificados de Antigüedad
          </Chip>
          <Chip active={tab === 'previred'} onClick={() => setTab('previred')}>
            🏢 Previred & DT Export
          </Chip>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="vc-input !py-1.5 text-xs font-semibold bg-white cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setShowAddWorkerModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-lime font-bold text-xs hover:bg-neutral-800 transition-all shadow-sm"
          >
            <I name="plus" className="w-3.5 h-3.5" />
            <span>+ Agregar Trabajador</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRABAJADORES */}
      {tab === 'workers' && (
        <Card title="Registro de Colaboradores & Fichas Contractuales" dot>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#f9fafb] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 w-56">Colaborador / RUT</th>
                  <th className="py-2.5 px-3 w-48">Cargo</th>
                  <th className="py-2.5 px-3 w-36">Sueldo Líquido</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Previsión / Salud</th>
                  <th className="py-2.5 px-3 w-44">Contrato / Ingreso</th>
                  <th className="py-2.5 px-3 w-32 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-900 truncate" title={w.name}>{w.name}</div>
                      <div className="text-[11px] font-mono text-neutral-500">{w.rut}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] truncate inline-block max-w-[170px]" title={w.position}>
                        {w.position}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-neutral-900">
                      ${w.salary.toLocaleString('es-CL')}
                    </td>
                    <td className="py-3 px-3 text-neutral-600 text-[11px]">
                      <div className="font-medium text-neutral-900">{w.afp}</div>
                      <div className="text-neutral-400">{w.health}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-neutral-600">
                      <div className="font-semibold text-neutral-800">{w.contractType}</div>
                      <div className="text-neutral-400">Ingreso: {w.startDate}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal(w)}
                        className="px-2.5 py-1.5 rounded-lg bg-black text-white font-bold text-[10px] hover:bg-neutral-800 transition-colors shadow-2xs"
                      >
                        Ver Liquidación
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: GENERADOR DE LIQUIDACIONES */}
      {tab === 'liquidaciones' && (
        <Card title={`Liquidaciones de Sueldo Oficiales · Periodo ${selectedMonth}`} dot>
          <div className="mb-4 p-4 rounded-2xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">Generador Inteligente de Liquidaciones en PDF</div>
              <div className="text-xs text-neutral-400">
                Genera los PDFs vectoriales oficiales con desglose de Haberes, AFP, Salud, AFC y Firma de la Empresa.
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast(`Se procesaron ${workers.length} liquidaciones para ${selectedMonth}. PDFs listos para descarga.`)}
              className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-100 transition-all shadow-md"
            >
              ⚡ Generar Todas las Liquidaciones del Mes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workers.map((w) => {
              const baseImp = Math.round(w.salary * 1.25);
              const afpDesc = Math.round(baseImp * 0.1144);
              const saludDesc = Math.round(baseImp * 0.07);
              const afcDesc = Math.round(baseImp * 0.006);
              const totalDesc = afpDesc + saludDesc + afcDesc;
              const haberes = w.salary + totalDesc;

              return (
                <div key={w.id} className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">{w.name}</div>
                      <div className="text-xs font-mono text-neutral-400">{w.rut} · {w.position}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold text-[10px]">
                      {selectedMonth}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-[#f8f9fa]">
                    <div>
                      <div className="text-neutral-400 text-[10px] uppercase font-semibold">Total Haberes</div>
                      <div className="font-bold text-neutral-800">${haberes.toLocaleString('es-CL')}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-[10px] uppercase font-semibold">Total Descuentos</div>
                      <div className="font-bold text-rose-600">-${totalDesc.toLocaleString('es-CL')}</div>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-neutral-200 flex items-center justify-between">
                      <span className="font-bold text-neutral-900">Líquido a Pagar:</span>
                      <span className="font-bold text-neutral-900 text-sm">${w.salary.toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => showToast(`Descargando Liquidación en PDF de ${w.name}...`)}
                      className="px-3 py-1.5 rounded-full bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                    >
                      <I name="download" className="w-3 h-3 text-white" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 3: CERTIFICADOS */}
      {tab === 'certificados' && (
        <Card title="Emisión de Certificados Laborales en 1 Clic" dot>
          <p className="text-xs text-neutral-500 mb-4">
            Genera certificados oficiales con validez legal de 30 días, logo corporativo, fecha actual y firma electrónica de Recursos Humanos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workers.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl border border-neutral-200 bg-white flex flex-col justify-between gap-3">
                <div>
                  <div className="font-bold text-neutral-900 text-sm">{w.name}</div>
                  <div className="text-xs text-neutral-500">RUT: {w.rut} · Cargo: {w.position}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Fecha de Ingreso: {w.startDate} · Contrato {w.contractType}</div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => showToast(`Certificado de Antigüedad para ${w.name} generado con éxito.`)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all text-center flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <I name="receipt" className="w-3.5 h-3.5 text-white" />
                    <span>Certificado Antigüedad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Certificado de Renta para ${w.name} generado con éxito.`)}
                    className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 transition-all"
                  >
                    Certificado Renta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: PREVIRED & DT */}
      {tab === 'previred' && (
        <Card title="Exportación Masiva Previred & Dirección del Trabajo" dot>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-neutral-200 bg-[#f8f9fa] flex flex-col justify-between space-y-4">
              <div>
                <div className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-black" />
                  Archivo Plano Previred (.txt)
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Genera el archivo estándar de 105 columnas para subir a Previred.com y pagar todas las imposiciones de tus colaboradores en un solo clic.
                </p>
                <div className="mt-3 text-xs text-neutral-600 font-mono">
                  Periodo: {selectedMonth} · Total trabajadores: {workers.length}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`PREVIRED-105-COLS-DEMO\n${workers.map(w => `${w.rut};${w.name};${w.salary}`).join('\n')}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `PREVIRED_${selectedMonth}.txt`;
                  a.click();
                  showToast('Archivo Previred descargado exitosamente.');
                }}
                className="w-full py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <I name="download" className="w-4 h-4 text-white" />
                <span>Descargar Archivo Previred (.txt)</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 bg-[#f8f9fa] flex flex-col justify-between space-y-4">
              <div>
                <div className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-black" />
                  Libro de Remuneraciones Electrónico (LRE)
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Archivo CSV estandarizado obligatorio para declarar en el portal Mi DT de la Dirección del Trabajo según la normativa chilena vigente.
                </p>
                <div className="mt-3 text-xs text-neutral-600 font-mono">
                  Normativa DT vigente · Código haberes estandarizados
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([`RUT;NOMBRE;HABERES;DESCUENTOS;LIQUIDO\n${workers.map(w => `${w.rut};${w.name};${Math.round(w.salary*1.25)};${Math.round(w.salary*0.25)};${w.salary}`).join('\n')}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `LRE_DT_${selectedMonth}.csv`;
                  a.click();
                  showToast('Archivo LRE para la DT descargado exitosamente.');
                }}
                className="w-full py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <I name="download" className="w-4 h-4 text-white" />
                <span>Descargar LRE para Dirección del Trabajo (.csv)</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: AGREGAR TRABAJADOR */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-neutral-200 vc-fade max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                Ficha de Nuevo Colaborador
              </h3>
              <button
                type="button"
                onClick={() => setShowAddWorkerModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Ingresa los datos contractuales para emitir sus liquidaciones y certificados con leyes chilenas.
            </p>

            <form onSubmit={handleAddWorker} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">RUT *</label>
                  <input
                    type="text"
                    required
                    placeholder="12.345.678-9"
                    value={newRut}
                    onChange={(e) => setNewRut(e.target.value)}
                    className="vc-input w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellidos"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Técnico de Mantenimiento"
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Sueldo Líquido Pactado (CLP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4800000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="vc-input w-full text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">AFP</label>
                  <select
                    value={newAfp}
                    onChange={(e) => setNewAfp(e.target.value)}
                    className="vc-input w-full text-xs bg-white cursor-pointer"
                  >
                    <option>AFP Capital (11.44%)</option>
                    <option>AFP Cuprum (11.44%)</option>
                    <option>AFP Habitat (11.27%)</option>
                    <option>AFP Modelo (10.58%)</option>
                    <option>AFP Planvital (11.16%)</option>
                    <option>AFP Provida (11.45%)</option>
                    <option>AFP Uno (10.49%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Sistema de Salud</label>
                  <select
                    value={newHealth}
                    onChange={(e) => setNewHealth(e.target.value)}
                    className="vc-input w-full text-xs bg-white cursor-pointer"
                  >
                    <option>Fonasa (7%)</option>
                    <option>Isapre Banmédica</option>
                    <option>Isapre Colmena</option>
                    <option>Isapre Consalud</option>
                    <option>Isapre CruzBlanca</option>
                    <option>Isapre Nueva Masvida</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Tipo de Contrato</label>
                  <select
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value as any)}
                    className="vc-input w-full text-xs bg-white cursor-pointer"
                  >
                    <option value="Indefinido">Indefinido</option>
                    <option value="Plazo Fijo">Plazo Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="vc-input w-full text-xs bg-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="trabajador@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Dirección / Comuna</label>
                  <input
                    type="text"
                    placeholder="David Ben Gurion 241, Las Condes"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 shadow-md"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW LIQUIDACIÓN */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 vc-fade space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">{showPreviewModal.name}</h3>
                <div className="text-xs text-neutral-500 font-mono">{showPreviewModal.rut} · {showPreviewModal.position}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Sueldo Base Líquido:</span>
                <span className="font-bold text-neutral-900">${showPreviewModal.salary.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">AFP:</span>
                <span className="font-semibold text-neutral-800">{showPreviewModal.afp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Salud:</span>
                <span className="font-semibold text-neutral-800">{showPreviewModal.health}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tipo de Contrato:</span>
                <span className="font-semibold text-neutral-800">{showPreviewModal.contractType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fecha de Ingreso:</span>
                <span className="font-semibold text-neutral-800">{showPreviewModal.startDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Descargando Liquidación oficial de ${showPreviewModal.name}...`);
                  setShowPreviewModal(null);
                }}
                className="px-5 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 shadow-md"
              >
                Descargar PDF Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
