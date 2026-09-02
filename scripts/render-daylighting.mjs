import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync } from 'fs';

const buf = readFileSync('../Caesura/Daylighting Analysis.pdf');
const doc = mupdf.Document.openDocument(buf, 'application/pdf');
console.log('pages:', doc.countPages());
const page = doc.loadPage(0);
const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
const png = Buffer.from(pixmap.asPNG());
await sharp(png)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .jpeg({ quality: 90 })
  .toFile('C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/79ba3c13-fa71-498e-bc3a-756cd58c6081/scratchpad/daylighting.jpg');
console.log('saved');
