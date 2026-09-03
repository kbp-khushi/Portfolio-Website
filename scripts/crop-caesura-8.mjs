// Caesura revision pass 8 — restore the Economy map to its full natural extent.
// Pass 7 forced a 1.7:1 landscape window centred on the radius rings, which
// sliced ~300px off the top and dropped Florida and the Gulf. The result read
// as an arbitrary rectangle of green rather than a regional map. Take the whole
// map graphic as drawn, stopping only where the legend begins.

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const FILE = join(BASE, 'Caesura/Resources.jpg');
const B64 = join(BASE, 'base64/caesura');
const PROOF = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad/proof8';
mkdirSync(PROOF, { recursive: true });

const TOL = 247;
const { data, info } = await sharp(FILE).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const ink = (x, y) => { const i = (y * W + x) * C; return data[i] < TOL || data[i + 1] < TOL || data[i + 2] < TOL; };

// The legend starts at y2656; the map ends at y2650. Bound the search above that.
const LEGEND_TOP = 2651;
let x0 = W, x1 = -1, y0 = H, y1 = -1;
for (let y = 0; y < LEGEND_TOP; y++) for (let x = 0; x < W; x++) if (ink(x, y)) {
  if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
}
const PAD = 6; // guard against JPEG ringing at the very edge, nothing more
const region = {
  left: Math.max(0, x0 - PAD), top: Math.max(0, y0 - PAD),
  width: Math.min(W, x1 + PAD) - Math.max(0, x0 - PAD) + 1,
  height: Math.min(LEGEND_TOP - 1, y1 + PAD) - Math.max(0, y0 - PAD) + 1,
};
console.log(`map content: x ${x0}..${x1}  y ${y0}..${y1}  (${x1 - x0 + 1}x${y1 - y0 + 1})  ratio ${((x1 - x0 + 1) / (y1 - y0 + 1)).toFixed(3)}`);

const buf = await sharp(FILE).extract(region).flatten({ background: '#ffffff' })
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toBuffer();
const m = await sharp(buf).metadata();
const uri = `data:image/jpeg;base64,${buf.toString('base64')}`;
writeFileSync(join(B64, 'economy-map.txt'), uri);
await sharp(buf).resize({ width: 1000 }).jpeg({ quality: 82 }).toFile(join(PROOF, 'economy-map.jpg'));
console.log(`[economy-map] crop x ${region.left}..${region.left + region.width - 1} y ${region.top}..${region.top + region.height - 1} (${region.width}x${region.height})`);
console.log(`   -> ${m.width}x${m.height}  ratio ${(m.width / m.height).toFixed(3)}  jpeg ${(buf.length / 1024).toFixed(0)}KB  b64 ${(uri.length / 1024).toFixed(0)}KB`);
console.log(`proof -> ${PROOF}`);
