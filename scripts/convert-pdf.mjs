import { readFileSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createCanvas } from 'canvas';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const OUT = join(BASE, 'converted');

async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjsLib;
}

async function renderPdf(pdfPath, outputDir, name, scale = 2.0) {
  await mkdir(outputDir, { recursive: true });

  const pdfjsLib = await loadPdfjs();
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  console.log(`${name}: ${doc.numPages} pages`);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.75 });
    const outPath = join(outputDir, `page-${String(i).padStart(2, '0')}.jpg`);
    await writeFile(outPath, buffer);
    console.log(`  Page ${i}/${doc.numPages} -> ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
}

async function run() {
  // Virtuous Book
  await renderPdf(
    join(BASE, 'Additional Work/GRDS 353 Virtuous Book/KhushiPatel_McKinney_P1A_VirtuousBook.pdf.pdf'),
    join(OUT, 'virtuous-book'),
    'Virtuous Book',
    2.0
  );

  // Cookbook
  await renderPdf(
    join(BASE, 'Additional Work/GDVX 501 Cookbook/OL_202630_GDVX501_Khushi Patel_Project1.pdf'),
    join(OUT, 'cookbook'),
    'Cookbook',
    1.5  // slightly lower scale since it's a large PDF
  );
}

run().catch(console.error);
