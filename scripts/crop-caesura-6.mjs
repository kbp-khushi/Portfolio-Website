// Caesura revision pass 6 — re-crop the diagrams that were exported as full
// 5100x3300 board sheets with the graphic floating in a large white field.
// Writes data:image/jpeg;base64 blobs to base64/caesura/*.txt and
// before/after previews to the session scratchpad.

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const SRC = join(BASE, 'Caesura');
const B64 = join(BASE, 'base64/caesura');
const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const PROOF = join(SCRATCH, 'proof');
mkdirSync(PROOF, { recursive: true });

const TOL = 247; // any channel below this counts as content

async function contentBounds(file, { tol = TOL, clipLeft = 0 } = {}) {
  const { data, info } = await sharp(file)
    .flatten({ background: '#ffffff' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * c;
    for (let x = clipLeft; x < w; x++) {
      const i = row + x * c;
      if (data[i] < tol || data[i + 1] < tol || data[i + 2] < tol) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error(`no content found in ${file}`);
  return { w, h, minX, minY, maxX, maxY };
}

// Expand a box by `pct` of its own size on each side, clamped to the sheet.
function pad(box, pct, sheetW, sheetH, sides = 'ltrb') {
  const cw = box.maxX - box.minX + 1;
  const ch = box.maxY - box.minY + 1;
  const px = Math.round(cw * pct);
  const py = Math.round(ch * pct);
  const left = Math.max(0, box.minX - (sides.includes('l') ? px : 0));
  const top = Math.max(0, box.minY - (sides.includes('t') ? py : 0));
  const right = Math.min(sheetW - 1, box.maxX + (sides.includes('r') ? px : 0));
  const bottom = Math.min(sheetH - 1, box.maxY + (sides.includes('b') ? py : 0));
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function emit(name, file, region, outWidth, label) {
  const buf = await sharp(file)
    .extract(region)
    .flatten({ background: '#ffffff' })
    .resize({ width: outWidth, withoutEnlargement: true })
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer();
  const meta = await sharp(buf).metadata();
  const uri = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(B64, `${name}.txt`), uri);
  await sharp(buf).resize({ width: 1000 }).jpeg({ quality: 82 }).toFile(join(PROOF, `after-${name}.jpg`));
  console.log(
    `[${name}] ${label}\n` +
    `   crop  x ${region.left}..${region.left + region.width - 1}  y ${region.top}..${region.top + region.height - 1}` +
    `  (${region.width}x${region.height})\n` +
    `   out   ${meta.width}x${meta.height}   jpeg ${(buf.length / 1024).toFixed(0)}KB   b64 ${(uri.length / 1024).toFixed(0)}KB`
  );
  return { outW: meta.width, outH: meta.height, region };
}

async function beforePreview(name, file) {
  await sharp(file).resize({ width: 1000 }).jpeg({ quality: 82 }).toFile(join(PROOF, `before-${name}.jpg`));
}

const results = {};

// ── 3. Design for Economy — regional sourcing map + numbered supplier legend ──
{
  const f = join(SRC, 'Resources.jpg');
  await beforePreview('regional-sourcing', f);
  const b = await contentBounds(f);
  const r = pad(b, 0.02, b.w, b.h);
  results['regional-sourcing'] = await emit('regional-sourcing', f, r, 1800, 'Economy / regional sourcing');
}

// ── 4. Design for Equitable Communities — user groups diagram ──
{
  const f = join(SRC, 'Equitable Comm-01.jpg');
  await beforePreview('user-groups', f);
  const b = await contentBounds(f);
  const r = pad(b, 0.02, b.w, b.h);
  results['user-groups'] = await emit('user-groups', f, r, 1800, 'Equitable / user groups');
}

// ── 5. Design for Well-Being — daylight + ventilation section ──
// The sheet is full bleed: sun rays run off the top and the trees/water run off
// the right. The defect is a blunt vertical black stub at x=0 where the ground
// line is closed off and dropped to the sheet bottom. Trim the left margin in to
// ~10% and clip the dead band under the ground line.
{
  const f = join(SRC, 'Wellbeing.jpg');
  await beforePreview('daylight-ventilation-trim', f);
  const sheetW = 5100, sheetH = 3300;
  const clipLeft = Math.round(sheetW * 0.10); // 510px — past the blunt vertical edge
  const b = await contentBounds(f, { clipLeft });
  // keep the full bleed top/right, trim left to clipLeft, clip bottom to content
  const region = {
    left: clipLeft,
    top: 0,
    width: sheetW - clipLeft,
    height: Math.min(sheetH, b.maxY + Math.round(sheetH * 0.01)) - 0,
  };
  console.log(`   [wellbeing] content below-left-clip ends at y=${b.maxY}; bottom clipped to ${region.height}`);
  results['daylight-ventilation-trim'] = await emit('daylight-ventilation-trim', f, region, 1800, 'Well-Being / daylight + ventilation');
}

// ── 6a. Design for Ecosystems — the three metric icons ──
{
  const f = join(SRC, 'Ecology_Ecology Metrics.jpg');
  await beforePreview('ecosystem-diagram', f);
  const b = await contentBounds(f);
  const r = pad(b, 0.02, b.w, b.h);
  results['ecosystem-diagram'] = await emit('ecosystem-diagram', f, r, 1800, 'Ecosystems / metric icons');
}

// ── 6b. Design for Ecosystems — the full site ecology section ──
{
  const f = join(SRC, 'Ecology.jpg');
  await beforePreview('site-ecology', f);
  const b = await contentBounds(f);
  const r = pad(b, 0.02, b.w, b.h);
  results['site-ecology'] = await emit('site-ecology', f, r, 1800, 'Ecosystems / site ecology');
}

// ── 8. Design for Energy — EUI waterfall chart ──
{
  const f = join(SRC, 'Water and Energy Metrics_Water_EUI.jpg');
  await beforePreview('energy-eui', f);
  const b = await contentBounds(f);
  const r = pad(b, 0.02, b.w, b.h);
  results['energy-eui'] = await emit('energy-eui', f, r, 1400, 'Energy / EUI waterfall');
}

console.log(`\nproofs -> ${PROOF}`);
