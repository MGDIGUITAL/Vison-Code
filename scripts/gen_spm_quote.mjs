import puppeteer from 'puppeteer-core';
import path from 'node:path';

const htmlPath = path.resolve(process.cwd(), 'scratch', 'cotizacion_spm_brands.html');
const pdfPath = path.resolve(process.cwd(), 'DOCUMENTOS', 'COTIZACIONES', 'Cotizaciones reales', 'Cotizacion_SPM_Brands_v3.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Generando PDF cotización SPM BRANDS...');

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
  margin: {
    top: '10mm',
    right: '15mm',
    bottom: '10mm',
    left: '15mm'
  }
});

await browser.close();
console.log('✅ PDF generado exitosamente en:', pdfPath);
