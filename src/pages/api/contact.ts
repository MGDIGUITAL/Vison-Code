import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// ── HTML sanitization ──
function escapeHtml(str: any): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

// ── Basic email validation ──
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const gmailUser = process.env.GMAIL_USER || import.meta.env.GMAIL_USER || 'vision.code.vs@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || import.meta.env.GMAIL_APP_PASSWORD;

    if (!gmailPass) {
      console.error('CRITICAL: GMAIL_APP_PASSWORD is not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'El servicio de correo no está configurado adecuadamente.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Parse body ──
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    }
    const { 
      tipo_cliente, 
      rango_operacion,
      rut, 
      empresa, 
      nombre_fantasia, 
      solicitante, 
      telefono, 
      telefono_empresa, 
      telefono_solicitante, 
      correo, 
      modelo_negocio, 
      nivel_capital, 
      plazo,
      servicio, 
      propuesta_detalles 
    } = body;

    // ── Required fields check ──
    const finalCorreo = correo?.trim();
    const finalSolicitante = solicitante?.trim() || empresa?.trim();
    const finalEmpresa = empresa?.trim() || nombre_fantasia?.trim() || 'Proyecto Particular';
    const finalPhone = telefono?.trim() || telefono_solicitante?.trim() || telefono_empresa?.trim() || '';

    if (!finalCorreo || !finalSolicitante || (!servicio && !propuesta_detalles)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Faltan campos obligatorios para enviar la propuesta.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Email format validation ──
    if (!isValidEmail(finalCorreo)) {
      return new Response(
        JSON.stringify({ success: false, error: 'El correo electrónico ingresado no es válido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Honeypot check (anti-spam) ──
    if (body._honeypot) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Sanitize all inputs ──
    const cleanTipoCliente = escapeHtml(tipo_cliente === 'empresa' ? 'Empresa / Persona Jurídica' : 'Persona Natural');
    const cleanRango = escapeHtml(rango_operacion || 'Emprendimiento / General');
    const cleanPlazo = escapeHtml(plazo || 'Flexible / A coordinar');
    const cleanRut = escapeHtml(rut || 'No informado');
    const cleanEmpresa = escapeHtml(finalEmpresa);
    const cleanNombreFantasia = escapeHtml(nombre_fantasia || 'No informado');
    const cleanSolicitante = escapeHtml(finalSolicitante);
    const cleanTelefono = escapeHtml(finalPhone || 'No informado');
    const cleanCorreo = escapeHtml(finalCorreo);
    const cleanModelo = escapeHtml(modelo_negocio === 'productos' ? 'Venta de Productos (E-Commerce / Retail)' : 'Venta de Servicios & B2B');
    
    let capitalLabel = 'Capital Inicial / Emprendimiento';
    if (nivel_capital === 'medio') capitalLabel = 'Capital Mediano / Empresa en Crecimiento';
    if (nivel_capital === 'alto') capitalLabel = 'Capital Alto / Nivel Corporativo';
    const cleanCapital = escapeHtml(capitalLabel);

    const cleanServicio = escapeHtml(servicio || 'Propuesta Personalizada de Servicios');
    const cleanPropuestaDetalles = escapeHtml(propuesta_detalles || '');

    // ── Embedded 1:1 Banner Image (gracias.png) ──
    const imagePath = path.join(process.cwd(), 'public', 'CORREO', 'gracias.png');
    const hasImage = fs.existsSync(imagePath);
    const attachments = hasImage ? [
      {
        filename: 'gracias.png',
        path: imagePath,
        cid: 'gracias_image'
      }
    ] : [];

    // ── Nodemailer Gmail Transporter ──
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, ''),
      },
    });

    // 1. Notificación interna para Vision Code (vision.code.vs@gmail.com)
    const adminMailOptions = {
      from: `"Vision Code Automation" <${gmailUser}>`,
      to: gmailUser,
      replyTo: cleanCorreo,
      subject: `[NUEVA COTIZACIÓN FORMAL] ${cleanSolicitante} (${cleanEmpresa}) — ${cleanServicio}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Nueva Cotización Registrada — Vision Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0b0b0b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0b0b; table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 30px 15px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #121212; border-radius: 14px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                  
                  <!-- Top Accent Bar -->
                  <tr>
                    <td height="5" style="background: linear-gradient(90deg, #ffffff, #71717a, #ffffff); font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 26px 30px; background-color: #000000; border-bottom: 1px solid #27272a;">
                      <span style="font-size: 26px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif; letter-spacing: -0.5px;">
                        VISION<span style="color: #a1a1aa;">CODE</span>
                      </span>
                      <div style="font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">
                        NUEVA COTIZACIÓN ENTRANTE DESDE EL EMBUDO WEB
                      </div>
                    </td>
                  </tr>

                  <!-- Content Body -->
                  <tr>
                    <td style="padding: 30px; background-color: #121212; color: #e4e4e7;">
                      <div style="font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                        ● NUEVO PROSPECTO LISTO PARA COTIZAR
                      </div>
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                        Desglose Completo del Requerimiento:
                      </h2>

                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 10px;">
                        <tr>
                          <td style="padding: 14px 18px; background-color: #18181b; border-left: 4px solid #ffffff; border-radius: 6px;">
                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">CLIENTE & ENTIDAD</div>
                            <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 3px;">
                              ${cleanSolicitante} <span style="font-size: 12px; font-weight: 600; color: #a1a1aa;">(${cleanTipoCliente})</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 14px 18px; background-color: #18181b; border-left: 4px solid #ffffff; border-radius: 6px;">
                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">EMPRESA / PROYECTO / RUT</div>
                            <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 3px;">
                              ${cleanEmpresa} — RUT: ${cleanRut}
                            </div>
                            ${cleanNombreFantasia !== 'No informado' ? `<div style="font-size: 12px; color: #a1a1aa; margin-top: 3px;">Fantasía: ${cleanNombreFantasia}</div>` : ''}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 14px 18px; background-color: #18181b; border-left: 4px solid #10b981; border-radius: 6px;">
                            <div style="font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">SERVICIOS SOLICITADOS (COMBO)</div>
                            <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">
                              ${cleanServicio}
                            </div>
                            ${cleanPropuestaDetalles ? `<div style="font-size: 13px; color: #d4d4d8; margin-top: 8px; white-space: pre-line; background-color: #27272a; padding: 10px; border-radius: 4px;">${cleanPropuestaDetalles}</div>` : ''}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 14px 18px; background-color: #18181b; border-left: 4px solid #ffffff; border-radius: 6px;">
                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">ESCALA, PLAZO & CAPITAL</div>
                            <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 3px; line-height: 1.6;">
                              • Escala de operación: <strong>${cleanRango}</strong><br/>
                              • Plazo estimado: <strong>${cleanPlazo}</strong><br/>
                              • Rango de inversión: <strong>${cleanCapital}</strong>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 14px 18px; background-color: #18181b; border-left: 4px solid #ffffff; border-radius: 6px;">
                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">DATOS DE CONTACTO</div>
                            <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 3px; line-height: 1.6;">
                              • Teléfono: <strong>${cleanTelefono}</strong><br/>
                              • Correo: <a href="mailto:${cleanCorreo}" style="color: #ffffff; text-decoration: underline; font-weight: bold;">${cleanCorreo}</a>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- WhatsApp Direct CTA -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 26px;">
                        <tr>
                          <td align="center">
                            <a href="https://api.whatsapp.com/send?phone=${cleanTelefono.replace(/[^0-9]/g, '')}&text=Hola%20${encodeURIComponent(cleanSolicitante)},%20te%20escribo%20de%20Vision%20Code%20respecto%20a%20tu%20cotizaci%C3%B3n" target="_blank" style="display: inline-block; background-color: #10b981; color: #000000 !important; font-family: Arial, sans-serif; font-size: 13px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px;">
                              CONTACTAR DIRECTO POR WHATSAPP &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 18px 30px; background-color: #000000; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a;">
                      Sistema Automático Vision Code — ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // 2. Correo de confirmación y agradecimiento para el Cliente (con imagen oficial y copia a Vision Code)
    const clientMailOptions = {
      from: `"Vision Code" <${gmailUser}>`,
      to: cleanCorreo,
      bcc: gmailUser, // Copia automática para respaldo del equipo Vision Code
      subject: `¡Gracias por Cotizar con Nosotros! — Desglose de Cotización (${cleanEmpresa})`,
      attachments,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Confirmación de Cotización — Vision Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 25px 15px;">
                <!-- Container Table -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 6px 25px rgba(0,0,0,0.07);">
                  
                  <!-- Top Accent Bar -->
                  <tr>
                    <td height="6" style="background-color: #000000; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>

                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 24px 30px; background-color: #000000;">
                      <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: Arial, sans-serif;">
                            VISION<span style="color: #a1a1aa;">CODE</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; padding-top: 5px; font-family: Arial, sans-serif;">
                            AGENCIA DE MARKETING DIGITAL & DESARROLLO WEB
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Body -->
                  <tr>
                    <td style="padding: 28px 28px 24px 28px; background-color: #ffffff;">
                      
                      <!-- Imagen Oficial: ¡Gracias por Cotizar con Nosotros! -->
                      ${hasImage ? `
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                          <td align="center">
                            <img src="cid:gracias_image" alt="¡Gracias por cotizar con nosotros! - Vision Code" width="540" style="width: 100%; max-width: 540px; height: auto; display: block; border-radius: 10px; border: 1px solid #e5e7eb; box-shadow: 0 4px 18px rgba(0,0,0,0.08); margin: 0 auto;" />
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #111827; line-height: 1.3; text-align: left;">
                        Hola ${cleanSolicitante},
                      </h1>
                      
                      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151; text-align: left;">
                        Agradecemos tu interés en nuestros servicios. Hemos registrado exitosamente tu solicitud de cotización formal para el proyecto <strong>${cleanEmpresa}</strong>.
                      </p>

                      <div style="background-color: #f4f4f5; border-left: 4px solid #000000; padding: 15px 18px; border-radius: 6px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; font-weight: 700; color: #18181b; line-height: 1.5;">
                          Pronto nuestro equipo técnico se comunicará contigo con una propuesta formal detallada adaptada a tu escala y requerimientos.
                        </p>
                      </div>

                      <!-- Ficha con el Desglose Completo de lo Solicitado -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #000000; border-radius: 8px; margin: 20px 0 26px 0;">
                        <tr>
                          <td style="padding: 20px 22px;">
                            <div style="font-size: 11px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                              📋 DESGLOSE DETALLADO DE TU COTIZACIÓN
                            </div>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold; width: 140px;">Empresa / Proyecto:</td>
                                <td style="padding: 5px 0; font-size: 14px; color: #111827; font-weight: 700;">${cleanEmpresa}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">RUT Registrado:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827;">${cleanRut}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Tipo de Entidad:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827;">${cleanTipoCliente}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Escala de Operación:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 700;">${cleanRango}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Servicios Solicitados:</td>
                                <td style="padding: 5px 0; font-size: 14px; color: #000000; font-weight: 800;">${cleanServicio}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Plazo Estimado:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827;">${cleanPlazo}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Rango de Inversión:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">${cleanCapital}</td>
                              </tr>
                              ${cleanPropuestaDetalles ? `
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold; vertical-align: top;">Detalles adicionales:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #374151; white-space: pre-line;">${cleanPropuestaDetalles}</td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Teléfono de Contacto:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">${cleanTelefono}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Correo Electrónico:</td>
                                <td style="padding: 5px 0; font-size: 13px; color: #111827; font-weight: 600;">${cleanCorreo}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                        Si deseas consultar avances, agendar una reunión directa o realizar preguntas técnicas antes de recibir el documento formal, puedes iniciar una conversación con nuestro equipo por WhatsApp:
                      </p>

                      <!-- CTA WhatsApp Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0 20px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://api.whatsapp.com/send?phone=56929645522&text=Hola%20Vision%20Code,%20recib%C3%AD%20la%20confirmaci%C3%B3n%20de%20cotizaci%C3%B3n%20para%20${encodeURIComponent(cleanEmpresa)}" target="_blank" style="display: inline-block; background-color: #000000; color: #ffffff !important; font-family: Arial, sans-serif; font-size: 13px; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                              CONVERSAR POR WHATSAPP DIRECTO &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 22px 30px; background-color: #000000; text-align: center; border-top: 1px solid #1f2937;">
                      <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif;">
                        VISION<span style="color: #a1a1aa;">CODE</span> SpA
                      </p>
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                        Desarrollo Web, Sistemas & Automatización Digital<br/>
                        <a href="https://www.vision-code.cl" target="_blank" style="color: #ffffff; text-decoration: underline; font-weight: bold;">www.vision-code.cl</a> | Instagram: <a href="https://www.instagram.com/vision_code_vc/" target="_blank" style="color: #ffffff; text-decoration: underline;">@vision_code_vc</a> | +56 9 2964 5522
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #71717a;">
                        Mensaje automático enviado desde ${gmailUser}. Conserva este correo como comprobante de tu solicitud.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send admin notification
    await transporter.sendMail(adminMailOptions);

    // Send client confirmation automatically with BCC to Vision Code
    try {
      await transporter.sendMail(clientMailOptions);
    } catch (clientErr) {
      console.warn('Auto-reply client email warning:', clientErr);
    }

    // Backup to Supabase DB if credentials present
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('contacts').insert([
          {
            name: cleanSolicitante,
            company: cleanEmpresa,
            email: cleanCorreo,
            phone: cleanTelefono,
            plan: cleanServicio,
            message: `Tipo: ${cleanTipoCliente} | RUT: ${cleanRut} | Fantasía: ${cleanNombreFantasia} | Modelo: ${cleanModelo} | Capital: ${cleanCapital}`,
            status: 'new',
          },
        ]);
      } catch (dbErr) {
        console.warn('Supabase insert warning:', dbErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error fatal enviando correo en /api/contact:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'No se pudo procesar la solicitud de servicio: ' + (err?.message || 'Error en servidor SMTP') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
