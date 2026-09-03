// Caesura revision pass 8 — match the Economy map and legend to one width so
// they compose as a single figure, and scale the Equitable group down ~20%.

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const B64 = join(BASE, 'base64/caesura');
const FILE = join(BASE, 'index.html');
let html = readFileSync(FILE, 'utf8');
const startLen = html.length;

function b64(name) {
  const s = readFileSync(join(B64, `${name}.txt`), 'utf8').trim();
  if (!s.startsWith('data:image/jpeg;base64,')) throw new Error(`bad blob: ${name}`);
  return s;
}
function count(str) { let n = 0, i = 0; while ((i = html.indexOf(str, i)) !== -1) { n++; i += str.length; } return n; }
function must(str, label) {
  const n = count(str);
  if (n !== 1) throw new Error(`ANCHOR "${label}" matched ${n} times, expected exactly 1`);
  return str;
}
function replaceOnce(oldStr, newStr, label) {
  must(oldStr, label);
  html = html.replace(oldStr, () => newStr);
  console.log(`[ok] ${label}`);
}
function swapBlob(altMarker, newBlob, label) {
  must(altMarker, `${label} (src lookup)`);
  const a = html.indexOf(altMarker);
  const s = html.lastIndexOf('src="', a) + 5;
  const to = html.indexOf('"', s);
  const old = html.slice(s, to);
  if (!old.startsWith('data:image/')) throw new Error(`src before ${label} is not a data URI`);
  html = html.slice(0, s) + newBlob + html.slice(to);
  console.log(`[ok] ${label} — blob swapped (${(old.length / 1024).toFixed(0)}KB -> ${(newBlob.length / 1024).toFixed(0)}KB)`);
}

// ── 1. Economy — full extent map, map and legend matched at 760px ────────────
swapBlob(
  'alt="Regional Sourcing" style="width:100%;max-width:700px;display:block;margin:0 auto"',
  b64('economy-map'),
  '1. economy map restored to full natural extent'
);
replaceOnce(
  'alt="Regional Sourcing" style="width:100%;max-width:700px;display:block;margin:0 auto"',
  'alt="Regional Sourcing" style="width:100%;max-width:760px;display:block;margin:0 auto"',
  '1. economy map -> 760px'
);
replaceOnce(
  'alt="Regional sourcing supplier legend" style="width:100%;max-width:900px;display:block;margin:28px auto 0"',
  'alt="Regional sourcing supplier legend" style="width:100%;max-width:760px;display:block;margin:28px auto 0"',
  '1. economy legend -> 760px, matching the map'
);

// ── 2. Equitable — scale the whole group down ~20% ───────────────────────────
replaceOnce(
  '<div class="pause-usergroups" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:end">',
  '<div class="pause-usergroups" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:end;max-width:760px;margin:0 auto">',
  '2. icon row 952 -> 760px'
);
replaceOnce(
  '<div class="pause-charts" style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:center;margin-top:28px">',
  '<div class="pause-charts" style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:center;max-width:760px;margin:28px auto 0">',
  '2. chart pair 952 -> 760px'
);
replaceOnce(
  'alt="Library Proximity Map" style="width:100%;max-width:780px;display:block;margin:40px auto 0"',
  'alt="Library Proximity Map" style="width:100%;max-width:680px;display:block;margin:40px auto 0"',
  '2. proximity map 780 -> 680px'
);

// ── sanity gates ─────────────────────────────────────────────────────────────
for (const [needle, label] of [
  ['</html>', 'closing html tag'],
  ['boards-popup', 'boards popup'],
  ['flipbook-popup', 'flipbook popup'],
  ['id="page-the-pause"', 'caesura page'],
  ['alt="Building Section"', 'building section image'],
  // the double-class scoping is what beats the generic repeat(5,1fr) helper
  ['.edit-images .pause-usergroups{grid-template-columns:repeat(2,1fr)!important}', 'usergroups mobile scoping'],
  ['.pause-charts{grid-template-columns:1fr!important}', 'charts mobile stacking'],
]) {
  if (html.indexOf(needle) === -1) throw new Error(`SANITY FAIL: ${label} missing`);
}
if (html.indexOf('__cf_email__') !== -1) throw new Error('SANITY FAIL: __cf_email__ reappeared');
if (html.indexOf('data-cfasync') !== -1) throw new Error('SANITY FAIL: data-cfasync reappeared');
if (!html.trimEnd().endsWith('</html>')) throw new Error('SANITY FAIL: file does not end with </html>');
if (html.length < 25_000_000) throw new Error(`SANITY FAIL: file shrank to ${html.length}`);

writeFileSync(FILE, html);
console.log(`\nwritten: ${(startLen / 1e6).toFixed(2)}MB -> ${(html.length / 1e6).toFixed(2)}MB`);
