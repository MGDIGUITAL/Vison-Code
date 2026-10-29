import type { APIRoute } from 'astro';
import { getFlowPaymentStatus } from '../../../lib/flow';
import { anonClient, env } from '../../../lib/server';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    let token = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      token = body.token;
    } else {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        token = String(formData.get('token') || '');
      }
    }

    if (!token) {
      console.warn('Webhook Flow recibido sin token');
      return new Response('Token no recibido', { status: 400 });
    }

    // Consultar estado oficial en Flow
    const statusData = await getFlowPaymentStatus(token);
    console.log(`[Flow Webhook] Orden ${statusData.commerceOrder} - Estado: ${statusData.status}`);

    const isPaid = statusData.status === 2;

    // Registrar en Supabase
    const sb = anonClient();
    if (sb) {
      // 1. Guardar evento
      await sb.from('events').insert({
        event: isPaid ? 'payment_success' : 'payment_status_update',
        label: statusData.commerceOrder,
        props: {
          flowOrder: statusData.flowOrder,
          commerceOrder: statusData.commerceOrder,
          status: statusData.status,
          amount: statusData.amount,
          payer: statusData.payer,
          media: statusData.paymentData?.media || 'Flow',
          subject: statusData.subject,
        },
      });

      // 2. Si está pagada, actualizar o registrar contacto en el CRM
      if (isPaid) {
        const { data: existingContact } = await sb
          .from('contacts')
          .select('id')
          .eq('email', statusData.payer)
          .maybeSingle();

        if (existingContact) {
          await sb
            .from('contacts')
            .update({
              stage: 'ganado',
              value: statusData.amount,
              notes: `Pago Flow confirmado: ${statusData.commerceOrder} ($${statusData.amount.toLocaleString('es-CL')} CLP)`,
            })
            .eq('id', existingContact.id);
        } else {
          let opt: any = {};
          try {
            opt = statusData.optional ? JSON.parse(statusData.optional) : {};
          } catch {}

          await sb.from('contacts').insert({
            name: opt.name || statusData.payer.split('@')[0],
            email: statusData.payer,
            phone: opt.phone || '',
            plan: statusData.subject,
            stage: 'ganado',
            value: statusData.amount,
            source: 'web_flow',
            notes: `Pago Flow ID: ${statusData.commerceOrder} / Medio: ${statusData.paymentData?.media || 'Online'}`,
          });
        }
      }
    }

    // 3. Si el pago fue aprobado, enviar alerta por email a Vision Code
    if (isPaid) {
      const gmailUser = env('GMAIL_USER') || 'vision.code.vs@gmail.com';
      const gmailPass = env('GMAIL_APP_PASSWORD');

      if (gmailPass) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmailUser,
              pass: gmailPass,
            },
          });

          let opt: any = {};
          try {
            opt = statusData.optional ? JSON.parse(statusData.optional) : {};
          } catch {}

          await transporter.sendMail({
            from: `"Vision Code Pagos" <${gmailUser}>`,
            to: ['vision.code.vs@gmail.com', 'vision.code.cl@gmail.com'],
            subject: `💰 ¡PAGO CONFIRMADO FLOW! - $${statusData.amount.toLocaleString('es-CL')} CLP - ${statusData.subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #0b0b0b; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid #222;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #b8dd2e; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">¡Nuevo Pago Confirmado!</h1>
                  <p style="color: #888888; font-size: 13px; margin-top: 6px;">Pasarela Flow.cl · Vision Code SpA</p>
                </div>
                
                <div style="background-color: #161616; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #b8dd2e;">
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Servicio / Plan:</strong> <span style="color: #ffffff;">${statusData.subject}</span></p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Monto Pagado:</strong> <span style="color: #b8dd2e; font-size: 18px; font-weight: bold;">$${statusData.amount.toLocaleString('es-CL')} CLP</span></p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Cliente / Pagador:</strong> <span style="color: #ffffff;">${statusData.payer}</span></p>
                  ${opt.name ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Nombre:</strong> ${opt.name}</p>` : ''}
                  ${opt.phone ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Teléfono:</strong> <a href="https://wa.me/${opt.phone.replace(/[^0-9]/g, '')}" style="color: #25d366;">${opt.phone} (Abrir WhatsApp)</a></p>` : ''}
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Medio de Pago:</strong> ${statusData.paymentData?.media || 'Tarjeta / Webpay'}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Orden Comercio:</strong> ${statusData.commerceOrder}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Orden Flow:</strong> #${statusData.flowOrder}</p>
                  <p style="margin: 6px 0; font-size: 14px;"><strong>Fecha:</strong> ${statusData.paymentData?.date || statusData.requestDate}</p>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://vision-code.cl/admin" style="background-color: #ffffff; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 13px; text-transform: uppercase;">Ir al Panel de Administración</a>
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('Error enviando notificación por email de pago:', mailErr);
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    console.error('Error procesando webhook de Flow:', err);
    return new Response('Error procesando confirmación', { status: 500 });
  }
};
