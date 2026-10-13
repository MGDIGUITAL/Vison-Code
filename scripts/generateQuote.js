import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const markdownpdf = require('markdown-pdf');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Uso: node generateQuote.js <archivo_entrada.md> <archivo_salida.pdf>");
  process.exit(1);
}

const options = {
  paperBorder: "2cm",
  cssPath: "scripts/pdf-style.css"
};

markdownpdf(options).from(inputPath).to(outputPath, function () {
  console.log("PDF generado exitosamente en: " + outputPath);
});
