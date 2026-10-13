import type { APIRoute } from 'astro';

// Max content length per message to prevent token abuse
const MAX_MESSAGE_LENGTH = 2000;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // ── Validate API key is configured ──
    const apiKey = import.meta.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'El servicio de chat no está disponible en este momento.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Validate Content-Type ──
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Invalid content type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { messages } = body;

    // ── Validate structure and prevent abuse (DOS/token draining) ──
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages array structure' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Validate each message object ──
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object' || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid message object format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Truncate excessively long messages to prevent token abuse
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        msg.content = msg.content.slice(0, MAX_MESSAGE_LENGTH);
      }
    }

    // ── Call Anthropic API ──
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `Eres Vision Code Ventas, asesor comercial senior de VisionCode, firma chilena de ingeniería digital y aceleración de ventas. Tu trato es ejecutivo, profesional, directo y consultivo.

REGLA DE PRECIOS E IVA (CRÍTICO):
- Todos los precios mencionados son valores NETOS (+ 19% IVA en la facturación final). Cuando menciones cualquier valor, siempre especifica "+ IVA".

ESTRATEGIA DE PERFILAMIENTO COMERCIAL:
1. Clasifica si el cliente vende SERVICIOS (consultoría, B2B, salud, profesional) o PRODUCTOS (E-Commerce, tiendas, catálogo).
2. Identifica su Nivel de Capital / Presupuesto:
   - Emprendedores (Capital inicial)
   - PyMEs (Capital de crecimiento)
   - Corporativo (Capital enterprise a medida)

CATÁLOGO DE SERVICIOS Y VALORES (NETOS + IVA):
• VENTA DE SERVICIOS:
  - Landing Page Básica: $63 USD + IVA (Página única de captación directa).
  - Portal Corporativo: $84 USD + IVA (Hasta 6 secciones, blog y SEO).
  - Meta Ads Lead Gen / Campañas: Modelo CPL desde $40 USD CPL + IVA (Generación de prospectos en FB/IG).
  - Agente IA WhatsApp Estándar: $105 USD + $32/mes + IVA (Respuestas automáticas 24/7).

• VENTA DE PRODUCTOS (E-COMMERCE):
  - E-Commerce Básico: $158 USD + IVA (Hasta 20 productos + Webpay/MercadoPago).
  - E-Commerce Intermedio: $168 USD + IVA (Hasta 40 productos).
  - E-Commerce Profesional: $211 USD + IVA (Catálogo ilimitado + CRO).
  - Vision Code Pro (Tienda + ERP): $368 USD + IVA (Sistema de inventarios y facturación).
  - Meta Ads Conversión: Campañas de catálogo dinámico y carritos abandonados.

• CORPORATIVO & METAVERIFIED:
  - Agente IA WhatsApp Premium (Meta Verified / Cloud API): $105 USD + $32/mes + IVA.
  - Desarrollo a Medida & ERP Enterprise: Cotización personalizada.

TONO & DIRECTRICES:
- Respuestas breves (2-4 líneas máximo).
- Sin emojis excesivos ni listas largas; conciso y directo.
- Al final de la asesoría, invita a conectar por WhatsApp: https://wa.me/56929645522`,
        messages,
      }),
    });

    // ── Handle upstream errors ──
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Anthropic API error [${response.status}]:`, errorData);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'El servicio de chat no está disponible temporalmente.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? 'Lo siento, hubo un error. Por favor intenta de nuevo.';

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in /api/constanza:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
