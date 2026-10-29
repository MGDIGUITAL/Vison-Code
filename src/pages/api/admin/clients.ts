import type { APIRoute } from 'astro';
import { requireAdmin, json, anonClient } from '../../../lib/server';

export const prerender = false;

export interface ActiveClient {
  id: string;
  name: string;
  company: string;
  rut?: string;
  email: string;
  phone: string;
  servicePlan: string;
  type: 'suscripcion' | 'pago_unico';
  billingCycle?: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  mrr: number; // Monto mensual o monto total
  status: 'activo' | 'por_renovar' | 'en_desarrollo' | 'pausado' | 'finalizado';
  paymentStatus: 'al_dia' | 'por_renovar' | 'pendiente' | 'pagado';
  startDate: string;
  nextBillingDate?: string;
  domain?: string;
  notes?: string;
  created_at: string;
}

export const DEFAULT_CLIENTS: ActiveClient[] = [
  {
    id: "cli_001",
    name: "Carlos Mendoza",
    company: "Inversiones & Minería Andes SpA",
    rut: "76.892.410-K",
    email: "carlos@andesmineria.cl",
    phone: "+56 9 8452 1190",
    servicePlan: "Portal Web Corporativo B2B",
    type: "pago_unico",
    mrr: 250000,
    status: "activo",
    paymentStatus: "pagado",
    startDate: "2026-09-15",
    domain: "https://andesmineria.cl",
    notes: "Sitio corporativo entregado y verificado con Meta Pixel.",
    created_at: "2026-09-15T12:00:00Z"
  },
  {
    id: "cli_002",
    name: "Valeria Soto",
    company: "Boutique Streetwear Urban",
    rut: "77.104.933-2",
    email: "contacto@urbanwear.cl",
    phone: "+56 9 9214 7720",
    servicePlan: "Plan VISION SCALE (Catálogo & SaaS)",
    type: "suscripcion",
    mrr: 59990,
    status: "por_renovar",
    paymentStatus: "por_renovar",
    startDate: "2026-09-28",
    nextBillingDate: "2026-10-28",
    domain: "https://urbanwear.cl",
    notes: "Suscripción activa. Facturación mensual vence en pocos días.",
    created_at: "2026-09-28T15:30:00Z"
  },
  {
    id: "cli_003",
    name: "Rodrigo Palma",
    company: "Clínica Dental OdontoSalud",
    rut: "76.450.812-5",
    email: "gerencia@odontosalud.cl",
    phone: "+56 9 7311 9022",
    servicePlan: "Plan PARTNER PRO (Meta Ads & Soporte VIP)",
    type: "suscripcion",
    mrr: 119990,
    status: "activo",
    paymentStatus: "al_dia",
    startDate: "2026-08-20",
    nextBillingDate: "2026-11-20",
    domain: "https://odontosalud.cl",
    notes: "Gestión continua de campañas Meta Ads y sistema ERP de turnos.",
    created_at: "2026-08-20T10:00:00Z"
  },
  {
    id: "cli_004",
    name: "Camila Rojas",
    company: "Distribuidora Gourmet Sur",
    rut: "77.288.940-1",
    email: "ventas@gourmetsur.cl",
    phone: "+56 9 6890 4411",
    servicePlan: "E-Commerce Profesional Ilimitado",
    type: "pago_unico",
    mrr: 390000,
    status: "en_desarrollo",
    paymentStatus: "al_dia",
    startDate: "2026-10-18",
    domain: "https://gourmetsur.cl",
    notes: "En fase de integración con pasarela Webpay Plus y Starken.",
    created_at: "2026-10-18T16:20:00Z"
  },
  {
    id: "cli_005",
    name: "Esteban Morales",
    company: "Constructora Horizonte SpA",
    rut: "76.311.205-8",
    email: "esteban@horizonte.cl",
    phone: "+56 9 5540 1289",
    servicePlan: "Plan VISION CORE (Mantenimiento & SSL)",
    type: "suscripcion",
    mrr: 29990,
    status: "pausado",
    paymentStatus: "pendiente",
    startDate: "2026-07-10",
    nextBillingDate: "2026-10-10",
    domain: "https://horizonte.cl",
    notes: "Servicio en pausa temporal a la espera de confirmación de renovación.",
    created_at: "2026-07-10T09:00:00Z"
  },
  {
    id: "cli_006",
    name: "Loreto Fuentes",
    company: "Transportes del Maule",
    rut: "77.890.112-9",
    email: "operaciones@transmaule.cl",
    phone: "+56 9 4410 7733",
    servicePlan: "Plan VISION SCALE (Catálogo & SaaS)",
    type: "suscripcion",
    mrr: 59990,
    status: "por_renovar",
    paymentStatus: "por_renovar",
    startDate: "2026-09-30",
    nextBillingDate: "2026-10-30",
    domain: "https://transmaule.cl",
    notes: "Renovación mensual próxima a vencer a fin de mes.",
    created_at: "2026-09-30T14:15:00Z"
  }
];

