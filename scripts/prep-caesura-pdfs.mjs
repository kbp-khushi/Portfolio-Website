import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
mkdirSync(OUT, { recursive: true });

async function renderFirstPage(filename, outname, dpi = 200, maxWidth = 2000) {
  const buf = readFileSync(join(SRC, filename));
  const doc = mupdf.Document.openDocument(buf, 'application/pdf');
  const page = doc.loadPage(0);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(dpi/72, dpi/72), mupdf.ColorSpace.DeviceRGB, false, true);
  const pngBuf = Buffer.from(pixmap.asPNG());
  const jpegBuf = await sharp(pngBuf)
    .trim({ background: '#ffffff', threshold: 10 })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${jpegBuf.toString('base64')}`;
  writeFileSync(join(OUT, `${outname}.txt`), b64);
  console.log(`${outname}: ${(b64.length/1024).toFixed(0)} KB`);
}

await renderFirstPage('Building Axo.pdf', 'exploded-axo');
await renderFirstPage('Daylighting Analysis.pdf', 'floor-plan');
await renderFirstPage('Section Perspective to Link.pdf', 'section-perspective');

console.log('Done — Caesura PDFs converted');
