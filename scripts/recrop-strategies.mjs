import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Facade Mask/Facade_Mask_Boards.pdf';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask/strategies.txt';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';

const doc = mupdf.Document.openDocument(readFileSync(SRC), 'application/pdf');
const pm = doc.loadPage(2).toPixmap(mupdf.Matrix.scale(3, 3), mupdf.ColorSpace.DeviceRGB, false, true);
const png = Buffer.from(pm.asPNG());
const g = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).greyscale().raw().toBuffer({ resolveWithObject: true });

// column bands: the photograph and its key form one wide band, and the sheet's
// own "Strategies" caption sits alone at the far right
const colInk = [];
for (let x = 0; x < g.info.width; x++) {
  let ink = 0;
  for (let y = 0; y < g.info.height; y++) if (g.data[y * g.info.width + x] < 246) ink++;
  colInk.push(ink);
}
const bands = [];
let s = -1;
for (let x = 0; x < colInk.length; x++) {
  if (colInk[x] > 0 && s === -1) s = x;
  if ((colInk[x] === 0 || x === colInk.length - 1) && s !== -1) { bands.push([s, x]); s = -1; }
}
const merged = [];
for (const b of bands) {
  if (merged.length && b[0] - merged[merged.length - 1][1] < g.info.width * 0.03) merged[merged.length - 1][1] = b[1];
  else merged.push([...b]);
}
console.log('column bands:', merged.map(b => `${b[0]}-${b[1]}`).join(', '));
if (merged.length < 2) throw new Error('expected the caption to sit apart from the artwork');
const main = merged[0];

// vertical bounds of the artwork only
let y0 = g.info.height, y1 = 0;
for (let y = 0; y < g.info.height; y++)
  for (let x = main[0]; x <= main[1]; x++)
    if (g.data[y * g.info.width + x] < 246) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }

const pad = 8;
const left = Math.max(0, main[0] - pad), top = Math.max(0, y0 - pad);
const box = {
  left, top,
  width: Math.min(g.info.width - left, (main[1] - main[0]) + pad * 2),
  height: Math.min(g.info.height - top, (y1 - y0) + pad * 2)
};
console.log('crop', box, '(caption at', merged[merged.length - 1], 'dropped)');

const buf = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).extract(box)
  .resize({ width: 1200 }).jpeg({ quality: 84 }).toBuffer();
const m = await sharp(buf).metadata();
console.log('output', m.width + 'x' + m.height, `(${(m.width / m.height).toFixed(2)})`, (buf.length / 1024).toFixed(0) + 'KB');
const dataUri = `data:image/jpeg;base64,${buf.toString('base64')}`;
writeFileSync(OUT, dataUri);

// swap it into the page
let html = readFileSync(P, 'utf8');
const before = html.length;
const TAIL = '" alt="The mask worn, with each strategy keyed to the element it comes from">';
if (html.split(TAIL).length - 1 !== 1) throw new Error('strategies image not found in page');
const end = html.indexOf(TAIL);
const srcOpen = html.lastIndexOf('src="', end);
html = html.slice(0, srcOpen + 5) + dataUri + html.slice(end);
writeFileSync(P, html);
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
