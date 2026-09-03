// Caesura revision pass 6 — layout + image swaps inside #page-the-pause.
// Never writes index.html except through this script; never matches on a
// base64 payload, only on short unique markup around it.

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

function count(str) {
  let n = 0, i = 0;
  while ((i = html.indexOf(str, i)) !== -1) { n++; i += str.length; }
  return n;
}

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

// Pull the existing data URI out of the <img> whose tag contains `altMarker`.
function srcOf(altMarker, label) {
  must(altMarker, `${label} (src lookup)`);
  const a = html.indexOf(altMarker);
  const s = html.lastIndexOf('src="', a);
  if (s === -1) throw new Error(`no src before ${label}`);
  const from = s + 5;
  const to = html.indexOf('"', from);
  const blob = html.slice(from, to);
  if (!blob.startsWith('data:image/')) throw new Error(`src before ${label} is not a data URI`);
  return blob;
}

// Swap just the data URI of the <img> carrying `altMarker`.
function swapBlob(altMarker, newBlob, label) {
  const old = srcOf(altMarker, label);
  const a = html.indexOf(altMarker);
  const s = html.lastIndexOf('src="', a) + 5;
  html = html.slice(0, s) + newBlob + html.slice(s + old.length);
  console.log(`[ok] ${label} — blob swapped (${(old.length / 1024).toFixed(0)}KB -> ${(newBlob.length / 1024).toFixed(0)}KB)`);
}

// Cut html[start..end) and return it.
function cut(start, end) {
  const piece = html.slice(start, end);
  html = html.slice(0, start) + html.slice(end);
  return piece;
}

// ───────────────────────── 1. Massing strip -> full width 4up grid ────────────
replaceOnce(
  '<!-- MASSING -->\n  <div class="edit-full">',
  '<!-- MASSING -->\n  <div class="edit-full" style="padding-bottom:96px">',
  '1. massing block bottom clearance'
);
replaceOnce(
  '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;padding:0 60px">',
  '<div class="pause-massing" style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;align-items:end">',
  '1. massing flex row -> 4 column grid'
);
for (const name of ['Carve', 'Frame', 'Raise', 'Hold']) {
  replaceOnce(
    `alt="${name}" style="height:175px;width:auto;max-width:100%"`,
    `alt="${name}" style="width:100%;height:auto;display:block"`,
    `1. massing image "${name}" -> fluid width`
  );
}
// breakpoint (inline styles cannot carry media queries)
replaceOnce(
  '.edit-full-narrow img{max-width:100%}',
  '.edit-full-narrow img{max-width:100%}\n  .pause-massing{grid-template-columns:repeat(2,1fr)!important}',
  '1. massing 2up breakpoint at 768px'
);

// ───────────────────────── 2. Site plan ───────────────────────────────────────
replaceOnce(
  'min-width:280px;max-width:960px">',
  'min-width:280px;max-width:820px">',
  '2. site plan image capped at 820px'
);
replaceOnce(
  '<div style="flex:0 1 260px;min-width:200px">\n        <div style="font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:10px">Site Plan Key</div>',
  '<div style="flex:0 1 300px;min-width:220px">\n        <div style="font-size:14px;line-height:1.7;color:var(--text-light)">Seven pavilions follow the bend of the South Edisto, linked by an elevated boardwalk that keeps the floodplain intact. Parking and the emergency lane stay at the tree line, so arrival happens on foot. The sequence moves from welcome to library to studio, with open air pavilions holding the pauses between, and ends at the historic fishing cabin.</div>\n        <div style="font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:10px;margin-top:28px">Site Plan Key</div>',
  '2. site plan paragraph added + left column widened to 300px'
);

// ───────────────────────── 3. Economy diagram -> full width ───────────────────
{
  const label = '3. economy regional sourcing -> full width block';
  const iSection = html.indexOf('id="pause-economy"');
  if (iSection === -1) throw new Error('pause-economy not found');
  const openMark = '<div class="edit-images" style="align-items:stretch">';
  const start = html.indexOf(openMark, iSection);
  const endMark = 'alt="Regional Sourcing" style="width:100%;max-width:860px;display:block;margin:0 auto"></div>\n    </div>\n  </div>';
  must(endMark, `${label} (tail)`);
  const end = html.indexOf(endMark, start) + endMark.length;
  if (start === -1 || end < start) throw new Error(`${label}: bounds not resolved`);
  cut(start, end);
  const inject =
    '</div>\n\n' +
    '  <!-- ECONOMY DIAGRAM (full width) -->\n' +
    `  <div class="edit-full" style="padding-top:0;padding-bottom:48px"><img loading="lazy" src="${b64('regional-sourcing')}" alt="Regional Sourcing" style="width:100%;display:block"></div>`;
  html = html.slice(0, start) + inject + html.slice(start);
  console.log(`[ok] ${label}`);
}

