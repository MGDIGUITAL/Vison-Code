import React, { useState } from 'react';
import { Card, Chip, I } from '../ui';
import { VC_LOGO_BASE64 } from '../logoBase64';

interface ServiceItem {
  id: string;
  num: string;
  title: string;
  refPrice: string;
  features: string[];
  selected: boolean;
  agreedPrice: number;
}

interface Quote {
  id: string;
  code: string;
  date: string;
  validity: string;
  issuerName?: string;
  clientName: string;
  clientRut: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  services: { num: string; title: string; price: number; features: string[] }[];
  subtotal: number;
  iva: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada';
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 's-1',
    num: '01',
    title: 'INICIA TU PYME — Lista para Facturar en Chile',
    refPrice: '$89.990 + IVA',
    features: [
      'Constitución de sociedad SpA / EIRL en el Registro de Empresas y Sociedades.',
      'Obtención del RUT Empresa e Inicio de Actividades en el SII.',
      'Certificado Digital de Facturación Electrónica por 1 año completo.',
      'Clave Tributaria, Acreditación de Domicilio & Actividad en SII.',
      'Implementación de Factura Electrónica y gestión para Cuenta Banco Empresa.',
    ],
    selected: false,
    agreedPrice: 89990,
  },
  {
    id: 's-2',
    num: '02',
    title: 'Landing Page Express / Web Pyme Inicial',
    refPrice: '$149.990 – $199.990 + IVA',
    features: [
      'Diseño responsivo móvil/escritorio de alta velocidad (tecnología Astro/Tailwind).',
      'Formulario de captación interactivo conectado a correo y botón directo a WhatsApp.',
      'Optimización SEO inicial para buscadores y certificado SSL.',
      'Incluye 1 año de Hosting Rápido y Dominio .CL gratis.',
    ],
    selected: true,
    agreedPrice: 169990,
  },
  {
    id: 's-3',
    num: '03',
    title: 'Portal Web Corporativo B2B (6 Secciones)',
    refPrice: '$299.990 – $399.990 + IVA',
    features: [
      'Portal institucional completo (Inicio, Nosotros, Servicios, Casos, Blog, Contacto).',
      'Diseño exclusivo alineado a la identidad corporativa y marca del cliente.',
      'Integración con Google Analytics 4, Píxel de Meta y consola SEO de Google.',
      'Panel autoadministrable de contenido.',
    ],
    selected: false,
    agreedPrice: 349990,
  },
  {
    id: 's-4',
    num: '04',
    title: 'Tienda Virtual E-Commerce Inicial / Pyme',
    refPrice: '$249.990 – $349.990 + IVA',
    features: [
      'Catálogo comercial hasta 20 productos iniciales.',
      'Pasarelas de pago integradas: Webpay Plus (Transbank) y MercadoPago.',
      'Carrito de compras, cálculo automático de despachos y notificación por correo.',
    ],
    selected: false,
    agreedPrice: 289990,
  },
  {
    id: 's-5',
    num: '05',
    title: 'E-Commerce Profesional Sin Límites',
    refPrice: '$499.990 – $699.990 + IVA',
    features: [
      'Catálogo de productos ilimitado con variaciones (tallas, colores, stock).',
      'Integración automática con Starken / Chilexpress y cupones de descuento.',
      'Píxel de Meta a catálogo dinámico y Google Shopping.',
    ],
    selected: false,
    agreedPrice: 549990,
  },
  {
    id: 's-6',
    num: '06',
    title: 'Agente IA de WhatsApp Estándar',
    refPrice: '$149.990 + $29.990/mes',
    features: [
      'Asistente de Inteligencia Artificial 24/7 entrenado con la información del negocio.',
      'Cualificación automática de prospectos y derivación a ejecutivos de venta.',
      'Mantenimiento y actualización mensual de información.',
    ],
    selected: true,
    agreedPrice: 149990,
  },
  {
    id: 's-7',
    num: '07',
    title: 'Estrategia & Gestión Publicitaria Meta Ads',
    refPrice: '$150.000 – $250.000 / mes',
    features: [
      'Creación y administración de campañas publicitarias en Facebook e Instagram.',
      'Diseño de piezas gráficas / copys orientados a conversión.',
      'Optimización semanal de costo por cliente potencial (CPL) e informe de resultados.',
    ],
    selected: false,
    agreedPrice: 180000,
  },
  {
    id: 's-8',
    num: '08',
    title: 'Vision Code Pro (Web + ERP + CRM Integrado)',
    refPrice: '$990.000 – $1.490.000 + IVA',
    features: [
      'Plataforma web a medida integrada con ERP de control de inventario y facturación.',
      'Módulo CRM para seguimiento comercial de clientes y ventas.',
      'Soporte técnico dedicado con SLA garantizado.',
    ],
    selected: false,
    agreedPrice: 1190000,
  },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q-1',
    code: 'VC-2026-006',
    date: '2026-10-05',
    validity: '15 días',
    clientName: 'MAREA MEDIA CONSULTING COMPANY SPA',
    clientRut: '78.096.032-9',
    clientContact: 'Representante Legal',
    clientEmail: 'contacto@mareamedia.cl',
    clientPhone: '+56 9 8765 4321',
    clientAddress: 'Arenales 535, Torre 1 #1204, Concón',
    services: [
      {
        num: '01',
        title: 'Desarrollo de Panel Analítico y CRM',
        price: 50000,
        features: ['Dashboard de control para monitoreo de tráfico y usuarios activos.', 'Mapa de calor de secciones y horas pico.'],
      },
      {
        num: '02',
        title: 'Desarrollo Backend & Base de Datos',
        price: 50000,
        features: ['Arquitectura de base de datos dedicada sin límites de registros.', 'Generación de API Keys seguras.'],
      },
      {
        num: '03',
        title: 'Integración Meta API & Automatización',
        price: 50000,
        features: ['Sincronización directa con Meta Business API para centralizar métricas.'],
      },
    ],
    subtotal: 150000,
    iva: 28500,
    total: 178500,
    status: 'Aprobada',
  },
  {
    id: 'q-2',
    code: 'VC-2026-007',
    date: '2026-10-23',
    validity: '15 días',
    clientName: 'Soc de Mantencion e Instalaciones Tecnicas SA',
    clientRut: '96.799.650-5',
    clientContact: 'José Matías Bravo Inalef',
    clientEmail: 'Aflcaptacion@gmail.com',
    clientPhone: '+56 9 6455 2200',
    clientAddress: 'La Victoria 0182, La Granja',
    services: [
      {
        num: '02',
        title: 'Landing Page Express / Web Pyme Inicial',
        price: 169990,
        features: ['Diseño responsivo móvil/escritorio.', 'Formulario de captación interactivo a WhatsApp.', '1 año de hosting y dominio .CL gratis.'],
      },
      {
        num: '06',
        title: 'Agente IA de WhatsApp Estándar',
        price: 149990,
        features: ['Asistente IA 24/7 entrenado.', 'Cualificación automática de prospectos.'],
      },
    ],
    subtotal: 319980,
    iva: 60796,
    total: 380776,
    status: 'Enviada',
  },
];