let clientsStore: ActiveClient[] = [...DEFAULT_CLIENTS];

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  // Attempt to sync with Supabase contacts where stage = 'ganado' if available
  try {
    const sb = anonClient(auth.token !== 'master-token' ? auth.token : undefined);
    if (sb) {
      const { data: wonContacts } = await sb
        .from('contacts')
        .select('*')
        .eq('stage', 'ganado');

      if (wonContacts && wonContacts.length > 0) {
        // Merge without duplicating existing store
        for (const c of wonContacts) {
          if (!clientsStore.some(cs => cs.id === c.id || cs.email === c.email)) {
            clientsStore.unshift({
              id: c.id,
              name: c.name || 'Cliente sin nombre',
              company: c.company || 'Empresa Particular',
              email: c.email || '',
              phone: c.phone || '',
              servicePlan: c.plan || 'Servicio Personalizado',
              type: (c.plan || '').toLowerCase().includes('plan') ? 'suscripcion' : 'pago_unico',
              mrr: Number(c.value || 0),
              status: 'activo',
              paymentStatus: 'al_dia',
              startDate: (c.created_at || '').slice(0, 10),
              created_at: c.created_at || new Date().toISOString()
            });
          }
        }
      }
    }
  } catch {}

  const mrrTotal = clientsStore
    .filter(c => (c.status === 'activo' || c.status === 'por_renovar') && c.type === 'suscripcion')
    .reduce((sum, c) => sum + (c.mrr || 0), 0);

  const totalActivos = clientsStore.filter(c => c.status === 'activo').length;
  const dueForRenewal = clientsStore.filter(c => c.status === 'por_renovar' || c.paymentStatus === 'por_renovar').length;
  const inDevelopment = clientsStore.filter(c => c.status === 'en_desarrollo').length;
  const pausedCount = clientsStore.filter(c => c.status === 'pausado').length;

  return json({
    ok: true,
    count: clientsStore.length,
    metrics: {
      totalClients: clientsStore.length,
      activeClients: totalActivos,
      dueForRenewal,
      mrrTotal,
      inDevelopment,
      pausedCount,
    },
    clients: clientsStore,
    updatedAt: new Date().toISOString()
  });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();

    if (body.action === 'reset') {
      clientsStore = [...DEFAULT_CLIENTS];
      return json({ ok: true, message: 'Clientes restablecidos', clients: clientsStore });
    }

    if (body.client) {
      const clientData: ActiveClient = {
        id: body.client.id || `cli_${Date.now()}`,
        name: body.client.name.trim(),
        company: body.client.company?.trim() || 'Empresa Particular',
        rut: body.client.rut?.trim() || '',
        email: body.client.email?.trim() || '',
        phone: body.client.phone?.trim() || '',
        servicePlan: body.client.servicePlan || 'Servicio Digital',
        type: body.client.type || 'pago_unico',
        mrr: Number(body.client.mrr || 0),
        status: body.client.status || 'activo',
        paymentStatus: body.client.paymentStatus || 'al_dia',
        startDate: body.client.startDate || new Date().toISOString().slice(0, 10),
        nextBillingDate: body.client.nextBillingDate,
        domain: body.client.domain || '',
        notes: body.client.notes || '',
        created_at: body.client.created_at || new Date().toISOString()
      };

      const idx = clientsStore.findIndex(c => c.id === clientData.id);
      if (idx !== -1) {
        clientsStore[idx] = { ...clientsStore[idx], ...clientData };
      } else {
        clientsStore.unshift(clientData);
      }

      return json({ ok: true, message: 'Cliente guardado correctamente', client: clientData });
    }

    if (body.action === 'delete' && body.id) {
      clientsStore = clientsStore.filter(c => c.id !== body.id);
      return json({ ok: true, message: 'Cliente eliminado correctamente', id: body.id });
    }

    return json({ ok: false, error: 'Solicitud no válida' }, 400);
  } catch (err: any) {
    return json({ ok: false, error: err.message || 'Error al procesar cliente' }, 500);
  }
};
