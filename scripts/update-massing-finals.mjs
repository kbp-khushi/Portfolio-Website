import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const SRC = join(BASE, 'Model Pictures/ARCH 727 Massing Model');
const CONVERTED_OUT = join(BASE, 'converted/massing-model/finals');
const B64_OUT = join(BASE, 'base64/massing-model/finals');

const ACCENT = { r: 245, g: 242, b: 238 }; // #F5F2EE (matches top bar)

mkdirSync(CONVERTED_OUT, { recursive: true });
mkdirSync(B64_OUT, { recursive: true });

const pdfs = readdirSync(SRC).filter(f => f.endsWith('.pdf')).sort();
console.log(`Found ${pdfs.length} PDF finals:`, pdfs);

for (const pdf of pdfs) {
  const name = pdf.replace('.pdf', '').replace(/\s+/g, '-');
  const pdfPath = join(SRC, pdf);

  const buf = readFileSync(pdfPath);
  const doc = mupdf.Document.openDocument(buf, 'application/pdf');
  const page = doc.loadPage(0);

  const scale = 72 / 72;
  const pixmap = page.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB,
    true,
    true
  );
  const pngBuf = Buffer.from(pixmap.asPNG());

  const jpegBuf = await sharp(pngBuf)
    .flatten({ background: ACCENT })
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  writeFileSync(join(CONVERTED_OUT, `${name}.jpg`), jpegBuf);

  const b64 = `data:image/jpeg;base64,${jpegBuf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${name}.txt`), b64);

  console.log(`${name}: ${(jpegBuf.length / 1024).toFixed(0)} KB jpg, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

console.log('Done — massing model finals converted with accent background');
