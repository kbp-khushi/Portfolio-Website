// Finds how each site axo is framed on her A8 boards, so the web image can be cropped the same way.
// Matches the board's framed region (Submission/Board N.jpg, 150 ppi) against a render of the
// .ai artboard by normalized cross correlation over scale and offset, then reports the frame
// as a rectangle in artboard inches. Only the clean part of the frame is matched (her massing
// tiles and labels sit on top of some edges on the boards).
import * as mupdf from 'mupdf';
import fs from 'node:fs';
import sharp from 'sharp';

const AI = 'C:/KHUSHI/SCAD/M.Arch/ARCH 747/A8 - Final/';
const SUB = 'C:/KHUSHI/Claude/2-Ongoing/architecture-school/ARCH-747/A8-Final-Presentation/Submission/';
const BOARD_PPI = 150;

const sites = {
  // frame = full framed rectangle on the board (px); clean = sub-rectangle used for matching
  sav: { ai: 'SAVANNAH/SAV - AXO SITEPLAN.ai', board: 'Board 1.jpg', frame: [781, 3107, 2775, 5097], clean: [800, 3130, 2450, 4950] },
  atl: { ai: 'ATLANTA/ATL - AXO SITEPLAN.ai', board: 'Board 4.jpg', frame: [700, 3105, 2806, 5099], clean: [870, 3130, 2450, 4950] },
};

const docs = {};
function aiGray(site, ppi) {
  docs[site] ??= mupdf.Document.openDocument(fs.readFileSync(AI + sites[site].ai), 'application/pdf');
  const page = docs[site].loadPage(0);
  const pm = page.toPixmap(mupdf.Matrix.scale(ppi / 72, ppi / 72), mupdf.ColorSpace.DeviceGray, false, true);
  return { w: pm.getWidth(), h: pm.getHeight(), d: Float32Array.from(pm.getPixels()) };
}
async function boardGray(site, scale) {
  const [x0, y0, x1, y1] = sites[site].clean;
  const { data, info } = await sharp(SUB + sites[site].board).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
    .resize({ width: Math.round((x1 - x0) * scale) }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { w: info.width, h: info.height, d: Float32Array.from(data) };
}

// best NCC placement of template t inside image a, searching offsets in [ox0..ox1]x[oy0..oy1]
function ncc(a, t, ox0 = 0, ox1 = a.w - t.w, oy0 = 0, oy1 = a.h - t.h) {
  const n = t.w * t.h;
  let tm = 0; for (let i = 0; i < n; i++) tm += t.d[i]; tm /= n;
  const tz = new Float32Array(n); let tv = 0;
  for (let i = 0; i < n; i++) { tz[i] = t.d[i] - tm; tv += tz[i] * tz[i]; }
  let best = { s: -2, x: 0, y: 0 };
  for (let oy = Math.max(0, oy0); oy <= Math.min(a.h - t.h, oy1); oy++) {
    for (let ox = Math.max(0, ox0); ox <= Math.min(a.w - t.w, ox1); ox++) {
      let sa = 0, saa = 0, sat = 0;
      for (let y = 0; y < t.h; y++) {
        const ar = (oy + y) * a.w + ox, tr = y * t.w;
        for (let x = 0; x < t.w; x++) { const v = a.d[ar + x]; sa += v; saa += v * v; sat += v * tz[tr + x]; }
      }
      const va = saa - (sa * sa) / n;
      const s = va > 0 ? sat / Math.sqrt(va * tv) : -1;
      if (s > best.s) best = { s, x: ox, y: oy };
    }
  }
  return best;
}

for (const site of Object.keys(sites)) {
  // coarse: template at 1/12 of board size; artboard rendered so that 1 board px maps to the
  // right number of artboard px for each candidate placement scale (sigma)
  const d = 1 / 12;
  const t = await boardGray(site, d);
  let best = null;
  for (let sigma = 0.4; sigma <= 1.6; sigma += 0.02) {
    const a = aiGray(site, BOARD_PPI * sigma * d);
    if (a.w < t.w || a.h < t.h) continue;
    const r = ncc(a, t);
    if (!best || r.s > best.s) best = { ...r, sigma };
  }
  // fine: 1/3 board size, sigma +-0.03, offsets +-6 px around the coarse hit
  const d2 = 1 / 3;
  const t2 = await boardGray(site, d2);
  let fine = null;
  for (let sigma = best.sigma - 0.03; sigma <= best.sigma + 0.03; sigma += 0.004) {
    const a = aiGray(site, BOARD_PPI * sigma * d2);
    const cx = Math.round(best.x * (d2 / d)), cy = Math.round(best.y * (d2 / d));
    const r = ncc(a, t2, cx - 8, cx + 8, cy - 8, cy + 8);
    if (!fine || r.s > fine.s) fine = { ...r, sigma };
  }
  // frame rect in artboard inches: clean origin maps to (fine.x, fine.y) at ppi = 150*sigma*d2
  const ppi = BOARD_PPI * fine.sigma * d2;
  const [cx0, cy0] = sites[site].clean;
  const [fx0, fy0, fx1, fy1] = sites[site].frame;
  const toIn = (bx, by) => [(fine.x + (bx - cx0) * d2) / ppi, (fine.y + (by - cy0) * d2) / ppi];
  const [l, t0] = toIn(fx0, fy0), [r, b] = toIn(fx1, fy1);
  console.log(JSON.stringify({ site, coarse: { s: +best.s.toFixed(3), sigma: +best.sigma.toFixed(3) }, fine: { s: +fine.s.toFixed(3), sigma: +fine.sigma.toFixed(4) }, frameInches: [l, t0, r, b].map((v) => +v.toFixed(3)) }));
}
