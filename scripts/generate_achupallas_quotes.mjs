import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const logoPath = path.resolve(process.cwd(), 'public', 'images', 'NAVAR TITULO.png').replace(/\\/g, '/');

const clients = [
  {
    num: 'VC-ACH-2026-001',
    fecha: 'Viernes 11/09/2026',
    fechaRaw: '11/09/2026',
    nombre: 'Luis Lara',
    rut: '12.343.252-4',
    correo: 'Luislaranaverrete@gmail.com',
    rubro: 'Servicios de construcción',
    referencia: 'Ofrece servicios de construcción y hoy trabaja solo con referencias; quiere profesionalizar su marca y la forma de ofrecer sus servicios.',
    tituloProyecto: 'Sitio Web Profesional & Presencia Digital — Servicios de Construcción',
    filename: 'Cotizacion_Luis_Lara_Achupallas',
    detalles: [
      {
        item: '01',
        nombre: 'Desarrollo de Sitio Web Profesional & Presentación Comercial',
        desc: 'Diseño web responsivo (móvil y escritorio) enfocado en empresas de construcción. Incluye sección de servicios, catálogo visual de obras/proyectos ejecutados, testimonio de clientes y botón flotante directo a WhatsApp.'
      },
      {
        item: '02',
        nombre: 'Profesionalización de Marca & Ficha Comercial Digital',
        desc: 'Estructuración y diseño de propuesta digital corporativa para que el cliente pueda presentar su marca de forma profesional a empresas y particulares, superando el esquema tradicional de solo referencias de boca en boca.'
      },
      {
        item: '03',
        nombre: 'Hosting, Dominio & Optimización SEO Inicial',
        desc: 'Configuración de servidor ultra rápido, certificado de seguridad SSL, integración de mapa de ubicación y optimización inicial en Google para búsquedas del rubro de construcción.'
      }
    ]
  },
  {
    num: 'VC-ACH-2026-002',
    fecha: 'Viernes 25/09/2026',
    fechaRaw: '25/09/2026',
    nombre: 'Constanza Lara',
    rut: '20.999.373-2',
    correo: 'Constanza.belen16@gmail.com',
    rubro: 'Joyería',
    referencia: 'Vende productos de joyería; quiere profesionalizar su marca y mostrar sus productos para llegar a más clientes.',
    tituloProyecto: 'Catálogo Digital E-Commerce & Vitrina de Joyería',
    filename: 'Cotizacion_Constanza_Lara_Achupallas',
    detalles: [
      {
        item: '01',
        nombre: 'Vitrina Virtual & Catálogo Digital de Joyería',
        desc: 'Diseño e implementación de catálogo web elegante y estilizado para exhibir joyas y accesorios. Fichas de productos con alta resolución, categorías por tipo de joya y botón de consulta/pedido por WhatsApp.'
      },
      {
        item: '02',
        nombre: 'Profesionalización de Marca & Estrategia de Captación',
        desc: 'Identidad visual digital moderna adaptable a celulares e Instagram, enfocada en proyectar exclusividad y confianza para aumentar el alcance hacia nuevos clientes.'
      },
      {
        item: '03',
        nombre: 'Hosting Rápido, Dominio & SEO Inicial',
        desc: 'Alojamiento web optimizado, certificado SSL de conexión segura y configuración de palabras clave para posicionar la marca de joyería en buscadores.'
      }
    ]
  },
  {
    num: 'VC-ACH-2026-003',
    fecha: 'Viernes 02/10/2026',
    fechaRaw: '02/10/2026',
    nombre: 'Carola Silva',
    rut: '15.777.383-2',
    correo: 'carolasilva@gmail.com',
    rubro: 'Artículos de fiesta',
    referencia: 'Vende artículos de fiesta para Navidad, Fiestas Patrias y Año Nuevo; quiere mostrar sus productos en línea.',
    tituloProyecto: 'Vitrina Virtual & Catálogo Online por Temporadas (Fiestas & Eventos)',
    filename: 'Cotizacion_Carola_Silva_Achupallas',
    detalles: [
      {
        item: '01',
        nombre: 'Catálogo Web Interactivo por Temporadas (Navidad, Fiestas Patrias, Año Nuevo)',
        desc: 'Plataforma web con categorías organizadas según la época del año (Navidad, Fiestas Patrias, Año Nuevo, Cumpleaños). Visualización clara de productos de fiesta con cotizador directo a WhatsApp.'
      },
      {
        item: '02',
        nombre: 'Exhibición Online & Catálogo Digital de Productos',
        desc: 'Diseño dinámico, festivo y de rápida navegación móvil para exhibir cotillón, decoración y artículos de celebración, permitiendo a los clientes revisar el stock en línea antes de comprar.'
      },
      {
        item: '03',
        nombre: 'Hosting, Dominio & Posicionamiento SEO Inicial',
        desc: 'Servidor optimizado para temporadas de alto tráfico, certificado de seguridad SSL y SEO básico para aparecer en búsquedas clave de artículos de fiesta.'
      }
    ]
  }
];