export default function Cotizaciones({ activeProject }: { activeProject?: any }) {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem('vc_quotes_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((q: any) => ({
          ...q,
          issuerName: q.issuerName || 'Matías Espinoza',
        }));
      }
    } catch {}
    return INITIAL_QUOTES.map((q) => ({ ...q, issuerName: 'Matías Espinoza' }));
  });

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [emailModalQuote, setEmailModalQuote] = useState<Quote | null>(null);
  const [editIssuerQuote, setEditIssuerQuote] = useState<Quote | null>(null);
  const [editIssuerNameInput, setEditIssuerNameInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [issuerName, setIssuerName] = useState<string>(() => {
    try {
      return localStorage.getItem('vc_default_issuer') || 'Matías Espinoza';
    } catch {
      return 'Matías Espinoza';
    }
  });
  const [clientName, setClientName] = useState('');
  const [clientRut, setClientRut] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customFeatures, setCustomFeatures] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handlePriceChange = (id: string, price: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, agreedPrice: price } : s))
    );
  };

  const handleAddCustomService = () => {
    if (!customTitle.trim() || !customPrice) return;
    const newS: ServiceItem = {
      id: `s-custom-${Date.now()}`,
      num: `0${services.length + 1}`.slice(-2),
      title: customTitle.trim(),
      refPrice: `$${Number(customPrice).toLocaleString('es-CL')} + IVA`,
      features: customFeatures ? customFeatures.split('\n').filter(Boolean) : ['Desarrollo e implementación según requerimiento.'],
      selected: true,
      agreedPrice: Number(customPrice),
    };
    setServices([...services, newS]);
    setCustomTitle('');
    setCustomPrice('');
    setCustomFeatures('');
    showToast('Servicio personalizado agregado.');
  };

  const selectedServices = services.filter((s) => s.selected);
  const subtotal = selectedServices.reduce((acc, s) => acc + s.agreedPrice, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || selectedServices.length === 0) {
      showToast('Ingresa el nombre del cliente y selecciona al menos 1 servicio.');
      return;
    }

    const nextCode = `VC-2026-00${quotes.length + 6}`;
    const newQ: Quote = {
      id: `q-${Date.now()}`,
      code: nextCode,
      date: new Date().toISOString().slice(0, 10),
      validity: '15 días',
      issuerName: issuerName.trim() || 'Matías Espinoza',
      clientName: clientName.trim(),
      clientRut: clientRut.trim() || '76.000.000-0',
      clientContact: clientContact.trim() || 'Representante Legal',
      clientEmail: clientEmail.trim() || 'contacto@cliente.cl',
      clientPhone: clientPhone.trim() || '+56 9 ...',
      clientAddress: clientAddress.trim() || 'Santiago, Chile',
      services: selectedServices.map((s) => ({
        num: s.num,
        title: s.title,
        price: s.agreedPrice,
        features: s.features,
      })),
      subtotal,
      iva,
      total,
      status: 'Enviada',
    };

    const updated = [newQ, ...quotes];
    setQuotes(updated);
    try {
      localStorage.setItem('vc_quotes_list', JSON.stringify(updated));
      localStorage.setItem('vc_default_issuer', issuerName.trim());
    } catch {}

    setShowNewModal(false);
    showToast(`Cotización ${newQ.code} guardada con éxito.`);
  };

  // Impresión / Guardado PDF oficial 100% BLANCO Y NEGRO sin verdes
  const printOfficialPDF = (q: Quote) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentIssuer = q.issuerName || issuerName || 'Matías Espinoza';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cuestionario & Cotización Corporativa — AGENCIA VISION CODE SpA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4; margin: 10mm 15mm 10mm 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Inter', sans-serif; color: #000000; background-color: #ffffff; margin: 0; padding: 0; font-size: 10.5px; line-height: 1.45; }
    h1, h2, h3, h4, .font-heading { font-family: 'Montserrat', sans-serif; margin: 0; }
    .header-container { border: 2px solid #000000; padding: 14px 18px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; }
    .header-logo-side { display: flex; align-items: center; gap: 14px; }
    .logo-img { max-height: 48px; max-width: 180px; width: auto; object-fit: contain; }
    .brand-title { font-size: 15px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: #000000; font-family: 'Montserrat', sans-serif; }
    .brand-meta { font-size: 8.5px; font-weight: 700; color: #374151; margin-top: 2px; line-height: 1.35; }
    .doc-type-badge { border: 1.5px solid #000000; background-color: #000000; color: #ffffff; padding: 8px 14px; text-align: right; border-radius: 2px; }
    .doc-type-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-family: 'Montserrat', sans-serif; }
    .doc-type-sub { font-size: 8px; color: #D1D5DB; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .section-title { font-size: 11px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 8px; background-color: #F3F4F6; border-left: 4px solid #000000; border-top: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; margin-top: 14px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .info-table td { padding: 6px 8px; border: 1px solid #D1D5DB; font-size: 9.5px; }
    .info-label { font-weight: 800; background-color: #F9FAFB; width: 25%; text-transform: uppercase; font-size: 8.5px; }
    .checklist-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .checklist-table th { background-color: #000000; color: #ffffff; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 8px; border: 1px solid #000000; text-align: left; font-family: 'Montserrat', sans-serif; }
    .checklist-table td { padding: 6px 8px; border: 1px solid #D1D5DB; font-size: 9.5px; vertical-align: middle; }
    .checklist-table tr:nth-child(even) td { background-color: #F9FAFB; }
    .cb-cell { text-align: center; width: 85px; }
    .checkbox-box { display: inline-block; width: 11px; height: 11px; border: 1.2px solid #000000; border-radius: 2px; margin-right: 3px; vertical-align: middle; }
    .checkbox-box.checked { background-color: #000000; }
    .service-card { border: 1px solid #000000; margin-bottom: 10px; page-break-inside: avoid; }
    .service-card-header { background-color: #000000; color: #ffffff; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; }
    .service-num { font-size: 9px; font-weight: 900; background-color: #ffffff; color: #000000; padding: 1px 6px; border-radius: 2px; margin-right: 6px; font-family: 'Montserrat', sans-serif; }
    .service-name { font-size: 10.5px; font-weight: 800; letter-spacing: 0.3px; font-family: 'Montserrat', sans-serif; }
    .service-sug-price { font-size: 9.5px; font-weight: 800; background-color: #374151; color: #ffffff; padding: 2px 7px; border-radius: 2px; }
    .service-card-body { padding: 8px 10px; background-color: #ffffff; }
    .service-features { margin: 4px 0 8px 0; padding-left: 14px; font-size: 9px; color: #1F2937; }
    .service-features li { margin-bottom: 2px; }
    .service-fill-bar { border-top: 1px solid #E5E7EB; background-color: #F9FAFB; padding: 6px 10px; font-size: 9.5px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
    .fill-line { border-bottom: 1.5px solid #000000; width: 160px; display: inline-block; font-weight: 900; color: #000; text-align: right; padding-right: 4px; }
    .total-box { margin-top: 14px; padding: 12px; border: 2px solid #000000; background-color: #F9FAFB; display: flex; justify-content: space-between; align-items: center; page-break-inside: avoid; }
    .signatures-grid { margin-top: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; page-break-inside: avoid; }
    .signature-card { border: 1px solid #000000; padding: 12px; text-align: center; background-color: #F9FAFB; }
    .sig-line { border-top: 1.5px solid #000000; margin-top: 40px; padding-top: 6px; font-weight: 800; font-size: 9.5px; }
  </style>
</head>
<body>
  <!-- HEADER 100% B&W -->
  <div class="header-container">
    <div class="header-logo-side">
      <img src="${VC_LOGO_BASE64}" alt="Vision Code" class="logo-img" />
      <div>
        <div class="brand-title">AGENCIA VISION CODE SpA</div>
        <div class="brand-meta">
          RUT: 78.517.394-5 &bull; Dirección: Av. La Dehesa 1822 - Oficina 705, Lo Barnechea<br/>
          Representante: ${currentIssuer} (Gerente General) &bull; Mail: vision.code.cl@gmail.com &bull; Web: www.vision-code.cl
        </div>
      </div>
    </div>
    <div class="doc-type-badge">
      <div class="doc-type-title">CUESTIONARIO &amp; COTIZACIÓN</div>
      <div class="doc-type-sub">Acuerdo Comercial 50/50 &bull; N.º ${q.code}</div>
    </div>
  </div>

  <!-- SECCIÓN 1: FICHA DE IDENTIFICACIÓN DE LAS PARTES -->
  <div class="section-title">1. Ficha de Identificación de las Partes</div>
  <table class="info-table">
    <tr>
      <td class="info-label">Empresa / Razón Social:</td>
      <td>AGENCIA VISION CODE SpA</td>
      <td class="info-label">Cliente / Razón Social:</td>
      <td><strong>${q.clientName}</strong></td>
    </tr>
    <tr>
      <td class="info-label">RUT Prestador:</td>
      <td>78.517.394-5</td>
      <td class="info-label">RUT Cliente:</td>
      <td><strong>${q.clientRut}</strong></td>
    </tr>
    <tr>
      <td class="info-label">Dirección Comercial:</td>
      <td>Av. La Dehesa 1822 - Of. 705, Lo Barnechea</td>
      <td class="info-label">Contacto / Representante:</td>
      <td>${q.clientContact}</td>
    </tr>
    <tr>
      <td class="info-label">Atendido por:</td>
      <td>Matías Espinoza &mdash; Gerente General</td>
      <td class="info-label">Correo &amp; Teléfono:</td>
      <td>${q.clientEmail} &bull; ${q.clientPhone}</td>
    </tr>
  </table>

  <!-- SECCIÓN 2: CUESTIONARIO DE DEFINICIÓN COMERCIAL & POLÍTICAS DE COBRO -->
  <div class="section-title">2. Cuestionario de Definición Comercial &amp; Políticas de Cobro</div>
  <table class="checklist-table">
    <thead>
      <tr>
        <th style="width: 5%;">N°</th>
        <th style="width: 65%;">Requisito Comercial / Norma del Servicio</th>
        <th class="cb-cell">Vision Code</th>
        <th class="cb-cell">Cliente</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>01</strong></td>
        <td>¿Todos los servicios se emitirán obligatoriamente <strong>+ IVA con Factura Electrónica</strong>?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>02</strong></td>
        <td>¿Se solicitará el <strong>50% de anticipo al firmar</strong> y 50% restante contra entrega verificada?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>03</strong></td>
        <td>¿Se habilitará opción de pago en <strong>3 cuotas precio contado</strong> vía Webpay (Transbank)?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>04</strong></td>
        <td>¿Incluirá <strong>1 año de Hosting Rápido y Dominio .CL</strong> sin costo en el desarrollo inicial?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>05</strong></td>
        <td>¿Se establecerá un costo anual de mantenimiento/hosting de $49.990 + IVA a contar del año 2?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>06</strong></td>
        <td>¿Los Agentes IA de WhatsApp requerirán una cuota mensual recurrente de soporte ($29.990/mes)?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>07</strong></td>
        <td>¿El presupuesto para anuncios en Meta Ads (FB &amp; IG) será pagado por el cliente directamente?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
      <tr>
        <td><strong>08</strong></td>
        <td>¿Las utilidades netas del proyecto se liquidarán con entrega final conforme y recepción técnica?</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
        <td class="cb-cell"><span class="checkbox-box checked"></span>Sí <span class="checkbox-box"></span>No</td>
      </tr>
    </tbody>
  </table>

  <!-- SECCIÓN 3: CATÁLOGO DE SERVICIOS & ESTIMACIÓN DE PRECIOS -->
  <div class="section-title">3. Catálogo de Servicios &amp; Estimación de Precios Acordados</div>
  ${q.services
    .map(
      (s) => `
    <div class="service-card">
      <div class="service-card-header">
        <div>
          <span class="service-num">${s.num}</span>
          <span class="service-name">${s.title}</span>
        </div>
        <span class="service-sug-price">Acordado: $${s.price.toLocaleString('es-CL')} + IVA</span>
      </div>
      <div class="service-card-body">
        <ul class="service-features">
          ${s.features.map((f) => `<li>${f}</li>`).join('')}
        </ul>
        <div class="service-fill-bar">
          <span>Contratar Servicio: <span class="checkbox-box checked"></span> Sí &nbsp; <span class="checkbox-box"></span> No</span>
          <span>PRECIO ACORDADO: <span class="fill-line">$ ${s.price.toLocaleString('es-CL')}</span> + IVA</span>
        </div>
      </div>
    </div>
  `
    )
    .join('')}

  <!-- TOTAL BOX B&W -->
  <div class="total-box">
    <div>
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase;">POLÍTICA DE COBRO: 50% ANTICIPO / 50% CONTRA ENTREGA</div>
      <div style="font-size: 9px; color: #4B5563; margin-top: 3px;">
        Anticipo 50%: $${Math.round(q.total / 2).toLocaleString('es-CL')} &bull; Saldo 50%: $${Math.round(q.total / 2).toLocaleString('es-CL')} (Transferencia o Webpay 3 cuotas)
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 9.5px; color: #374151;">Subtotal Neto: $${q.subtotal.toLocaleString('es-CL')}</div>
      <div style="font-size: 9.5px; color: #374151;">IVA (19%): $${q.iva.toLocaleString('es-CL')}</div>
      <div style="font-size: 15px; font-weight: 900; color: #000000; margin-top: 2px;">TOTAL A PAGAR: $${q.total.toLocaleString('es-CL')} CLP</div>
    </div>
  </div>

  <!-- SECCIÓN 4: FIRMAS B&W -->
  <div class="section-title">4. Firmas de Aprobación &amp; Cierre de Cotización</div>
  <div class="signatures-grid">
    <div class="signature-card">
      <div style="font-weight: 900; text-transform: uppercase; font-size: 9px; margin-bottom: 2px;">POR PRESTADOR DE SERVICIOS:</div>
      <div class="sig-line">
        AGENCIA VISION CODE SpA<br/>
        <span style="font-size: 8.5px; font-weight: 700; color: #4B5563;">RUT: 78.517.394-5</span><br/>
        <span style="font-size: 9.5px; font-weight: 900; color: #000000;">${currentIssuer}</span><br/>
        <span style="font-size: 8px; color: #6B7280;">Gerente General &bull; Agencia Vision Code SpA</span>
      </div>
    </div>

    <div class="signature-card">
      <div style="font-weight: 900; text-transform: uppercase; font-size: 9px; margin-bottom: 2px;">POR EL CLIENTE / ACEPTACIÓN:</div>
      <div class="sig-line">
        <strong>${q.clientName}</strong><br/>
        <span style="font-size: 8.5px; font-weight: 700; color: #4B5563;">RUT: ${q.clientRut}</span><br/>
        <span style="font-size: 8px; color: #6B7280;">Nombre &amp; Firma Representante: ${q.clientContact}</span><br/>
        <span style="font-size: 8px; color: #6B7280;">Fecha de Aceptación: _____ / _____ / 2026</span>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleUpdateStatus = (id: string, newStatus: Quote['status']) => {
    const updated = quotes.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    setQuotes(updated);
    try {
      localStorage.setItem('vc_quotes_list', JSON.stringify(updated));
    } catch {}
    const target = quotes.find((q) => q.id === id);
    showToast(`Estado de ${target?.code || 'cotización'} actualizado a "${newStatus}".`);
  };

  const handleDeleteQuote = (id: string) => {
    const target = quotes.find((q) => q.id === id);
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    try {
      localStorage.setItem('vc_quotes_list', JSON.stringify(updated));
    } catch {}
    setDeleteConfirmId(null);
    showToast(`Cotización ${target?.code || ''} eliminada correctamente.`);
  };

  const handleSendWhatsApp = (q: Quote) => {
    const issuer = q.issuerName || issuerName || 'Matías Espinoza';
    const servicesList = q.services.map((s) => `  • ${s.title}: $${s.price.toLocaleString('es-CL')} CLP + IVA`).join('\n');
    const text = `Estimado/a *${q.clientContact || q.clientName}*,\n\nJunto con saludar desde *Agencia Vision Code SpA*, le enviamos el detalle formal de su propuesta comercial (*${q.code}*):\n\n🏢 *Cliente:* ${q.clientName}\n📋 *RUT:* ${q.clientRut}\n\n🛠️ *Servicios Contratados:*\n${servicesList}\n\n💵 *Subtotal Neto:* $${q.subtotal.toLocaleString('es-CL')} CLP\n🧾 *IVA (19%):* $${q.iva.toLocaleString('es-CL')} CLP\n💎 *Total a Pagar:* $${q.total.toLocaleString('es-CL')} CLP\n\n📌 *Condición de Cobro:* 50% anticipo al inicio / 50% contra entrega final conforme (disponible en 3 cuotas Webpay Plus sin interés).\n\nAdjunto le hacemos llegar el documento PDF oficial con el detalle técnico y firmas.\n\nQuedamos muy atentos para iniciar de inmediato. 🚀\n\n*${issuer}*\nGerente General\nAgencia Vision Code SpA`;

    try {
      navigator.clipboard.writeText(text);
    } catch {}

    const cleanPhone = (q.clientPhone || '').replace(/\D/g, '');
    let waUrl = '';
    if (cleanPhone.length >= 8) {
      const fullPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`;
      waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    } else {
      waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    }

    window.open(waUrl, '_blank');
    showToast('Abriendo WhatsApp con propuesta formal lista para enviar.');
  };

  const getEmailContent = (q: Quote) => {
    const issuer = q.issuerName || issuerName || 'Matías Espinoza';
    const subject = `Propuesta Comercial & Cotización Formal — Vision Code SpA (${q.code})`;
    const body = `Estimado/a ${q.clientContact || q.clientName},

Junto con saludar cordialmente desde Agencia Vision Code SpA, le hacemos llegar la propuesta comercial y cotización formal correspondiente al código ${q.code}.

RESUMEN DE LA PROPUESTA:
• Cliente / Razón Social: ${q.clientName}
• RUT: ${q.clientRut}
• Fecha de Emisión: ${q.date}
• Validez: ${q.validity || '15 días'}

SERVICIOS COTIZADOS:
${q.services.map((s) => `• ${s.title} — $${s.price.toLocaleString('es-CL')} CLP + IVA`).join('\n')}

CONDICIONES ECONÓMICAS:
• Subtotal Neto: $${q.subtotal.toLocaleString('es-CL')} CLP
• IVA (19%): $${q.iva.toLocaleString('es-CL')} CLP
• TOTAL A PAGAR: $${q.total.toLocaleString('es-CL')} CLP

FORMA DE PAGO:
• 50% de anticipo al inicio del proyecto.
• 50% de saldo contra entrega y aprobación final conforme.
• Métodos aceptados: Transferencia electrónica o pago online hasta en 3 cuotas sin interés mediante Webpay Plus (Transbank).

Adjuntamos el documento PDF formal con el detalle de alcance técnico y las firmas de aprobación.

Quedamos a su entera disposición ante cualquier consulta para dar inicio de inmediato.

Atentamente,

${issuer}
Gerente General
Agencia Vision Code SpA
RUT: 78.517.394-5
Av. La Dehesa 1822 - Oficina 705, Lo Barnechea
Teléfono: +56 9 6455 2200
contacto@vision-code.cl | www.vision-code.cl`;

    return { subject, body };
  };

  const handleSendEmailDirect = (q: Quote) => {
    const { subject, body } = getEmailContent(q);
    const to = q.clientEmail && q.clientEmail.includes('@') ? q.clientEmail : '';
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    showToast('Abriendo tu cliente de correo...');
  };

  const totalQuotesAmount = quotes.reduce((acc, q) => acc + q.total, 0);

  return (
    <div className="space-y-5 vc-fade">
      {/* Toast B&W */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-700 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner KPI Cards (Proportionate & B&W) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              Cotizaciones Emitidas
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold">Activas</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
            {quotes.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Cartera comercial Vision Code</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              Total Cotizado
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold">CLP</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
            ${totalQuotesAmount.toLocaleString('es-CL')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Valores brutos (+ IVA incluido)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              Condición de Cobro
            </span>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">50 / 50</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
            Anticipo &amp; Saldo
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Firma + entrega final verificada</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              Estilo Ejecutivo B&amp;W
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-full font-bold">A4 Oficial</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
            Formato Formal
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Blanco &amp; Negro corporativo 100%</div>
        </div>
      </div>

      {/* Control Bar (Clean B&W) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fa] p-3 rounded-2xl border border-neutral-200">
        <div>
          <div className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-tight">
            Generador Automatizado de Propuestas Comerciales
          </div>
          <div className="text-[11px] text-neutral-500">
            Emite cotizaciones ejecutivas idénticas a tu formato corporativo oficial en menos de 1 minuto.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all shadow-md ml-auto"
        >
          <I name="plus" className="w-4 h-4" />
          <span>+ Nueva Cotización Vision Code</span>
        </button>
      </div>

      {/* Quotes Table with PROPORTIONATE COLUMNS */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black" />
            Historial de Cotizaciones Emitidas
          </h3>
          <span className="text-[11px] text-neutral-400 font-medium">{quotes.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#f9fafb] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-28">N.º / Fecha</th>
                <th className="py-2.5 px-3 w-60">Cliente / Razón Social</th>
                <th className="py-2.5 px-3 min-w-[200px]">Servicios Contratados</th>
                <th className="py-2.5 px-3 w-24 text-right">Neto</th>
                <th className="py-2.5 px-3 w-28 text-right">Total (+ IVA)</th>
                <th className="py-2.5 px-3 w-32 text-center">Estado</th>
                <th className="py-2.5 px-3 w-52 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-900 font-mono text-[11px]">{q.code}</div>
                    <div className="text-[10px] text-neutral-400">{q.date}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditIssuerQuote(q);
                        setEditIssuerNameInput(q.issuerName || 'Matías Espinoza');
                      }}
                      className="text-[9.5px] font-semibold text-neutral-600 hover:text-black hover:underline truncate mt-1 flex items-center gap-1 group text-left max-w-full"
                      title="Clic para cambiar el Gerente General que emite esta cotización"
                    >
                      <I name="user" className="w-2.5 h-2.5 shrink-0 text-neutral-400 group-hover:text-black" />
                      <span className="truncate">{q.issuerName || 'Matías Espinoza'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-900 truncate" title={q.clientName}>
                      {q.clientName}
                    </div>
                    <div className="text-[10.5px] font-mono text-neutral-500">{q.clientRut}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-neutral-700 truncate" title={q.services.map((s) => s.title).join(', ')}>
                      {q.services.map((s) => s.title).join(' • ')}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{q.services.length} servicio(s) acordado(s)</div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-neutral-700">
                    ${q.subtotal.toLocaleString('es-CL')}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-neutral-900 text-xs">
                    ${q.total.toLocaleString('es-CL')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="relative inline-block">
                      <select
                        value={q.status}
                        onChange={(e) => handleUpdateStatus(q.id, e.target.value as any)}
                        className={`cursor-pointer appearance-none px-3 py-1 pr-6 rounded-full text-[10.5px] font-bold outline-none transition-all shadow-2xs border ${
                          q.status === 'Aprobada'
                            ? 'bg-black text-white border-black hover:bg-neutral-800'
                            : q.status === 'Enviada'
                            ? 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-500'
                            : q.status === 'Rechazada'
                            ? 'bg-neutral-100 text-neutral-500 border-neutral-200 line-through'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                        title="Clic para cambiar el estado"
                      >
                        <option value="Borrador" className="bg-white text-black font-semibold">Borrador</option>
                        <option value="Enviada" className="bg-white text-black font-semibold">Enviada</option>
                        <option value="Aprobada" className="bg-white text-black font-semibold">Aprobada</option>
                        <option value="Rechazada" className="bg-white text-black font-semibold">Rechazada</option>
                      </select>
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] opacity-60">▼</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    {/* Botón PDF */}
                    <button
                      type="button"
                      onClick={() => printOfficialPDF(q)}
                      className="px-2.5 py-1.5 rounded-lg bg-black text-white font-bold text-[10px] hover:bg-neutral-800 transition-all inline-flex items-center gap-1 shadow-2xs"
                      title="Generar e Imprimir PDF Oficial"
                    >
                      <I name="download" className="w-3 h-3 text-white" />
                      <span>PDF</span>
                    </button>

                    {/* Botón WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(q)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 font-bold text-[10px] hover:bg-neutral-100 transition-all inline-flex items-center gap-1 shadow-2xs"
                      title="Enviar propuesta por WhatsApp"
                    >
                      <I name="whatsapp" className="w-3 h-3 text-neutral-900" />
                      <span>WA</span>
                    </button>

                    {/* Botón Correo */}
                    <button
                      type="button"
                      onClick={() => setEmailModalQuote(q)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 font-bold text-[10px] hover:bg-neutral-100 transition-all inline-flex items-center gap-1 shadow-2xs"
                      title="Enviar propuesta vía Correo Electrónico"
                    >
                      <I name="mail" className="w-3 h-3 text-neutral-900" />
                      <span>Correo</span>
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(q.id)}
                      className="px-2 py-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors inline-flex items-center shadow-2xs"
                      title="Eliminar Cotización"
                    >
                      <I name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NUEVA COTIZACIÓN 100% B&W */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl shadow-2xl border border-neutral-300 vc-fade max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-black text-neutral-900 uppercase tracking-tight flex items-center gap-2 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-black" />
                  Nueva Propuesta &amp; Cotización Oficial
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Agencia Vision Code SpA &bull; RUT 78.517.394-5 &bull; Formato Ejecutivo B&amp;W
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              {/* Emisor / Gerente General */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <I name="user" className="w-3.5 h-3.5 text-neutral-900" />
                    <span>Gerente General que Emite la Cotización *</span>
                  </label>
                  <span className="text-[9.5px] bg-black text-white px-2 py-0.5 rounded-full font-bold">Cargo: Gerente General</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre del Gerente General (Ej. Matías Espinoza)"
                    value={issuerName}
                    onChange={(e) => {
                      setIssuerName(e.target.value);
                      try { localStorage.setItem('vc_default_issuer', e.target.value); } catch {}
                    }}
                    className="vc-input w-full text-xs font-bold"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIssuerName('Matías Espinoza');
                        try { localStorage.setItem('vc_default_issuer', 'Matías Espinoza'); } catch {}
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                        issuerName === 'Matías Espinoza' ? 'bg-black text-white border-black shadow-2xs' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      Matías Espinoza
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5">
                  El cargo será siempre <strong>Gerente General</strong>. Puedes escribir tu nombre o el de tu colega y quedará guardado para las próximas cotizaciones.
                </p>
              </div>

              {/* Sección 1: Cliente */}
              <div>
                <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider mb-2 bg-[#f3f4f6] p-1.5 border-l-4 border-black">
                  1. Ficha de Identificación del Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Empresa / Razón Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. MAREA MEDIA CONSULTING SPA"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="vc-input w-full text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">RUT Cliente</label>
                    <input
                      type="text"
                      placeholder="78.096.032-9"
                      value={clientRut}
                      onChange={(e) => setClientRut(e.target.value)}
                      className="vc-input w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Representante / Contacto</label>
                    <input
                      type="text"
                      placeholder="Nombre del interlocutor"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="vc-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="contacto@cliente.cl"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="vc-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+56 9 8765 4321"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="vc-input w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">Dirección Comercial</label>
                    <input
                      type="text"
                      placeholder="Arenales 535, Concón / Santiago"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="vc-input w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Selección de Servicios */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 bg-[#f3f4f6] p-1.5 border-l-4 border-black">
                  <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider">
                    2. Catálogo Oficial de Servicios &amp; Precios Acordados
                  </h4>
                  <span className="text-[11px] font-bold text-neutral-700">
                    {selectedServices.length} seleccionados
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                        s.selected ? 'bg-neutral-50 border-2 border-black' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[240px]">
                        <input
                          type="checkbox"
                          checked={s.selected}
                          onChange={() => handleToggleService(s.id)}
                          className="w-4 h-4 rounded-xs accent-black cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900">
                            {s.num}. {s.title}
                          </div>
                          <div className="text-[10px] text-neutral-500">Ref: {s.refPrice}</div>
                        </div>
                      </label>

                      {s.selected && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-neutral-700">Precio Acordado:</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">$</span>
                            <input
                              type="number"
                              value={s.agreedPrice}
                              onChange={(e) => handlePriceChange(s.id, Number(e.target.value))}
                              className="vc-input !py-1 !pl-6 w-28 text-xs font-black text-neutral-900 bg-white border-neutral-400"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-600 font-bold">+ IVA</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Agregar Servicio Custom */}
              <div className="p-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 space-y-2">
                <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <I name="plus" className="w-3.5 h-3.5" />
                  <span>+ Agregar Servicio Especial / Personalizado</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Título del servicio a medida"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="vc-input w-full text-xs col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Precio Acordado (CLP)"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="vc-input w-full text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-3 py-1.5 rounded-lg bg-black text-white font-bold text-[11px] hover:bg-neutral-800"
                  >
                    Agregar a la Lista
                  </button>
                </div>
              </div>

              {/* Resumen Financiero 100% B&W */}
              <div className="p-4 rounded-xl bg-black text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Acuerdo Comercial 50% / 50%</div>
                  <div className="text-xs font-semibold text-neutral-200 mt-0.5">
                    Anticipo 50%: ${Math.round(total / 2).toLocaleString('es-CL')} &bull; Saldo 50%: ${Math.round(total / 2).toLocaleString('es-CL')}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-[10px] text-neutral-400">Subtotal Neto: ${subtotal.toLocaleString('es-CL')}</div>
                    <div className="text-[10px] text-neutral-400">IVA (19%): ${iva.toLocaleString('es-CL')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold">Total Final</div>
                    <div className="text-xl font-black text-white">${total.toLocaleString('es-CL')} CLP</div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 shadow-md flex items-center gap-2"
                >
                  <I name="quote" className="w-4 h-4" />
                  <span>Guardar &amp; Generar Cotización Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINAR */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-neutral-200 vc-fade space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                <I name="trash" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">¿Eliminar cotización?</h3>
                <p className="text-xs text-neutral-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              Se eliminará permanentemente la cotización <strong className="font-mono text-neutral-900">{quotes.find(q => q.id === deleteConfirmId)?.code}</strong> de <strong>{quotes.find(q => q.id === deleteConfirmId)?.clientName}</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuote(deleteConfirmId)}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR VÍA CORREO ELECTRÓNICO */}
      {emailModalQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-neutral-200 vc-fade space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <I name="mail" className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Enviar Propuesta por Correo Electrónico</h3>
                  <p className="text-[11px] text-neutral-500">Cotización formal {emailModalQuote.code} · Vision Code SpA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalQuote(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Destinatario (Para)</label>
                <input
                  type="email"
                  value={emailModalQuote.clientEmail}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmailModalQuote({ ...emailModalQuote, clientEmail: val });
                  }}
                  placeholder="cliente@empresa.cl"
                  className="vc-input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Asunto</label>
                <input
                  type="text"
                  readOnly
                  value={getEmailContent(emailModalQuote).subject}
                  className="vc-input w-full bg-neutral-50 text-neutral-700 text-xs font-semibold cursor-default"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Cuerpo del Mensaje Formal</label>
                <textarea
                  readOnly
                  rows={9}
                  value={getEmailContent(emailModalQuote).body}
                  className="vc-input w-full font-mono text-xs bg-neutral-50 text-neutral-800 leading-relaxed cursor-default resize-y"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  const { body } = getEmailContent(emailModalQuote);
                  navigator.clipboard.writeText(body);
                  showToast('Texto del correo copiado al portapapeles.');
                }}
                className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center gap-1.5"
              >
                <I name="copy" className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmailModalQuote(null)}
                  className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendEmailDirect(emailModalQuote);
                    setEmailModalQuote(null);
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <I name="mail" className="w-3.5 h-3.5 text-white" />
                  <span>Abrir en Cliente de Correo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CAMBIAR GERENTE GENERAL EMISOR */}
      {editIssuerQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-neutral-200 vc-fade space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Cambiar Gerente General</h3>
                <p className="text-[11px] text-neutral-500">Cotización {editIssuerQuote.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditIssuerQuote(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nombre del Gerente General *</label>
              <input
                type="text"
                value={editIssuerNameInput}
                onChange={(e) => setEditIssuerNameInput(e.target.value)}
                placeholder="Ej. Matías Espinoza"
                className="vc-input w-full text-xs font-bold"
              />
              <div className="flex gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setEditIssuerNameInput('Matías Espinoza')}
                  className="px-2.5 py-1 rounded-lg border border-neutral-300 text-neutral-700 text-[10.5px] font-bold hover:bg-neutral-100"
                >
                  Matías Espinoza
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2">El cargo se mantendrá automáticamente como <strong>Gerente General</strong>.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditIssuerQuote(null)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editIssuerNameInput.trim()) return;
                  const updated = quotes.map((q) =>
                    q.id === editIssuerQuote.id ? { ...q, issuerName: editIssuerNameInput.trim() } : q
                  );
                  setQuotes(updated);
                  try { localStorage.setItem('vc_quotes_list', JSON.stringify(updated)); } catch {}
                  setEditIssuerQuote(null);
                  showToast(`Emisor de ${editIssuerQuote.code} actualizado a "${editIssuerNameInput.trim()}".`);
                }}
                className="px-5 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
