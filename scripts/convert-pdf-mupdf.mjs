import * as mupdf from 'mupdf';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const OUT = join(BASE, 'converted');

function renderPdf(pdfPath, outputDir, name, dpi = 150) {
  mkdirSync(outputDir, { recursive: true });

  const buf = readFileSync(pdfPath);
  const doc = mupdf.Document.openDocument(buf, 'application/pdf');
  const pageCount = doc.countPages();
  console.log(`${name}: ${pageCount} pages`);

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(dpi / 72, dpi / 72),
      mupdf.ColorSpace.DeviceRGB,
      false,
      true
    );

    const pngBuf = pixmap.asPNG();
    const outPath = join(outputDir, `page-${String(i + 1).padStart(2, '0')}.jpg`);

    // Convert PNG to JPEG via sharp for smaller size
    const jpegBuf = sharp(Buffer.from(pngBuf))
      .jpeg({ quality: 80 })
      .toBuffer()
      .then(buf => {
        writeFileSync(outPath, buf);
        console.log(`  Page ${i + 1}/${pageCount} -> ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`);
      });

    // Wait synchronously by using a different approach
  }
}

async function renderPdfAsync(pdfPath, outputDir, name, dpi = 150) {
  mkdirSync(outputDir, { recursive: true });

  const buf = readFileSync(pdfPath);
  const doc = mupdf.Document.openDocument(buf, 'application/pdf');
  const pageCount = doc.countPages();
  console.log(`${name}: ${pageCount} pages`);

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(dpi / 72, dpi / 72),
      mupdf.ColorSpace.DeviceRGB,
      false,
      true
    );

    const pngBuf = pixmap.asPNG();
    const outPath = join(outputDir, `page-${String(i + 1).padStart(2, '0')}.jpg`);

    const jpegBuf = await sharp(Buffer.from(pngBuf)).jpeg({ quality: 80 }).toBuffer();
    writeFileSync(outPath, jpegBuf);
    console.log(`  Page ${i + 1}/${pageCount} -> ${outPath} (${(jpegBuf.length / 1024).toFixed(0)} KB)`);
  }
}

async function run() {
  await renderPdfAsync(
    join(BASE, 'Additional Work/GRDS 353 Virtuous Book/KhushiPatel_McKinney_P1A_VirtuousBook.pdf.pdf'),
    join(OUT, 'virtuous-book'),
    'Virtuous Book',
    200
  );

  await renderPdfAsync(
    join(BASE, 'Additional Work/GDVX 501 Cookbook/OL_202630_GDVX501_Khushi Patel_Project1.pdf'),
    join(OUT, 'cookbook'),
    'Cookbook',
    150
  );
}

run().catch(console.error);