function generateMarkdown(c) {
  return `<div align="center">
  <img src="../../public/images/NAVAR TITULO.png" alt="Agencia Vision Code SpA Logo" width="220" />
</div>

# PROPUESTA COMERCIAL & COTIZACIÓN
**N.º:** ${c.num}  
**Programa:** Programa Emprende Achupallas (Oferta Especial)  
**Fecha de Emisión & Reunión:** ${c.fecha}  
**Validez:** 15 días  

---

## 👤 EMISOR
**Agencia Vision Code SpA**  
RUT: 78.517.394-5  
Giro: Desarrollo Web, E-commerce e Inteligencia Artificial  
Dirección: Av. La Dehesa 1822 - Oficina 705, Lo Barnechea, Santiago, Chile  
Representante: Matías Espinoza (Gerente General)  
Correo: vision.code.cl@gmail.com  
Web: www.vision-code.cl  

## 👥 CLIENTE
**Cliente:** ${c.nombre}  
**RUT:** ${c.rut}  
**Correo:** ${c.correo}  
**Rubro:** ${c.rubro}  
**Referencia:** ${c.referencia}  
**Fecha de la reunión:** ${c.fechaRaw}  

---

Estimado(a) **${c.nombre}**, en **Vision Code SpA** agradecemos su participación en el **Programa Emprende Achupallas**. Presentamos formalmente nuestra propuesta especial para el desarrollo de su plataforma digital y profesionalización de marca.

## 📦 DETALLE DE LA PROPUESTA (OFERTA ESPECIAL EMPRENDE ACHUPALLAS)

| # | DESCRIPCIÓN DEL SERVICIO | CANT. | VALOR OFERTA | SUBTOTAL |
|:---:|---|:---:|---:|---:|
${c.detalles.map(d => `| ${d.item} | **${d.nombre}**<br/>*${d.desc}* | 1 | Incluido | Incluido |`).join('\n')}
| -- | **PAQUETE COMPLETO PROGRAMA EMPRENDE ACHUPALLAS**<br/>*Desarrollo Web + Catálogo Digital + SEO + Hosting & Dominio* | 1 | $50.000 CLP | $50.000 CLP |

<br/>

<div align="right">
  <h3><b>Valor Oferta Especial: $50.000 CLP</b></h3>
  <p><i>(Sin costos ocultos • Precio preferencial Programa Emprende Achupallas)</i></p>
</div>

---

## 🚀 QUÉ INCLUYE EL SERVICIO

### **1. Plataforma Web / Catálogo Digital Responsivo**
- Interfaz 100% adaptable a teléfonos móviles, tablets y computadores.
- Navegación ultra rápida enfocada en conversión de clientes y presentación visual de alto impacto.
- Integración directa de botón flotante de WhatsApp y formulario de contacto.

### **2. Profesionalización de Marca**
- Diseño gráfico corporativo ajustado a su rubro (**${c.rubro}**).
- Organización de catálogo y propuesta de valor para generar confianza en nuevos clientes.

### **3. Hosting Rápido & Posicionamiento SEO**
- 1 año de Hosting de alta velocidad y certificado de seguridad SSL.
- Configuración de SEO inicial en Google para búsquedas de su sector.

---

## 💳 CONDICIONES DE PAGO

**ABONO INICIAL (50%)**  
**$25.000 CLP**  
*Corresponde al 50% del total para dar inicio inmediato al desarrollo y maquetación.*

**SALDO CONTRA ENTREGA (50%)**  
**$25.000 CLP**  
*Se cancela al finalizar la implementación funcional y tras la aprobación conforme del cliente.*

---

## 📜 TÉRMINOS Y CONDICIONES
1. El valor de **$50.000 CLP** corresponde a la Tarifa Preferencial del **Programa Emprende Achupallas**.
2. El proyecto se inicia tras la confirmación del abono del 50% ($25.000 CLP) y entrega del material básico (logo, fotos, datos de contacto).
3. Fecha de emisión vinculada a la fecha de reunión del cliente (**${c.fechaRaw}**).
4. La validez de esta cotización es de 15 días desde la fecha de emisión.

---

<br/><br/>
<table width="100%">
  <tr>
    <td align="center">
      ___________________________________________<br/>
      <b>Agencia Vision Code SpA</b><br/>
      Matías Espinoza — Gerente General
    </td>
    <td align="center">
      ___________________________________________<br/>
      <b>${c.nombre}</b><br/>
      Firma / Aceptación Cliente
    </td>
  </tr>
</table>
`;
}

