// Reverie: where each numbered key disc (and, S0/S1/S2/N/T, the bar scale ends, north arrow centre and title corner) from her final boards lands on the web images.
// Disc centres and placed-graphic bounds were read from a copy of BOARDS.indd (2026-11-17, read only):
// InDesign page points, bounds [top, left, bottom, right]. Each disc becomes a fraction of its
// artboard, then goes through the same render / trim / crop / resize steps as reverie-images.mjs,
// and comes out as a percentage position on the web image. Prints JSON.
import * as mupdf from 'mupdf';
import fs from 'node:fs';
import sharp from 'sharp';

const AI = 'C:/KHUSHI/SCAD/M.Arch/ARCH 747/A8 - Final/';

const boards = {
  'SAV - EXPLODED AXO.ai': { gb: [73.9471688709491, 360, 1359, 1351.43545857791], keys: {
    '01': [768.2400, 492.4800], '02': [689.8430, 631.6296], '03': [862.4968, 689.6752], '04': [955.0731, 1267.6947],
    '05': [983.3545, 1107.0102], '06': [1080.9092, 695.8187], '07': [821.4400, 533.3000], '08': [1074.5538, 533.0157],
    '09': [1114.4800, 449.7800], '10': [984.4137, 936.1570], '11': [879.2325, 221.1796], '12': [829.6608, 289.4996],
    '13': [998.6073, 200.3128], '14': [1085.2520, 314.4974],
    S0: [1162.204, 1334], S1: [1187.783, 1334], S2: [1290.1, 1334], N: [1138.454, 1334], T: [1290.1, 1310] } },
  'SAV - AXO SITEPLAN.ai': { gb: [1293.26666666667, 119.3, 2448, 1851.4], keys: {
    '01': [570.6592, 2263.7640], '02': [775.7465, 2137.2208], '03': [873.6842, 2046.5557], '04': [860.5935, 1970.4358],
    '05': [1196.5876, 2310.7935], '06': [658.9001, 1803.1660], '07': [1040.9487, 1772.6277],
    S0: [1208.856, 2420.8], S1: [1263.538, 2420.8], S2: [1318.22, 2420.8], N: [1185.106, 2420.8], T: [1318, 2396.88] } },
  'ATL - EXPLODED AXO.ai': { gb: [54.819904293016, 5203.3, 1514.81256484347, 7614.5], keys: {
    '01': [6502.7303, 849.5205], '02': [6507.1546, 896.7121], '03': [6382.1703, 841.7781], '04': [6262.9007, 735.7811],
    '05': [6346.9609, 765.2759], '06': [6129.2524, 725.0893], '07': [6279.3072, 825.9246], '08': [6323.1807, 926.5756],
    '09': [6440.9756, 994.5980], '10': [6608.5429, 1000.8657], '11': [6045.0079, 807.4904], '12': [6091.6465, 881.2274],
    '13': [6091.6465, 934.3180], '14': [6091.6465, 990.7268], '15': [6136.4418, 573.3754], '16': [6121.1413, 644.1629],
    '17': [6155.0604, 260.5461],
    S0: [6761.792, 1337.2], S1: [6794.973, 1337.2], S2: [6927.7, 1337.2], N: [6738.042, 1337.2], T: [6927.7, 1313.2] } },
  'ATL - AXO SITEPLAN.ai': { gb: [1382.4, 5710.1, 2565.26, 7259.48], keys: {
    '01': [6244.3862, 2175.1661], '02': [6539.4348, 2123.8533], '03': [6526.4400, 2189.1605], '04': [6497.7015, 1874.7030],
    '05': [6605.5750, 1740.5900], '06': [6222.3950, 1687.6945], '07': [6749.4341, 2246.6375], '08': [6839.1482, 2020.7279],
    '09': [6433.6438, 1918.5188],
    S0: [6829.709, 2425.1], S1: [6882.955, 2425.1], S2: [6936.2, 2425.1], N: [6805.959, 2425.1], T: [6936.2, 2401.1] } },
};
const sub = { 'SAV - EXPLODED AXO.ai': 'SAVANNAH/', 'SAV - AXO SITEPLAN.ai': 'SAVANNAH/', 'ATL - EXPLODED AXO.ai': 'ATLANTA/', 'ATL - AXO SITEPLAN.ai': 'ATLANTA/' };

