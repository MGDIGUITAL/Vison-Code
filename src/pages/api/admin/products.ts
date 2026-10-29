import type { APIRoute } from 'astro';
import { requireAdmin, json } from '../../../lib/server';

export const prerender = false;

export interface ProductConfig {
  id: string;
  name: string;
  subtitle: string;
  category: 'web' | 'legal' | 'ecommerce' | 'software-ia' | 'mensuales' | 'promociones';
  categoryLabel: string;
  price: number; // Precio final en CLP
  originalPrice: number; // Precio regular inflado en CLP
  discount: string; // ej. "50% OFF"
  unit: string; // ej. "CLP", "CLP / mes", "A Medida"
  badge: string; // ej. "CUPOS LIMITADOS", "MÁS POPULAR", "ESENCIAL"
  isRecommended: boolean;
  isActive: boolean; // Control de disponibilidad
  cupos: string; // ej. "Cupos Limitados", "5 Cupos", "Ilimitado"
  delivery: string;
  desc: string;
  features: string[];
  waMessage: string;
}

export const DEFAULT_CATALOG: ProductConfig[] = [
  // ── DESARROLLO WEB & LEGAL ──
  {
    id: "empresa-en-un-dia",
    name: "Empresa en un Día",
    subtitle: "Formalización Completa SII",
    category: "legal",
    categoryLabel: "Constitución & Legal",
    price: 100000,
    originalPrice: 200000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "INICIO SEGURO",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "48 a 72 hrs",
    desc: "Constitución de sociedad SpA o EIRL, RUT en el SII, inicio de actividades y factura electrónica lista.",
    features: [
      "Constitución en Registro de Empresas",
      "Obtención oficial de RUT en el SII",
      "Inicio de Actividades en 1ª Categoría",
      "Certificado Digital tributario por 1 año",
      "Factura y Boleta Electrónica habilitada"
    ],
    waMessage: "Hola Vision Code, me interesa el servicio Empresa en un Día ($100.000 CLP)."
  },
  {
    id: "landing-basica",
    name: "Landing Page Express",
    subtitle: "Página de Alta Conversión",
    category: "web",
    categoryLabel: "Desarrollo Web",
    price: 180000,
    originalPrice: 360000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "OFERTA PYME",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "5 a 7 días hábiles",
    desc: "Página web de 1 a 3 secciones de ultra velocidad orientada 100% a convertir visitantes en ventas.",
    features: [
      "1 a 3 secciones de alta conversión",
      "Hosting Ultra Rápido + Dominio .CL (1 año)",
      "Botón directo a WhatsApp y formulario",
      "Optimización SEO inicial para Google"
    ],
    waMessage: "Hola Vision Code, quiero cotizar la Landing Page Express ($180.000 CLP)."
  },
  {
    id: "landing-portal-corporativo",
    name: "Portal Web Corporativo",
    subtitle: "Sitio Institucional B2B (Hasta 6 Secciones)",
    category: "web",
    categoryLabel: "Desarrollo Web",
    price: 250000,
    originalPrice: 500000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "B2B RECOMENDADO",
    isRecommended: true,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "10 días hábiles",
    desc: "Sitio web corporativo de alto estándar para posicionar tu marca institucional y captar clientes calificados.",
    features: [
      "Hasta 6 páginas internas completas",
      "Diseño exclusivo adaptado a la identidad de marca",
      "Optimización SEO avanzada y Google Analytics 4",
      "Píxel de Meta instalado y verificado"
    ],
    waMessage: "Hola Vision Code, quiero cotizar el Portal Web Corporativo ($250.000 CLP)."
  },

  // ── E-COMMERCE ──
  {
    id: "ecommerce-basico",
    name: "E-Commerce Básico",
    subtitle: "Tienda Inicial (Hasta 20 Productos)",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    price: 260000,
    originalPrice: 520000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "TIENDA INICIAL",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "7 días hábiles",
    desc: "Tu tienda virtual inicial para comenzar a vender tus productos en internet rápidamente con pasarelas de pago.",
    features: [
      "Catálogo de hasta 20 productos simples",
      "Pasarelas de pago Webpay Plus y Mercado Pago",
      "Carrito de compras integrado y seguro",
      "Panel de gestión de pedidos y ventas"
    ],
    waMessage: "Hola Vision Code, quiero cotizar el E-Commerce Básico ($260.000 CLP)."
  },
  {
    id: "ecommerce-intermedio",
    name: "E-Commerce Intermedio",
    subtitle: "Tienda Online (Hasta 40 Productos)",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    price: 280000,
    originalPrice: 560000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "MÁS POPULAR",
    isRecommended: true,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "10 días hábiles",
    desc: "Ideal para marcas en crecimiento: control de stock inteligente y cálculo de costos de envío por región.",
    features: [
      "Catálogo de hasta 40 productos con variaciones",
      "Control de stock inteligente con alertas de quiebre",
      "Cálculo de envíos diferenciado por región o comuna",
      "Pasarelas de pago Webpay Plus y Mercado Pago"
    ],
    waMessage: "Hola Vision Code, quiero cotizar el E-Commerce Intermedio ($280.000 CLP)."
  },
  {
    id: "ecommerce-profesional",
    name: "E-Commerce Profesional",
    subtitle: "Catálogo Ilimitado & Logística",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    price: 390000,
    originalPrice: 780000,
    discount: "50% OFF",
    unit: "CLP",
    badge: "SIN LÍMITES",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "14 días hábiles",
    desc: "Tienda online a medida sin límites de productos ni categorías, con variantes complejas y seguimiento automatizado.",
    features: [
      "Catálogo ilimitado de productos y variantes (tallas/colores)",
      "Seguimiento automático de envíos con Starken y Chilexpress",
      "Pasarelas de pago completas (Webpay, Mercado Pago)",
      "Sistema de cupones de descuento y promociones"
    ],
    waMessage: "Hola Vision Code, quiero cotizar el E-Commerce Profesional ($390.000 CLP)."
  },

  // ── SOFTWARE, APPS & IA ──
  {
    id: "agente-ia-whatsapp",
    name: "Agente IA WhatsApp 24/7",
    subtitle: "Atención y Ventas Automatizadas",
    category: "software-ia",
    categoryLabel: "Automatización",
    price: 0,
    originalPrice: 0,
    discount: "A Medida",
    unit: "A Cotizar",
    badge: "IA AUTOMATIZADA",
    isRecommended: true,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "5 a 10 días hábiles",
    desc: "Asistente inteligente con IA entrenado con el catálogo de tu empresa para responder y cualificar clientes sin descanso.",
    features: [
      "Respuestas automáticas fluidas 24/7 sin esperas",
      "Entrenado con información, precios y preguntas frecuentes",
      "Cualificación automática de prospectos comerciales",
      "Integración oficial con WhatsApp Cloud API"
    ],
    waMessage: "Hola Vision Code, quiero cotizar un Agente de IA para WhatsApp."
  },
  {
    id: "apps-moviles",
    name: "Apps Móviles (iOS & Android)",
    subtitle: "Aplicaciones Nativas & Híbridas",
    category: "software-ia",
    categoryLabel: "Software",
    price: 0,
    originalPrice: 0,
    discount: "A Medida",
    unit: "A Cotizar",
    badge: "MÓVIL NATIVO",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "Según alcance",
    desc: "Creación y publicación de aplicaciones móviles en App Store y Google Play con notificaciones push y pasarelas de pago.",
    features: [
      "Desarrollo para App Store (Apple) y Google Play (Android)",
      "Sistema de notificaciones push automáticas",
      "Pasarelas de pago dentro de la app móvil"
    ],
    waMessage: "Hola Vision Code, quiero cotizar una App Móvil."
  },
  {
    id: "campanas-meta-ads",
    name: "Campañas en Meta Ads",
    subtitle: "Publicidad en Facebook & Instagram",
    category: "software-ia",
    categoryLabel: "Marketing",
    price: 0,
    originalPrice: 0,
    discount: "Gestión Mensual",
    unit: "A Cotizar",
    badge: "CONVERSIÓN",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "Lanzamiento 48 hrs",
    desc: "Estrategias de alta rentabilidad en Meta Ads para llevar prospectos directos a tu WhatsApp o tienda online.",
    features: [
      "Estrategia de captación y segmentación de audiencias",
      "Diseño de creativos y copys persuasivos de alto impacto",
      "Configuración de Píxel de Meta y API Conversiones (CAPI)"
    ],
    waMessage: "Hola Vision Code, quiero cotizar Campañas en Meta Ads."
  },

  // ── PLANES MENSUALES (MRR) ──
  {
    id: "plan-vision-core",
    name: "Plan VISION CORE",
    subtitle: "Mantenimiento, SEO & Seguridad Activa",
    category: "mensuales",
    categoryLabel: "Suscripción",
    price: 29990,
    originalPrice: 59980,
    discount: "50% OFF",
    unit: "CLP / mes",
    badge: "ESENCIAL",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "Servicio Mensual",
    desc: "Diseñado para empresas que exigen plataforma blindada, carga ultra veloz y posicionamiento en Google.",
    features: [
      "Suite SaaS VC·OS Analytics de tráfico y clics WhatsApp",
      "Optimización de SEO Técnico e indexación Google",
      "Infraestructura Cloud de Alta Velocidad y SSL",
      "Copias de seguridad semanales automatizadas",
      "1 requerimiento mensual de mantenimiento o contenido"
    ],
    waMessage: "Hola Vision Code, quiero contratar el Plan VISION CORE ($29.990 CLP/mes)."
  },
  {
    id: "plan-vision-scale",
    name: "Plan VISION SCALE",
    subtitle: "Gestión Comercial, Catálogo & Conversión",
    category: "mensuales",
    categoryLabel: "Suscripción",
    price: 59990,
    originalPrice: 119980,
    discount: "50% OFF",
    unit: "CLP / mes",
    badge: "CRECIMIENTO",
    isRecommended: true,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "Servicio Mensual",
    desc: "La solución definitiva para marcas que demandan rotación ágil de inventario, campañas activas y soporte continuo.",
    features: [
      "Todo lo incluido en el Plan Vision Core",
      "Gestión activa de catálogo: hasta 15 productos al mes",
      "Diseño publicitario profesional de banners",
      "Suite SaaS de Gestión Comercial (CRM de prospectos)",
      "Soporte preferencial vía WhatsApp Business"
    ],
    waMessage: "Hola Vision Code, quiero contratar el Plan VISION SCALE ($59.990 CLP/mes)."
  },
  {
    id: "plan-partner-pro",
    name: "Plan PARTNER PRO",
    subtitle: "Socio Tecnológico Integral & Meta Ads",
    category: "mensuales",
    categoryLabel: "Suscripción",
    price: 119990,
    originalPrice: 239980,
    discount: "50% OFF",
    unit: "CLP / mes",
    badge: "PARTNER",
    isRecommended: false,
    isActive: true,
    cupos: "Cupos Disponibles",
    delivery: "Servicio Mensual",
    desc: "Tu departamento externo de tecnología y marketing digital de alto rendimiento: desarrollo continuo y Meta Ads.",
    features: [
      "Todo lo incluido en el Plan Vision Scale",
      "Partner Tecnológico: desarrollo continuo de funciones y páginas",
      "Gestión de Campañas Publicitarias en Meta Ads",
      "Suite SaaS Enterprise & ERP Integral de stock",
      "Mesa de soporte VIP 24/7 con Tech Lead exclusivo"
    ],
    waMessage: "Hola Vision Code, quiero contratar el Plan PARTNER PRO ($119.990 CLP/mes)."
  },

  // ── PACKS PROMOCIONALES ──
  {
    id: "pack-emprendimiento",
    name: "Pack Promocional Emprendimiento",
    subtitle: "Landing + SaaS + 1er Mes Core",
    category: "promociones",
    categoryLabel: "Pack Oferta",
    price: 210000,
    originalPrice: 420000,
    discount: "50% OFF",
    unit: "CLP (Pago Único)",
    badge: "5 CUPOS / MES",
    isRecommended: false,
    isActive: true,
    cupos: "5 Cupos / Mes",
    delivery: "5 a 7 días hábiles",
    desc: "Landing Corporativa de ultra velocidad + Sistema SaaS de flujo + 1er mes de Plan Vision Core de regalo.",
    features: [
      "Landing Page Corporativa de ultra velocidad",
      "Hosting Ultra Rápido + Dominio .CL por 1 año",
      "Formulario interactivo y botón flotante WhatsApp",
      "Sistema SaaS de Flujo: visitas y clics WhatsApp",
      "1er Mes GRATIS del Plan Vision Core ($29.990/mes)"
    ],
    waMessage: "Hola Vision Code, quiero reservar el Pack Promocional Emprendimiento ($210.000 CLP)."
  },
  {
    id: "pack-pyme",
    name: "Pack Promocional Pyme",
    subtitle: "E-Commerce O Portal + SaaS + 1er Mes Scale",
    category: "promociones",
    categoryLabel: "Pack Oferta",
    price: 260000,
    originalPrice: 520000,
    discount: "50% OFF",
    unit: "CLP (Pago Único)",
    badge: "CUPOS LIMITADOS",
    isRecommended: true,
    isActive: true,
    cupos: "Cupos Limitados",
    delivery: "10 días hábiles",
    desc: "A elección: Tienda online o Portal B2B con software SaaS y 1er mes de Plan Vision Scale de regalo.",
    features: [
      "A ELECCIÓN: E-Commerce Intermedio O Portal Corporativo B2B",
      "Control de inventario con alertas de stock y envíos",
      "Configuración oficial de Píxel de Meta & CAPI",
      "Sistema SaaS de Administración de prospectos",
      "1er Mes GRATIS del Plan Vision Scale ($59.990/mes)"
    ],
    waMessage: "Hola Vision Code, quiero reservar el Pack Promocional Pyme ($260.000 CLP)."
  },
  {
    id: "pack-corporativo",
    name: "Pack Promocional Corporativo",
    subtitle: "E-Commerce Pro + Meta Ads + ERP + 1er Mes Partner",
    category: "promociones",
    categoryLabel: "Pack Oferta",
    price: 310000,
    originalPrice: 620000,
    discount: "50% OFF",
    unit: "CLP (Pago Único)",
    badge: "SOLO 2 CUPOS · ESCALA TOTAL",
    isRecommended: false,
    isActive: true,
    cupos: "Solo 2 Cupos",
    delivery: "14 días hábiles",
    desc: "Ecosistema total de ventas: tienda online sin límites, campaña en Meta Ads montada y ERP de productos.",
    features: [
      "E-Commerce Profesional Ilimitado con matriz tallas/colores",
      "Integración logística automática Starken/Chilexpress",
      "Campaña completa en Meta Ads montada y optimizada",
      "Sistema SaaS & ERP de Gestión de Stock y Ventas",
      "1er Mes GRATIS del Plan Partner Pro ($119.990/mes)"
    ],
    waMessage: "Hola Vision Code, quiero postular al Pack Promocional Corporativo ($310.000 CLP)."
  }
];