function generateHTML(c) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cotización ${c.num} — ${c.nombre} — AGENCIA VISION CODE SpA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 10mm 12mm 10mm 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: #111827;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 10px;
      line-height: 1.4;
    }

    h1, h2, h3, h4, .font-heading {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
    }

    .header-container {
      border: 2px solid #000000;
      padding: 14px 18px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ffffff;
    }

    .header-logo-side {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-img {
      max-height: 42px;
      width: auto;
      filter: brightness(0);
    }

    .brand-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #000000;
    }

    .brand-meta {
      font-size: 8.5px;
      font-weight: 600;
      color: #374151;
      margin-top: 2px;
      line-height: 1.3;
    }

    .doc-badge {
      border: 1.5px solid #000000;
      background-color: #000000;
      color: #ffffff;
      padding: 6px 12px;
      text-align: right;
      border-radius: 3px;
    }

    .doc-badge-title {
      font-size: 10.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .doc-badge-sub {
      font-size: 8px;
      color: #E5E7EB;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
    }

    .promo-banner {
      background-color: #F3F4F6;
      border: 1.5px solid #000000;
      padding: 8px 12px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .promo-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 900;
      color: #000000;
      text-transform: uppercase;
    }

    .promo-date {
      font-size: 9px;
      font-weight: 700;
      color: #374151;
    }

    .section-title {
      font-size: 10.5px;
      font-weight: 900;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 4px 8px;
      background-color: #F9FAFB;
      border-left: 4px solid #000000;
      border-top: 1px solid #E5E7EB;
      border-right: 1px solid #E5E7EB;
      border-bottom: 1px solid #E5E7EB;
      margin-top: 10px;
      margin-bottom: 8px;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .info-table td {
      padding: 5px 8px;
      border: 1px solid #D1D5DB;
      font-size: 9.5px;
    }

    .info-label {
      font-weight: 800;
      background-color: #F9FAFB;
      width: 22%;
      text-transform: uppercase;
      font-size: 8.5px;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .detail-table th {
      background-color: #000000;
      color: #ffffff;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border: 1px solid #000000;
      text-align: left;
    }

    .detail-table td {
      padding: 6px 8px;
      border: 1px solid #D1D5DB;
      font-size: 9px;
      vertical-align: top;
    }

    .detail-table tr:nth-child(even) td {
      background-color: #F9FAFB;
    }

    .total-box {
      border: 2px solid #000000;
      background-color: #F9FAFB;
      padding: 10px 14px;
      text-align: right;
      margin-top: 10px;
      margin-bottom: 12px;
    }

    .total-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #4B5563;
    }

    .total-amount {
      font-family: 'Montserrat', sans-serif;
      font-size: 16px;
      font-weight: 900;
      color: #000000;
      margin-top: 2px;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .payment-card {
      border: 1px solid #000000;
      padding: 8px 10px;
      background-color: #ffffff;
    }

    .payment-card-title {
      font-weight: 900;
      font-size: 9px;
      text-transform: uppercase;
      color: #000000;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }

    .payment-card-price {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 800;
      color: #000000;
    }

    .terms-box {
      font-size: 8.5px;
      color: #374151;
      border: 1px solid #E5E7EB;
      padding: 8px 10px;
      background-color: #F9FAFB;
      margin-bottom: 12px;
    }

    .terms-box ol {
      margin: 3px 0 0 14px;
      padding: 0;
    }

    .terms-box li {
      margin-bottom: 2px;
    }

    .signatures-grid {
      margin-top: 15px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .signature-card {
      border: 1px solid #000000;
      padding: 10px;
      text-align: center;
      background-color: #ffffff;
    }

    .sig-line {
      border-top: 1.5px solid #000000;
      margin-top: 30px;
      padding-top: 4px;
      font-weight: 800;
      font-size: 9px;
    }
  </style>
</head>
<body>

  <!-- HEADER CORPORATIVO -->
  <div class="header-container">
    <div class="header-logo-side">
      <img src="file:///${logoPath}" alt="Agencia Vision Code SpA Logo" class="logo-img" />
      <div>
        <div class="brand-title">AGENCIA VISION CODE SpA</div>
        <div class="brand-meta">
          RUT: 78.517.394-5 &bull; Giro: Desarrollo Web, E-commerce e IA<br/>
          Av. La Dehesa 1822 - Of. 705, Lo Barnechea, Santiago &bull; www.vision-code.cl &bull; vision.code.cl@gmail.com
        </div>
      </div>
    </div>
    <div class="doc-badge">
      <div class="doc-badge-title">COTIZACIÓN FORMAL</div>
      <div class="doc-badge-sub">N.º ${c.num}</div>
    </div>
  </div>

  <!-- BANNER PROGRAMA EMPRENDE ACHUPALLAS -->
  <div class="promo-banner">
    <div>
      <div class="promo-title">OFERTA ESPECIAL — PROGRAMA EMPRENDE ACHUPALLAS</div>
      <div style="font-size: 8.5px; color: #4B5563;">Desarrollo Web &amp; Profesionalización Digital para Emprendedores</div>
    </div>
    <div style="text-align: right;">
      <div class="promo-date">Fecha de Emisión &amp; Reunión: <strong>${c.fecha}</strong></div>
      <div style="font-size: 8px; color: #6B7280;">Validez: 15 días corridos</div>
    </div>
  </div>

  <!-- SECCIÓN 1: DATOS CLIENTE -->
  <div class="section-title">1. Ficha del Cliente &amp; Antecedentes</div>

  <table class="info-table">
    <tr>
      <td class="info-label">Nombre Cliente:</td>
      <td><strong>${c.nombre}</strong></td>
      <td class="info-label">RUT Cliente:</td>
      <td><strong>${c.rut}</strong></td>
    </tr>
    <tr>
      <td class="info-label">Correo Electrónico:</td>
      <td>${c.correo}</td>
      <td class="info-label">Rubro / Actividad:</td>
      <td>${c.rubro}</td>
    </tr>
    <tr>
      <td class="info-label">Referencia del Negocio:</td>
      <td colspan="3">${c.referencia}</td>
    </tr>
    <tr>
      <td class="info-label">Fecha de Reunión:</td>
      <td><strong>${c.fechaRaw} (${c.fecha})</strong></td>
      <td class="info-label">Ejecutivo a Cargo:</td>
      <td>Matías Espinoza — Gerente General</td>
    </tr>
  </table>

  <!-- SECCIÓN 2: DETALLE DE LA PROPUESTA -->
  <div class="section-title">2. Propuesta Comercial &amp; Desglose de Servicios</div>

  <table class="detail-table">
    <thead>
      <tr>
        <th style="width: 6%;">Item</th>
        <th style="width: 64%;">Descripción del Servicio</th>
        <th style="width: 15%;">Modalidad</th>
        <th style="width: 15%; text-align: right;">Estado</th>
      </tr>
    </thead>
    <tbody>
      ${c.detalles.map(d => `
      <tr>
        <td style="font-weight: 800; text-align: center;">${d.item}</td>
        <td>
          <strong style="font-size: 9.5px; color: #000000;">${d.nombre}</strong><br/>
          <span style="color: #4B5563;">${d.desc}</span>
        </td>
        <td style="font-size: 8.5px; color: #374151;">Llave en Mano</td>
        <td style="text-align: right; font-weight: 700; color: #059669;">Incluido en Paquete</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- CUADRO DE PRECIO FINAL -->
  <div class="total-box">
    <div class="total-title">VALOR TOTAL OFERTA ESPECIAL PROGRAMA EMPRENDE ACHUPALLAS</div>
    <div class="total-amount">$50.000 CLP</div>
    <div style="font-size: 8px; color: #6B7280; margin-top: 2px;">*Precio cerrado y preferencial. Sin cobros sorpresa.</div>
  </div>

  <!-- SECCIÓN 3: CONDICIONES DE PAGO -->
  <div class="section-title">3. Estructura de Pagos (50% / 50%)</div>

  <div class="payment-grid">
    <div class="payment-card">
      <div class="payment-card-title">1. Abono Inicial de Inicio (50%)</div>
      <div class="payment-card-price">$25.000 CLP</div>
      <div style="font-size: 8px; color: #4B5563; margin-top: 2px;">Se cancela al momento de aceptar la propuesta para habilitar el desarrollo.</div>
    </div>
    <div class="payment-card">
      <div class="payment-card-title">2. Saldo Final Contra Entrega (50%)</div>
      <div class="payment-card-price">$25.000 CLP</div>
      <div style="font-size: 8px; color: #4B5563; margin-top: 2px;">Se cancela al finalizar y recibir la conformidad de la plataforma.</div>
    </div>
  </div>

  <!-- SECCIÓN 4: TÉRMINOS Y CONDICIONES -->
  <div class="section-title">4. Términos &amp; Condiciones Generales</div>
  <div class="terms-box">
    <ol>
      <li>El precio de <strong>$50.000 CLP</strong> es exclusivo para participantes del <strong>Programa Emprende Achupallas</strong>.</li>
      <li>La fecha de emisión y validez de la cotización está respaldada por la fecha de reunión formal (<strong>${c.fechaRaw}</strong>).</li>
      <li>El plazo de ejecución inicia una vez entregado el abono inicial ($25.000 CLP) y recopilada la información del negocio.</li>
      <li>Incluye 1 año de Hosting de alta velocidad y Dominio Web sin costo adicional en el desarrollo inicial.</li>
    </ol>
  </div>

  <!-- FIRMAS -->
  <div class="signatures-grid">
    <div class="signature-card">
      <div style="font-size: 8.5px; font-weight: 800; color: #374151; text-transform: uppercase;">Por Prestador de Servicios:</div>
      <div class="sig-line">AGENCIA VISION CODE SpA</div>
      <div style="font-size: 8px; color: #4B5563; margin-top: 2px;">
        RUT: 78.517.394-5 &bull; Matías Espinoza<br/>
        Gerente General &bull; vision.code.cl@gmail.com
      </div>
    </div>

    <div class="signature-card">
      <div style="font-size: 8.5px; font-weight: 800; color: #374151; text-transform: uppercase;">Por el Cliente / Aceptación:</div>
      <div class="sig-line">${c.nombre}</div>
      <div style="font-size: 8px; color: #4B5563; margin-top: 2px;">
        RUT: ${c.rut} &bull; Rubro: ${c.rubro}<br/>
        Fecha de Firma: ____ / ____ / 2026
      </div>
    </div>
  </div>

</body>
</html>`;
}

async function run() {
  console.log('🚀 Iniciando generación de cotizaciones Programa Emprende Achupallas...');

  const docsDir = path.resolve(process.cwd(), 'DOCUMENTOS', 'COTIZACIONES');
  const realPdfDir = path.resolve(docsDir, 'Cotizaciones reales');
  const scratchDir = path.resolve(process.cwd(), 'scratch');

  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  if (!fs.existsSync(realPdfDir)) fs.mkdirSync(realPdfDir, { recursive: true });
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const c of clients) {
    // 1. Save Markdown
    const mdPath = path.resolve(docsDir, `${c.filename}.md`);
    const mdContent = generateMarkdown(c);
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    console.log(`✅ Markdown creado: ${mdPath}`);

    // 2. Save HTML in scratch
    const htmlPath = path.resolve(scratchDir, `${c.filename.toLowerCase()}.html`);
    const htmlContent = generateHTML(c);
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log(`✅ HTML creado: ${htmlPath}`);

    // 3. Render PDF
    const pdfPath = path.resolve(realPdfDir, `${c.filename}.pdf`);
    const page = await browser.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '12mm',
        bottom: '10mm',
        left: '12mm'
      }
    });
    await page.close();
    console.log(`📄 PDF generado: ${pdfPath}`);
  }

  await browser.close();
  console.log('🎉 ¡Todas las 3 cotizaciones fueron generadas exitosamente!');
}

run().catch(console.error);