function page(name) {
  const doc = mupdf.Document.openDocument(fs.readFileSync(AI + sub[name] + name), 'application/pdf');
  const p = doc.loadPage(0);
  const b = p.getBounds();
  return { p, W: b[2] - b[0], H: b[3] - b[1] }; // artboard in points
}
// disc -> artboard points
function toArtboard(name) {
  const { gb, keys } = boards[name];
  const { W, H } = page(name);
  const out = {};
  for (const [k, [cx, cy]] of Object.entries(keys)) {
    out[k] = [((cx - gb[1]) / (gb[3] - gb[1])) * W, ((cy - gb[0]) / (gb[2] - gb[0])) * H];
  }
  return out;
}
async function renderTrim(name, longSide) {
  const { p, W, H } = page(name);
  const s = longSide / Math.max(W, H);
  const pm = p.toPixmap(mupdf.Matrix.scale(s, s), mupdf.ColorSpace.DeviceRGB, false, true);
  const { info } = await sharp(Buffer.from(pm.asPNG())).flatten({ background: '#fff' }).trim({ background: '#ffffff', threshold: 4 }).toBuffer({ resolveWithObject: true });
  return { s, offL: -info.trimOffsetLeft, offT: -info.trimOffsetTop, w: info.width, h: info.height };
}
const pct = (x, y, W, H) => [+(100 * x / W).toFixed(2), +(100 * y / H).toFixed(2)];
const result = {};

{ // site axos: crop window in artboard inches (same rectangles as reverie-images.mjs)
  for (const [name, [l, t, r, b], id] of [['SAV - AXO SITEPLAN.ai', [3.799, 2.953, 18.093, 17.219], 'site-sav'], ['ATL - AXO SITEPLAN.ai', [4.061, 1.815, 20.895, 17.754], 'site-atl']]) {
    const a = toArtboard(name), H = page(name).H / 72;
    const bb = Math.min(b, H);
    result[id] = Object.fromEntries(Object.entries(a).map(([k, [x, y]]) => [k, pct(x / 72 - l, y / 72 - t, r - l, bb - t)]));
  }
}
{ // SAV exploded: render 3200, trim, resize to fit 2400 x 2400, then +24 px white margin each side
  const name = 'SAV - EXPLODED AXO.ai', a = toArtboard(name), R = await renderTrim(name, 3200);
  const k = Math.min(2400 / R.w, 2400 / R.h), FW = Math.round(R.w * k) + 48, FH = Math.round(R.h * k) + 48;
  result['exploded-sav'] = Object.fromEntries(Object.entries(a).map(([n, [x, y]]) => [n, pct((x * R.s - R.offL) * k + 24, (y * R.s - R.offT) * k + 24, FW, FH)]));
  result['exploded-sav-size'] = [FW, FH];
}
{ // ATL exploded: render 4500, trim, crop window, resize to 1932 wide
  const name = 'ATL - EXPLODED AXO.ai', a = toArtboard(name), R = await renderTrim(name, 4500);
  const x0 = Math.round(R.w * 0.293), w = Math.round(R.w * 0.731) - x0, y0 = Math.round(R.h * 0.05), h = Math.min(Math.round(w * 2448 / 1932), R.h - y0);
  result['exploded-atl'] = Object.fromEntries(Object.entries(a).map(([n, [x, y]]) => [n, pct(x * R.s - R.offL - x0, y * R.s - R.offT - y0, w, h)]));
}
console.log(JSON.stringify(result));
