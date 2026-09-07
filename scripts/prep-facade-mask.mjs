import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
const SRC = 'C:/Users/Khushi Patel/Downloads/Facade Mask - Copy.pdf';
const KEEP_DIR = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Facade Mask';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask';
mkdirSync(KEEP_DIR, { recursive: true });
mkdirSync(OUT, { recursive: true });
copyFileSync(SRC, `${KEEP_DIR}/Facade_Mask_Boards.pdf`);

// page 1 is a title sheet and page 4 is body copy, which becomes real text on
// the page rather than a picture of text
const PAGES = { 1: 'process', 2: 'strategies', 4: 'final-images' };
const doc = mupdf.Document.openDocument(readFileSync(SRC), 'application/pdf');

for (const [index, name] of Object.entries(PAGES)) {
  const pm = doc.loadPage(Number(index)).toPixmap(mupdf.Matrix.scale(3, 3), mupdf.ColorSpace.DeviceRGB, false, true);
  const png = Buffer.from(pm.asPNG());
  const g = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let x0 = g.info.width, x1 = 0, y0 = g.info.height, y1 = 0;
  for (let y = 0; y < g.info.height; y++) for (let x = 0; x < g.info.width; x++)
    if (g.data[y * g.info.width + x] < 248) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const pad = Math.round(g.info.width * 0.006);
  const box = {
    left: Math.max(0, x0 - pad), top: Math.max(0, y0 - pad),
    width: Math.min(g.info.width - Math.max(0, x0 - pad), (x1 - x0) + pad * 2),
    height: Math.min(g.info.height - Math.max(0, y0 - pad), (y1 - y0) + pad * 2)
  };
  const buf = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).extract(box)
    .resize({ width: 1500 }).jpeg({ quality: 82 }).toBuffer();
  const m = await sharp(buf).metadata();
  writeFileSync(`${OUT}/${name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
  console.log(name.padEnd(14), m.width + 'x' + m.height, (buf.length / 1024).toFixed(0) + 'KB');
}
