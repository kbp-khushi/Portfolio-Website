import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
const SRCPDF = 'C:/Users/Khushi Patel/Downloads/ARCH 404_02_Guess_Patel_R1_202510.pdf';
const KEEP = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Beacon/Site_Analysis_Boards.pdf';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/site-analysis';
mkdirSync('C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Beacon', { recursive: true });
mkdirSync(OUT, { recursive: true });
copyFileSync(SRCPDF, KEEP);

const names = ['model-full', 'model-details-1', 'model-details-2', 'radius-2mile', 'radius-threequarter', 'research-1', 'research-2'];
const doc = mupdf.Document.openDocument(readFileSync(SRCPDF), 'application/pdf');

for (let i = 0; i < doc.countPages(); i++) {
  const pm = doc.loadPage(i).toPixmap(mupdf.Matrix.scale(3, 3), mupdf.ColorSpace.DeviceRGB, false, true);
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
    .resize({ width: 1400 }).jpeg({ quality: 78 }).toBuffer();
  const m = await sharp(buf).metadata();
  writeFileSync(`${OUT}/${names[i]}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
  console.log(names[i].padEnd(22), m.width + 'x' + m.height, (buf.length / 1024).toFixed(0) + 'KB');
}