// In-memory runtime cache for seamless updates
let catalogStore: ProductConfig[] = [...DEFAULT_CATALOG];

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  return json({
    ok: true,
    count: catalogStore.length,
    catalog: catalogStore,
    updatedAt: new Date().toISOString()
  });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  try {
    const body = await request.json();

    // Reset to defaults
    if (body.action === 'reset') {
      catalogStore = [...DEFAULT_CATALOG];
      return json({ ok: true, message: 'Catálogo restablecido con éxito', catalog: catalogStore });
    }

    // Bulk save
    if (Array.isArray(body.catalog)) {
      catalogStore = body.catalog;
      return json({ ok: true, message: 'Catálogo actualizado con éxito', count: catalogStore.length, catalog: catalogStore });
    }

    // Single item update
    if (body.product && body.product.id) {
      const idx = catalogStore.findIndex(p => p.id === body.product.id);
      if (idx !== -1) {
        catalogStore[idx] = { ...catalogStore[idx], ...body.product };
      } else {
        catalogStore.unshift(body.product);
      }
      return json({ ok: true, message: 'Producto guardado correctamente', product: catalogStore[idx] || body.product });
    }

    return json({ ok: false, error: 'Formato de solicitud no válido' }, 400);
  } catch (err: any) {
    return json({ ok: false, error: err.message || 'Error al procesar solicitud' }, 500);
  }
};
