import type { APIRoute } from 'astro';
import { createFlowPayment, getFlowConfig } from '../../../lib/flow';
import { anonClient, json } from '../../../lib/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const {
      subject,
      amount,
      email,
      name,
      phone,
      planId,
      serviceId,
      rut,
      paymentMethod,
    } = body;

    if (!subject || !amount || !email) {
      return json(
        { success: false, error: 'Faltan campos obligatorios (subject, amount, email)' },
        400
      );
    }

    const numAmount = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      return json({ success: false, error: 'Monto inválido' }, 400);
    }

    // Configuración y URLs de retorno / confirmación
    const { siteUrl, apiKey, secretKey } = getFlowConfig();

    if (!apiKey || !secretKey) {
      return json(
        {
          success: false,
          error: 'Credenciales de Flow no configuradas. Por favor ingresa FLOW_API_KEY y FLOW_SECRET_KEY en las variables de entorno.',
        },
        500
      );
    }

    // Usar la URL de la petición para asegurar compatibilidad en localhost o producción
    const origin = url.origin && !url.origin.includes('localhost') ? url.origin : (siteUrl || url.origin);
    const commerceOrder = `VC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const urlReturn = `${origin}/pago/retorno`;
    const urlConfirmation = `${origin}/api/pay/confirm`;

    const flowOrder = await createFlowPayment({
      commerceOrder,
      subject: String(subject).slice(0, 200),
      amount: numAmount,
      email: String(email).trim().toLowerCase(),
      urlConfirmation,
      urlReturn,
      paymentMethod: paymentMethod ? parseInt(paymentMethod, 10) : undefined,
      optional: {
        name: name || '',
        phone: phone || '',
        planId: planId || serviceId || '',
        rut: rut || '',
      },
    });

    // Registrar evento de checkout iniciado en Supabase si está disponible
    const sb = anonClient();
    if (sb) {
      sb.from('events').insert({
        event: 'payment_checkout_started',
        label: commerceOrder,
        path: url.pathname,
        props: {
          commerceOrder,
          flowOrder: flowOrder.flowOrder,
          token: flowOrder.token,
          amount: numAmount,
          subject,
          email,
        },
      }).then();
    }

    return json({
      success: true,
      redirectUrl: `${flowOrder.url}?token=${flowOrder.token}`,
      token: flowOrder.token,
      flowOrder: flowOrder.flowOrder,
      commerceOrder,
    });
  } catch (err: any) {
    console.error('Error al iniciar pago en Flow:', err);
    return json(
      {
        success: false,
        error: err.message || 'Error inesperado al conectar con la pasarela Flow.cl',
      },
      500
    );
  }
};
