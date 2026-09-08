import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Facade Mask/Facade_Mask_Boards.pdf';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask';

// page index 3 holds the three photographs of the mask worn; index 4 is the
// body copy, which is already set as real text on the page
const doc = mupdf.Document.openDocument(readFileSync(SRC), 'application/pdf');
const pm = doc.loadPage(3).toPixmap(mupdf.Matrix.scale(3, 3), mupdf.ColorSpace.DeviceRGB, false, true);
const png = Buffer.from(pm.asPNG());
const meta = await sharp(png).metadata();

// find the three photographs by looking for columns that carry image content
const g = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).greyscale().raw().toBuffer({ resolveWithObject: true });
const colInk = [];
for (let x = 0; x < g.info.width; x++) {
  let ink = 0;
  for (let y = 0; y < g.info.height; y++) if (g.data[y * g.info.width + x] < 245) ink++;
  colInk.push(ink);
}
const MIN = g.info.height * 0.15;
const bands = [];
let s = -1;
for (let x = 0; x < colInk.length; x++) {
  if (colInk[x] > MIN && s === -1) s = x;
  if ((colInk[x] <= MIN || x === colInk.length - 1) && s !== -1) { if (x - s > g.info.width * 0.08) bands.push([s, x]); s = -1; }
}
console.log('photo columns found:', bands.length, bands.map(b => `${b[0]}-${b[1]}`).join(', '));
if (bands.length !== 3) throw new Error(`expected 3 photographs, found ${bands.length}`);

// the three photographs sit in a row on one baseline, so take the vertical
// bounds from the first and apply them to all; the third column otherwise
// sweeps in the sheet's own "Final Images" caption underneath it
const vertical = (x0, x1) => {
  let y0 = g.info.height, y1 = 0;
  for (let y = 0; y < g.info.height; y++) {
    for (let x = x0; x < x1; x++) if (g.data[y * g.info.width + x] < 245) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
  }
  return [y0, y1];
};
const [baseY0, baseY1] = vertical(bands[0][0], bands[0][1]);
console.log('shared vertical bounds:', baseY0, baseY1);

let n = 0;
for (const [x0, x1] of bands) {
  const box = { left: x0, top: baseY0, width: x1 - x0, height: baseY1 - baseY0 };
  const buf = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).extract(box)
    .resize({ width: 900 }).jpeg({ quality: 84 }).toBuffer();
  n += 1;
  writeFileSync(`${OUT}/final-${n}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
  const m = await sharp(buf).metadata();
  console.log(`final-${n}:`, m.width + 'x' + m.height, (buf.length / 1024).toFixed(0) + 'KB');
}
