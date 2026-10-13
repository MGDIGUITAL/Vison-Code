import puppeteer from 'puppeteer-core';
import path from 'node:path';

const htmlPath = path.resolve(process.cwd(), 'scratch', 'cotizacion_marea_media.html');
const pdfPath = path.resolve(process.cwd(), 'DOCUMENTOS', 'COTIZACIONES', 'Cotizaciones reales', 'Cotizacion_Marea_Media_05102026.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Generando PDF cotización MAREA MEDIA...');

const browser = await puppeteer.launch({
  executablePath: edgePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', right: '15mm', bottom: '10mm', left: '15mm' }
});

await browser.close();
console.log('✅ PDF generado exitosamente en:', pdfPath);
