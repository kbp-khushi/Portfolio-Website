import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync } from 'fs';

// Finds the scale and offset that place the source PDF render onto 037-image.jpg,
// so the clipped top of the pink tree can be patched back in from the PDF.
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const doc = mupdf.Document.openDocument(readFileSync(`${BASE}/Caesura/Building Axo.pdf`), 'application/pdf');
const pix = doc.loadPage(0).toPixmap(mupdf.Matrix.scale(200 / 72, 200 / 72), mupdf.ColorSpace.DeviceRGB, false, true);
const srcPng = Buffer.from(pix.asPNG());

const D = 2; // work at half resolution of the web image
const web = await sharp(`${BASE}/site/images/037-image.jpg`).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = Math.round(web.info.width / D), H = Math.round(web.info.height / D);
const webS = await sharp(`${BASE}/site/images/037-image.jpg`).greyscale().resize(W, H).raw().toBuffer();

// template: left and centre of the drawing, below the clipped edge, avoiding the text column
const T = { x: Math.round(40 / D), y: Math.round(60 / D), w: Math.round(760 / D), h: Math.round(820 / D) };

async function score(s, dx, dy, srcCache) {
  const { data, w, h } = srcCache;
  let sum = 0, n = 0;
  for (let y = 0; y < T.h; y += 2) {
    for (let x = 0; x < T.w; x += 2) {
      const wx = T.x + x, wy = T.y + y;
      const sx = wx - dx, sy = wy - dy;
      if (sx < 0 || sy < 0 || sx >= w || sy >= h) { sum += 255 * 255; n++; continue; }
      const d = webS[wy * W + wx] - data[sy * w + sx];
      sum += d * d; n++;
    }
  }
  return sum / n;
}

let best = { e: Infinity };
for (let s = +(process.argv[2]||0.70); s <= +(process.argv[3]||0.80); s += 0.005) {
  const sw = Math.round(2200 * s / D), sh = Math.round(3400 * s / D);
  const data = await sharp(srcPng).greyscale().resize(sw, sh).raw().toBuffer();
  const cache = { data, w: sw, h: sh };
  const ex = Math.round(-300 / D), ey = Math.round(-330 / D);
  for (let dy = ey - 60; dy <= ey + 60; dy += 2)
    for (let dx = ex - 60; dx <= ex + 60; dx += 2) {
      const e = await score(s, dx, dy, cache);
      if (e < best.e) best = { e, s, dx, dy, cache };
    }
}
// refine offset at 1px around the best
for (let dy = best.dy - 3; dy <= best.dy + 3; dy++)
  for (let dx = best.dx - 3; dx <= best.dx + 3; dx++) {
    const e = await score(best.s, dx, dy, best.cache);
    if (e < best.e) best = { ...best, e, dx, dy };
  }
console.log(JSON.stringify({ scale: +best.s.toFixed(3), dx: best.dx * D, dy: best.dy * D, mse: Math.round(best.e) }));
