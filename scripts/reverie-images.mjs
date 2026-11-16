// Reverie (ARCH 747, Wilner, Fall 2026) -> site/images/208..*
// Sources (all read only):
//   renders  : flattened composites of her "<view> - board.psd" files (extracted with
//              ag-psd into the session scratchpad, see RENDERS below); the retreat
//              (full view) PSD had a stale composite, so it is cropped from Board 2.
//   drawings : her A8 .ai files, which are saved PDF compatible, rendered with mupdf.
//   massing  : the board versions (vertical strips) split into their 5 steps and
//              laid side by side for the web.
//   models   : her retouched model photos (A8-Final-Presentation/Model-Photos/edited).
//   boards   : Submission/Board 1-4.jpg (11/14) for the flipbook.
import * as mupdf from 'mupdf';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/images';
const AI = 'C:/KHUSHI/SCAD/M.Arch/ARCH 747/A8 - Final/';
const A8 = 'C:/KHUSHI/Claude/2-Ongoing/architecture-school/ARCH-747/A8-Final-Presentation/';
const RENDERS = process.argv[2]; // folder of extracted render JPGs
if (!RENDERS) throw new Error('pass the extracted renders folder');

const made = [];
async function save(img, name, maxW = 2400, maxH = 2400, q = 84) {
  const info = await img
    .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: q, mozjpeg: true })
    .toFile(path.join(OUT, name));
  made.push([name, info.width, info.height, Math.round(info.size / 1024)]);
}

function renderAi(file, pageNo, longSide) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(AI + file), 'application/pdf');
  const page = doc.loadPage(pageNo);
  const b = page.getBounds();
  const s = longSide / Math.max(b[2] - b[0], b[3] - b[1]);
  const pm = page.toPixmap(mupdf.Matrix.scale(s, s), mupdf.ColorSpace.DeviceRGB, false, true);
  return Buffer.from(pm.asPNG());
}

// Split a vertical strip of stacked drawings into its bands (rows separated by white).
async function splitBands(png) {
  const { data, info } = await sharp(png).flatten({ background: '#fff' }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const rowInk = [];
  for (let y = 0; y < H; y++) {
    let ink = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      if (data[i] + data[i + 1] + data[i + 2] < 735) ink++;
    }
    rowInk.push(ink > 2);
  }
  const bands = [];
  let start = -1, gap = 0;
  for (let y = 0; y < H; y++) {
    if (rowInk[y]) { if (start < 0) start = y; gap = 0; }
    else if (start >= 0 && ++gap > 25) { bands.push([start, y - gap]); start = -1; gap = 0; }
  }
  if (start >= 0) bands.push([start, H - 1]);
  const tiles = [];
  for (const [y0, y1] of bands) {
    if (y1 - y0 < 40) continue;
    // extract first, then trim in its own pass (sharp would otherwise trim before extracting)
    const band = await sharp(png).flatten({ background: '#fff' }).extract({ left: 0, top: y0, width: W, height: y1 - y0 + 1 }).png().toBuffer();
    tiles.push(await sharp(band).trim({ background: '#ffffff', threshold: 6 }).toBuffer());
  }
  return tiles;
}

async function strip(tiles, gap) {
  const metas = await Promise.all(tiles.map((t) => sharp(t).metadata()));
  const h = Math.max(...metas.map((m) => m.height));
  const w = metas.reduce((s, m) => s + m.width, 0) + gap * (tiles.length - 1);
  let x = 0;
  const comps = tiles.map((t, i) => {
    const c = { input: t, left: x, top: h - metas[i].height }; // bottoms aligned
    x += metas[i].width + gap;
    return c;
  });
  return sharp({ create: { width: w, height: h, channels: 3, background: '#ffffff' } }).composite(comps).png().toBuffer();
}

// --- renders
const R = (n) => sharp(path.join(RENDERS, n + '.jpg'));
await save(R('sav-retreat'), '208-reverie-retreat.jpg', 2400);
await save(R('sav-arrival'), '209-reverie-arrival.jpg', 2400);
await save(R('sav-walk'), '210-reverie-walk.jpg', 2400);
await save(R('sav-water-room'), '211-reverie-water-room.jpg', 2400);
await save(R('sav-lattice'), '212-reverie-lattice.jpg', 1600, 2400);
await save(R('atl-open-walls'), '213-reverie-open-walls.jpg', 2400);
await save(R('atl-waterfall'), '214-reverie-waterfall.jpg', 1600, 2400);
await save(R('atl-threshold'), '215-reverie-threshold.jpg', 2400);
await save(R('atl-dark-walk'), '216-reverie-dark-walk.jpg', 1600, 2400);
await save(R('atl-overlook'), '217-reverie-overlook.jpg', 2400);