// ───────────────────────── 4. Equitable pair -> full width, hierarchical ──────
{
  const label = '4. equitable user groups + proximity map -> full width block';
  const proximityBlob = srcOf('alt="Library Proximity Map" style="width:100%;max-width:860px;display:block;margin:0 auto"', 'proximity map');
  const iSection = html.indexOf('id="pause-equitable"');
  if (iSection === -1) throw new Error('pause-equitable not found');
  const openMark = '<div class="edit-images" style="align-items:stretch">';
  const start = html.indexOf(openMark, iSection);
  const endMark = 'alt="Library Proximity Map" style="width:100%;max-width:860px;display:block;margin:0 auto"></div>\n    </div>\n  </div>';
  must(endMark, `${label} (tail)`);
  const end = html.indexOf(endMark, start) + endMark.length;
  if (start === -1 || end < start) throw new Error(`${label}: bounds not resolved`);
  cut(start, end);
  // Sizing: the diagram is portrait (0.75) and the map is landscape (1.55), so
  // matching pixel widths would make the diagram a ~1700px tall wall next to a
  // ~650px map. Sized instead so the two read as peers — the diagram stays the
  // wider, primary figure; the map sits slightly narrower and comes down from
  // its previous 860px.
  const inject =
    '</div>\n\n' +
    '  <!-- EQUITABLE DIAGRAMS (full width block; diagram primary / map secondary) -->\n' +
    `  <div class="edit-full" style="padding-top:0;padding-bottom:12px"><img loading="lazy" src="${b64('user-groups')}" alt="User Groups" style="width:100%;max-width:900px;display:block;margin:0 auto"></div>\n` +
    `  <div class="edit-full" style="padding-top:12px;padding-bottom:48px"><img loading="lazy" src="${proximityBlob}" alt="Library Proximity Map" style="width:100%;max-width:820px;display:block;margin:0 auto"></div>`;
  html = html.slice(0, start) + inject + html.slice(start);
  console.log(`[ok] ${label}`);
}

// ───────────────────────── 5. Well-Being daylight diagram ─────────────────────
swapBlob('alt="Daylight and Ventilation Diagram"', b64('daylight-ventilation-trim'), '5. daylight + ventilation re-trimmed');

// ───────────────────────── 6. Ecosystems pair ─────────────────────────────────
swapBlob('alt="Ecosystem Diagram" style="width:100%"', b64('ecosystem-diagram'), '6a. ecosystem metric icons re-cropped');
swapBlob('alt="Site Ecology Diagram" style="width:100%"', b64('site-ecology'), '6b. site ecology replaced from Ecology.jpg');

// ───────────────────────── 7. Move the studio render below Design for Change ──
{
  const label = '7. studio interior render relocated below Design for Change';
  const blockStart = html.indexOf('  <!-- STUDIO INTERIOR (new) -->');
  if (blockStart === -1) throw new Error('studio interior block not found');
  const tail = 'alt="Studio interior with framed art"><div class="img-caption">Studio and gallery interior</div></div>';
  must(tail, `${label} (tail)`);
  const blockEnd = html.indexOf(tail, blockStart) + tail.length;
  const block = cut(blockStart, blockEnd);
  const studioBlob = (block.match(/src="(data:image\/[^"]+)"/) || [])[1];
  if (!studioBlob) throw new Error('could not read studio render blob');

  // tidy the blank line the cut left behind between the two render blocks
  replaceOnce(
    'alt="Interior Library"><div class="img-caption">Library and lounge interior</div></div>\n\n\n',
    'alt="Interior Library"><div class="img-caption">Library and lounge interior</div></div>\n\n',
    '7. blank line tidied after library render'
  );

  const inject =
    '  <!-- STUDIO INTERIOR (moved: sits after Design for Change) -->\n' +
    `  <div class="edit-full" style="padding-top:64px;padding-bottom:64px"><img loading="lazy" src="${studioBlob}" alt="Studio interior with framed art"><div class="img-caption">Studio and gallery interior</div></div>\n\n`;
  const waterMark = must('  <!-- WATER -->', '7. water anchor');
  const w = html.indexOf(waterMark);
  html = html.slice(0, w) + inject + html.slice(w);
  console.log(`[ok] ${label}`);
}

// breathing room around the remaining full bleed render
replaceOnce(
  '<!-- INTERIOR RENDERS -->\n  <div class="edit-full">',
  '<!-- INTERIOR RENDERS -->\n  <div class="edit-full" style="padding-top:64px;padding-bottom:64px">',
  '7. library render breathing room'
);

// ───────────────────────── 8. Energy — restore the EUI waterfall ──────────────
replaceOnce(
  'alt="Energy Budget" style="width:100%;max-width:560px;display:block;margin:0 auto"></div>',
  'alt="Energy Budget" style="width:100%;max-width:560px;display:block;margin:0 auto"></div>\n' +
  `      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('energy-eui')}" alt="Energy use intensity chart" style="width:100%;max-width:560px;display:block;margin:0 auto"></div>`,
  '8. energy EUI waterfall chart restored'
);

// ───────────────────────── sanity gates ───────────────────────────────────────
for (const [needle, label] of [
  ['</html>', 'closing html tag'],
  ['boards-popup', 'boards popup'],
  ['flipbook-popup', 'flipbook popup'],
  ['id="page-the-pause"', 'caesura page'],
  ['alt="Building Section"', 'building section (must be untouched)'],
]) {
  if (html.indexOf(needle) === -1) throw new Error(`SANITY FAIL: ${label} missing`);
}
if (html.indexOf('__cf_email__') !== -1) throw new Error('SANITY FAIL: __cf_email__ reappeared');
if (html.indexOf('data-cfasync') !== -1) throw new Error('SANITY FAIL: data-cfasync reappeared');
if (!html.trimEnd().endsWith('</html>')) throw new Error('SANITY FAIL: file does not end with </html>');
if (html.length < 25_000_000) throw new Error(`SANITY FAIL: file shrank to ${html.length}`);

writeFileSync(FILE, html);
console.log(`\nwritten: ${(startLen / 1e6).toFixed(2)}MB -> ${(html.length / 1e6).toFixed(2)}MB`);
