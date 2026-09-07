import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SRC = 'C:/Users/Khushi Patel/Downloads/ARCH 404_02_Guess_Patel_R1_202510.pdf';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/site-analysis';

// Pages 2 and 3 each print the same two photographs twice, side by side.
// Take only the left column of each, giving four unique detail photos.
const doc = mupdf.Document.openDocument(readFileSync(SRC), 'application/pdf');
let n = 0;
for (const pageIndex of [1, 2]) {
  const pm = doc.loadPage(pageIndex).toPixmap(mupdf.Matrix.scale(3, 3), mupdf.ColorSpace.DeviceRGB, false, true);
  const png = Buffer.from(pm.asPNG());
  const meta = await sharp(png).metadata();
  const half = { left: 0, top: 0, width: Math.round(meta.width / 2), height: meta.height };

  for (const [label, band] of [['top', 0], ['bottom', 1]]) {
    const quad = {
      left: half.left,
      top: band === 0 ? 0 : Math.round(meta.height / 2),
      width: half.width,
      height: Math.round(meta.height / 2)
    };
    const cut = await sharp(png).flatten({ background: { r: 255, g: 255, b: 255 } }).extract(quad).toBuffer();
    const g = await sharp(cut).greyscale().raw().toBuffer({ resolveWithObject: true });
    let x0 = g.info.width, x1 = 0, y0 = g.info.height, y1 = 0;
    for (let y = 0; y < g.info.height; y++) for (let x = 0; x < g.info.width; x++)
      if (g.data[y * g.info.width + x] < 248) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0 || y1 <= y0) { console.log('  (empty quadrant, skipped)'); continue; }
    const box = { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    const buf = await sharp(cut).extract(box).resize({ width: 900 }).jpeg({ quality: 82 }).toBuffer();
    n += 1;
    const name = `detail-${n}`;
    writeFileSync(`${OUT}/${name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
    const m = await sharp(buf).metadata();
    console.log(`${name} (page ${pageIndex + 1} ${label}):`, m.width + 'x' + m.height, (buf.length / 1024).toFixed(0) + 'KB');
  }
}
console.log('unique detail photos:', n);