// --- drawings (trim the artboard white, keep a small margin)
const trimmed = (png) => sharp(png).flatten({ background: '#fff' }).trim({ background: '#ffffff', threshold: 4 }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#ffffff' });
await save(trimmed(renderAi('CONCEPT DIAGRAMS.ai', 1, 3600)), '218-reverie-concept-sav.jpg', 2400, 1200, 88);
await save(trimmed(renderAi('CONCEPT DIAGRAMS.ai', 4, 3600)), '219-reverie-concept-atl.jpg', 2400, 1200, 88);
await save(trimmed(renderAi('PARTI DIAGRAMS.ai', 0, 2400)), '220-reverie-parti-sav.jpg', 1600, 1600, 88);
await save(trimmed(renderAi('PARTI DIAGRAMS.ai', 1, 2400)), '221-reverie-parti-atl.jpg', 1600, 1600, 88);
// Site axos cropped to exactly how she framed them on the boards. Frame rectangles (artboard
// inches, left top right bottom) come from scripts/reverie-board-frame.mjs, which matched each
// board's frame against the artboard (NCC 0.89 SAV, 0.94 ATL), 2026-11-16.
async function framed(file, [l, t, r, b], widthPx) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(AI + file), 'application/pdf');
  const page = doc.loadPage(0);
  const bd = page.getBounds();
  const ppi = widthPx / (r - l);
  const pm = page.toPixmap(mupdf.Matrix.scale(ppi / 72, ppi / 72), mupdf.ColorSpace.DeviceRGB, false, true);
  const W = pm.getWidth(), H = pm.getHeight();
  const x0 = Math.max(0, Math.round(l * ppi)), y0 = Math.max(0, Math.round(t * ppi));
  const x1 = Math.min(W, Math.round(r * ppi)), y1 = Math.min(H, Math.round(Math.min(b, (bd[3] - bd[1]) / 72) * ppi));
  return sharp(Buffer.from(pm.asPNG())).flatten({ background: '#fff' }).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
}
await save(await framed('SAVANNAH/SAV - AXO SITEPLAN.ai', [3.799, 2.953, 18.093, 17.219], 2600), '222-reverie-site-sav-framed.jpg', 2400, 2400, 86);
await save(trimmed(renderAi('SAVANNAH/SAV - EXPLODED AXO.ai', 0, 3200)), '223-reverie-exploded-sav.jpg', 2400, 2400, 86);
await save(await framed('ATLANTA/ATL - AXO SITEPLAN.ai', [4.061, 1.815, 20.895, 17.754], 2600), '224-reverie-site-atl-framed.jpg', 2400, 2400, 86);
await save(trimmed(renderAi('ATLANTA/ATL - EXPLODED AXO.ai', 0, 3200)), '225-reverie-exploded-atl.jpg', 2400, 2400, 86);
// light sections: SAV lattice walk, water room, court; ATL open walls, dark walk, canopy
const sec = [[0, '226-reverie-section-lattice-walk.jpg'], [1, '227-reverie-section-water-room.jpg'], [2, '228-reverie-section-court.jpg'],
  [3, '229-reverie-section-open-walls.jpg'], [4, '230-reverie-section-dark-walk.jpg'], [5, '231-reverie-section-canopy.jpg']];
for (const [p, n] of sec) await save(sharp(renderAi('LIGHT SECTIONAL DIAGRAMS.ai', p, 1400)), n, 1400, 1400, 88);

// --- massing steps, board versions, side by side
await save(sharp(await strip(await splitBands(renderAi('SAVANNAH/SAV - MASSING.ai', 3, 4200)), 40)), '232-reverie-massing-sav.jpg', 2400, 1200, 88);
await save(sharp(await strip(await splitBands(renderAi('ATLANTA/ATL - MASSING.ai', 2, 4200)), 40)), '233-reverie-massing-atl.jpg', 2400, 1200, 88);

// --- model photos
const M = A8 + 'Model-Photos/edited/';
const models = [
  ['SAV model 03 - plan from above.jpg', '234-reverie-model-sav-plan.jpg'],
  ['SAV model 06 - lattice and drum.jpg', '235-reverie-model-sav-lattice.jpg'],
  ['SAV model 02 - side.jpg', '236-reverie-model-sav-side.jpg'],
  ['ATL model 01 - front with tower.jpg', '237-reverie-model-atl-front.jpg'],
  ['ATL model 05 - inside the walk.jpg', '238-reverie-model-atl-walk.jpg'],
  ['ATL model 07 - plan from above.jpg', '239-reverie-model-atl-plan.jpg'],
];
for (const [src, n] of models) await save(sharp(M + src), n, 1800, 1800);

// --- boards for the flipbook
for (let i = 1; i <= 4; i++) await save(sharp(A8 + `Submission/Board ${i}.jpg`), `${239 + i}-reverie-board-${i}.jpg`, 1600, 2400, 82);

for (const m of made) console.log(m.join('\t'));
