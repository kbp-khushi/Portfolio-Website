// Building Section proof crop from final board 2.
// PROOF ONLY — this script does not touch index.html. The swap into the page
// happens in a follow up pass once Khushi approves the proof.
//
// Target extent (Khushi's spec):
//   top    — above the full row of circular callout icons and their vertical labels
//   left   — left end of the band incl. leftmost trees and the "Building Section" label
//   right  — where the dark ground poche terminates and the sheet margin begins
//   bottom — through the full depth of the poche incl. its water pockets
//   proportion should land near 2.45:1

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const BOARD = join(SCRATCH, 'board-hi-1.jpg');
mkdirSync(SCRATCH, { recursive: true });

const { data, info } = await sharp(BOARD).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
console.log(`board 2: ${W}x${H}`);

const lum = (x, y) => {
  const i = (y * W + x) * C;
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
};
const isInk = (x, y) => {
  const i = (y * W + x) * C;
  return data[i] < 247 || data[i + 1] < 247 || data[i + 2] < 247;
};

// ── 1. Find the dark ground poche band, column-wise, as the contiguous run
//       containing a point known to be inside it. Column-wise survives the
//       lighter water pockets, and the run stops before the axonometric's
//       base plate further right on the sheet.
const POCHE_Y0 = Math.round(H * 0.90);
const POCHE_Y1 = H - 1;
const darkCol = new Uint8Array(W);
for (let x = 0; x < W; x++) {
  for (let y = POCHE_Y0; y <= POCHE_Y1; y++) {
    if (lum(x, y) < 90) { darkCol[x] = 1; break; }
  }
}
const SEED = Math.round(W * 0.03); // ~311px in, safely inside the band
if (!darkCol[SEED]) throw new Error('seed column is not inside the ground poche');
const GAP = 40; // bridge antialiasing / tiny breaks
function extend(dir) {
  let x = SEED, last = SEED;
  while (x >= 0 && x < W) {
    if (darkCol[x]) last = x;
    else if (Math.abs(x - last) > GAP) break;
    x += dir;
  }
  return last;
}
const bandLeft = extend(-1);
const bandRight = extend(1);

// bottom of the poche within that run
let bandBottom = -1;
for (let y = H - 1; y >= POCHE_Y0; y--) {
  let hit = false;
  for (let x = bandLeft; x <= bandRight; x++) if (lum(x, y) < 90) { hit = true; break; }
  if (hit) { bandBottom = y; break; }
}
console.log(`poche band: x ${bandLeft}..${bandRight}  bottom y ${bandBottom}`);

// ── 2. Top edge: walk up through the band's content and stop at the white
//       gutter that separates it from the metric text block above.
const span = bandRight - bandLeft + 1;
const QUIET = Math.max(4, Math.round(span * 0.0015)); // a row this empty is gutter
const rowInk = [];
for (let y = 0; y < H; y++) {
  let n = 0;
  for (let x = bandLeft; x <= bandRight; x++) if (isInk(x, y)) n++;
  rowInk.push(n);
}
// From the poche upward, find the first sustained quiet run (>=60 rows). That
// run is the gutter between the callout icons and the metric text block above.
const RUN = 60;
let contentTop = null;
let quiet = 0;
for (let y = bandBottom; y >= 0; y--) {
  if (rowInk[y] <= QUIET) {
    quiet++;
    if (quiet >= RUN) { contentTop = y + quiet; break; }
  } else quiet = 0;
}
if (contentTop === null) throw new Error('could not locate the gutter above the section band');
// Keep walking up to the far side of that gutter so the callouts get real air
// above them rather than sitting hard against the crop edge.
let gutterTop = contentTop;
while (gutterTop > 0 && rowInk[gutterTop - 1] <= QUIET) gutterTop--;
const CLEAR = 15; // stay clear of the text block above
const topEdge = Math.min(contentTop, gutterTop + CLEAR);
console.log(
  `callout row starts y ${contentTop}; gutter runs y ${gutterTop}..${contentTop - 1} ` +
  `(${contentTop - gutterTop}px); top edge -> y ${topEdge}  ` +
  `[quiet threshold ${QUIET} ink px over ${span}px span]`
);

// ── 3. Assemble the crop with a thin margin, then report the proportion.
const MARGIN = Math.round(span * 0.006); // ~1 sheet-inch of air
let left = Math.max(0, bandLeft - MARGIN);
let right = Math.min(W - 1, bandRight + MARGIN);
let top = Math.max(0, topEdge); // topEdge already sits inside the gutter
let bottom = Math.min(H - 1, bandBottom + MARGIN);

const region = { left, top, width: right - left + 1, height: bottom - top + 1 };
const ratio = region.width / region.height;
console.log(`crop: x ${left}..${right}  y ${top}..${bottom}  (${region.width}x${region.height})  ratio ${ratio.toFixed(3)}`);
if (ratio < 2.30 || ratio > 2.60) {
  console.warn(`!! ratio ${ratio.toFixed(3)} is outside the expected 2.4-2.5 window — inspect the proof`);
}

// ── 4. Render both proofs.
for (const w of [2000, 3000]) {
  const out = join(SCRATCH, w === 2000 ? 'proof-building-section.jpg' : 'proof-building-section-3000.jpg');
  const buf = await sharp(BOARD)
    .extract(region)
    .flatten({ background: '#ffffff' })
    .resize({ width: w })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toBuffer();
  await sharp(buf).toFile(out);
  const m = await sharp(buf).metadata();
  console.log(`  -> ${out}  ${m.width}x${m.height}  ${(buf.length / 1024).toFixed(0)}KB`);
}
