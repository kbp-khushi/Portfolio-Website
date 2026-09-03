// Caesura revision pass 7 — split the two portrait board graphics into pieces
// that can be laid out with CSS, and encode the approved building section crop.
//
// Both Resources.jpg and Equitable Comm-01.jpg carry dead space INSIDE the
// graphic, so no single rectangle fixes them. Cutting them into pieces and
// re-stacking in HTML is what actually brings the block heights down.

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const SRC = join(BASE, 'Caesura');
const B64 = join(BASE, 'base64/caesura');
const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const PROOF = join(SCRATCH, 'proof7');
mkdirSync(PROOF, { recursive: true });

const TOL = 247;

async function load(file) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
}
const ink = (im, x, y) => {
  const i = (y * im.W + x) * im.C;
  return im.data[i] < TOL || im.data[i + 1] < TOL || im.data[i + 2] < TOL;
};
function bbox(im, x0, x1, y0, y1) {
  let a = x1 + 1, b = -1, c = y1 + 1, d = -1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ink(im, x, y)) {
    if (x < a) a = x; if (x > b) b = x; if (y < c) c = y; if (y > d) d = y;
  }
  if (b < 0) throw new Error(`empty bbox in ${x0}..${x1} / ${y0}..${y1}`);
  return { x0: a, x1: b, y0: c, y1: d, w: b - a + 1, h: d - c + 1 };
}

async function emit(name, file, region, outWidth, quality = 88, extend = null) {
  // sharp applies extend AFTER resize within a single pipeline, which would
  // break the common box, so pad in its own pass first and resize the result.
  let src = await sharp(file).extract(region).flatten({ background: '#ffffff' }).png().toBuffer();
  if (extend) src = await sharp(src).extend({ ...extend, background: '#ffffff' }).png().toBuffer();
  const buf = await sharp(src)
    .resize({ width: outWidth, withoutEnlargement: true })
    .jpeg({ quality, chromaSubsampling: '4:4:4' })
    .toBuffer();
  const m = await sharp(buf).metadata();
  const uri = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(B64, `${name}.txt`), uri);
  await sharp(buf).resize({ width: Math.min(1000, m.width) }).jpeg({ quality: 82 }).toFile(join(PROOF, `${name}.jpg`));
  console.log(
    `[${name}] crop x ${region.left}..${region.left + region.width - 1} y ${region.top}..${region.top + region.height - 1}` +
    ` (${region.width}x${region.height})` + (extend ? ` +pad` : '') +
    ` -> ${m.width}x${m.height}  ratio ${(m.width / m.height).toFixed(3)}  jpeg ${(buf.length / 1024).toFixed(0)}KB  b64 ${(uri.length / 1024).toFixed(0)}KB`
  );
  return m;
}

// ══════════════ 3. ECONOMY — split Resources.jpg into map + legend ══════════
{
  const file = join(SRC, 'Resources.jpg');
  const im = await load(file);

  // The legend is the seven numbered rows at the bottom; the map ends well above it.
  const legend = bbox(im, 1200, 3600, 2660, 3060);
  const mapFull = bbox(im, 1200, 3600, 500, 2650);
  console.log(`  map full  : x ${mapFull.x0}..${mapFull.x1}  y ${mapFull.y0}..${mapFull.y1}  (${mapFull.w}x${mapFull.h})`);
  console.log(`  legend    : x ${legend.x0}..${legend.x1}  y ${legend.y0}..${legend.y1}  (${legend.w}x${legend.h})`);

  // Map piece: keep the full map width for regional context, then choose the
  // vertical window that centres on the radius rings and lands near 1.7:1.
  // The rings (orange) sit at x 2119..2783, y 1198..1861.
  const RING = { x0: 2119, x1: 2783, y0: 1198, y1: 1861 };
  const mx0 = mapFull.x0, mx1 = mapFull.x1;
  const mw = mx1 - mx0 + 1;
  const mh = Math.round(mw / 1.7);
  const ringCy = Math.round((RING.y0 + RING.y1) / 2);
  let my0 = Math.round(ringCy - mh / 2);
  let my1 = my0 + mh - 1;
  // never dip into the legend, never start above the map
  if (my1 > mapFull.y1) { my1 = mapFull.y1; my0 = my1 - mh + 1; }
  if (my0 < mapFull.y0) { my0 = mapFull.y0; my1 = my0 + mh - 1; }
  const ringMargin = Math.min(RING.y0 - my0, my1 - RING.y1);
  console.log(`  map window: y ${my0}..${my1}  (rings clear by ${ringMargin}px top/bottom)`);
  if (ringMargin < 60) throw new Error('map window crowds the radius rings');
  await emit('economy-map', file, { left: mx0, top: my0, width: mw, height: mh }, 1400, 88);

  // Pad the legend, but never far enough up to catch the bottom edge of the map.
  const lp = Math.round(legend.h * 0.06);
  const lTop = Math.max(legend.y0 - lp, mapFull.y1 + 6);
  await emit('economy-legend', file, {
    left: Math.max(0, legend.x0 - lp), top: lTop,
    width: legend.w + lp * 2, height: legend.y1 + lp - lTop + 1,
  }, 1800, 90);
}

