import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const apiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
if (!apiKey) console.error("CRITICAL: RESEND_API_KEY is missing or undefined!");

const resend = new Resend(apiKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { empresa, telefono_empresa, solicitante, telefono_solicitante, correo, servicio } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'VisionCode <onboarding@resend.dev>',
      to: 'vision.code.vs@gmail.com',
      subject: `Nueva solicitud — ${servicio}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0a0a0a;color:#ffffff;border:1px solid #8B1A2B;border-radius:8px;">
          <h2 style="color:#8B1A2B;">Nueva solicitud de servicio 🚀</h2>
          <p><strong>🏢 Empresa/Negocio:</strong> ${empresa}</p>
          <p><strong>☎️ Teléfono Empresa:</strong> ${telefono_empresa}</p>
          <p><strong>👤 Solicitante:</strong> ${solicitante}</p>
          <p><strong>📱 Teléfono Solicitante:</strong> ${telefono_solicitante}</p>
          <p><strong>📧 Correo:</strong> ${correo}</p>
          <p><strong>💼 Servicio:</strong> ${servicio}</p>
          <hr style="border-color:#8B1A2B;margin:24px 0;"/>
          <p style="color:#666;font-size:12px;">Lead generado desde vision-code.cl</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("Error fatal en el endpoint /api/contact:", err);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), { status: 500 });
  }
};
