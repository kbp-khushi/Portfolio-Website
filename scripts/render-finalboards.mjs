import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync } from 'fs';

const buf = readFileSync('../Caesura/Final Boards.pdf');
const doc = mupdf.Document.openDocument(buf, 'application/pdf');
const n = doc.countPages();
console.log('pages:', n);
for (let i = 0; i < n; i++) {
  const page = doc.loadPage(i);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(0.6, 0.6), mupdf.ColorSpace.DeviceRGB, false, true);
  const png = Buffer.from(pixmap.asPNG());
  await sharp(png)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 85 })
    .toFile(`C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/79ba3c13-fa71-498e-bc3a-756cd58c6081/scratchpad/finalboard-${i}.jpg`);
}
console.log('saved all pages');