// ══════════════ 4. EQUITABLE — split into 5 icons + 2 donut charts ══════════
{
  const file = join(SRC, 'Equitable Comm-01.jpg');
  const im = await load(file);

  // icon groups: figure run + its label run, measured from the icon column
  const GROUPS = [
    ['equitable-icon-1', 264, 641],   // Local Residents
    ['equitable-icon-2', 855, 1193],  // Retirees
    ['equitable-icon-3', 1393, 1750], // Families
    ['equitable-icon-4', 1912, 2320], // Seasonal Visitors
    ['equitable-icon-5', 2479, 2860], // Outdoor Recreation Users
  ];
  const boxes = GROUPS.map(([name, y0, y1]) => {
    const b = bbox(im, 1300, 2100, y0, y1);
    console.log(`  ${name}: x ${b.x0}..${b.x1} y ${b.y0}..${b.y1} (${b.w}x${b.h})`);
    return { name, b };
  });
  // Pad every group into one common box so all five render at the same scale in
  // the grid. Bottom aligned so the five captions sit on a single line.
  const padX = 24, padY = 16;
  const boxW = Math.max(...boxes.map(o => o.b.w)) + padX * 2;
  const boxH = Math.max(...boxes.map(o => o.b.h)) + padY;
  console.log(`  common icon box: ${boxW}x${boxH}  ratio ${(boxW / boxH).toFixed(3)}`);
  for (const { name, b } of boxes) {
    const left = Math.floor((boxW - b.w) / 2);
    await emit(name, file, { left: b.x0, top: b.y0, width: b.w, height: b.h }, 460, 88, {
      left, right: boxW - b.w - left, top: boxH - b.h - padY, bottom: padY,
    });
  }

  // donut charts — cropped tight, each keeps its own surrounding annotations
  const CHARTS = [
    ['equitable-chart-1', 269, 1365],  // seasonal rings + season icons
    ['equitable-chart-2', 1703, 3066], // time of day rings + labels
  ];
  for (const [name, y0, y1] of CHARTS) {
    const b = bbox(im, 2100, 3600, y0, y1);
    const p = Math.round(Math.max(b.w, b.h) * 0.02);
    await emit(name, file, {
      left: Math.max(0, b.x0 - p), top: Math.max(0, b.y0 - p),
      width: b.w + p * 2, height: b.h + p * 2,
    }, 1000, 88);
  }
}

// ══════════════ 5. BUILDING SECTION — the approved crop, embedded ═══════════
{
  const file = join(SCRATCH, 'board-hi-1.jpg');
  // exact region signed off in round one
  await emit('building-section', file, { left: 114, top: 4191, width: 6485, height: 2615 }, 2400, 93);
}

console.log(`\nproofs -> ${PROOF}`);
