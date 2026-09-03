// Caesura revision pass 7 — undo the full width experiment, rebuild Economy and
// Equitable as CSS laid out pieces inside their .edit-images column, and embed
// the approved building section crop.

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
function srcOf(altMarker, label) {
  must(altMarker, `${label} (src lookup)`);
  const a = html.indexOf(altMarker);
  const s = html.lastIndexOf('src="', a);
  const from = s + 5, to = html.indexOf('"', from);
  const blob = html.slice(from, to);
  if (!blob.startsWith('data:image/')) throw new Error(`src before ${label} is not a data URI`);
  return blob;
}
function swapBlob(altMarker, newBlob, label) {
  const old = srcOf(altMarker, label);
  const a = html.indexOf(altMarker);
  const s = html.lastIndexOf('src="', a) + 5;
  html = html.slice(0, s) + newBlob + html.slice(s + old.length);
  console.log(`[ok] ${label} — blob swapped (${(old.length / 1024).toFixed(0)}KB -> ${(newBlob.length / 1024).toFixed(0)}KB)`);
}
// Replace the span running from `startAnchor` through the end of `endAnchor`.
function replaceSpan(startAnchor, endAnchor, newMarkup, label) {
  must(startAnchor, `${label} (start)`);
  must(endAnchor, `${label} (end)`);
  const s = html.indexOf(startAnchor);
  const e = html.indexOf(endAnchor, s) + endAnchor.length;
  if (e <= s) throw new Error(`${label}: anchors out of order`);
  html = html.slice(0, s) + newMarkup + html.slice(e);
  console.log(`[ok] ${label}`);
}

const img = (blob, alt, style) => `<img loading="lazy" src="${blob}" alt="${alt}" style="${style}">`;

// ───────────────── 1. Site plan paragraph — drop the fishing cabin clause ────
replaceOnce(
  'with open air pavilions holding the pauses between, and ends at the historic fishing cabin.</div>',
  'with open air pavilions holding the pauses between.</div>',
  '1. site plan paragraph trimmed'
);

// ───────────────── 3. Economy — map over legend, back in .edit-images ────────
replaceSpan(
  '    </div>\n    </div>\n\n  <!-- ECONOMY DIAGRAM (full width) -->',
  'alt="Regional Sourcing" style="width:100%;display:block"></div>',
  `    </div>
    <div class="edit-images" style="align-items:stretch">
      <div style="width:100%">
        ${img(b64('economy-map'), 'Regional Sourcing', 'width:100%;max-width:700px;display:block;margin:0 auto')}
        ${img(b64('economy-legend'), 'Regional sourcing supplier legend', 'width:100%;max-width:900px;display:block;margin:28px auto 0')}
      </div>
    </div>
  </div>`,
  '3. economy split into map + legend inside the images column'
);

// ───────────────── 4. Equitable — icon row, chart pair, then the map ─────────
{
  const proximity = srcOf('alt="Library Proximity Map" style="width:100%;max-width:820px;display:block;margin:0 auto"', 'proximity map');
  const icons = [1, 2, 3, 4, 5]
    .map(n => `          ${img(b64(`equitable-icon-${n}`), ['Local Residents', 'Retirees', 'Families', 'Seasonal Visitors', 'Outdoor Recreation Users'][n - 1], 'width:100%;height:auto;display:block')}`)
    .join('\n');
  replaceSpan(
    '    </div>\n    </div>\n\n  <!-- EQUITABLE DIAGRAMS (full width block; diagram primary / map secondary) -->',
    'alt="Library Proximity Map" style="width:100%;max-width:820px;display:block;margin:0 auto"></div>',
    `    </div>
    <div class="edit-images" style="align-items:stretch">
      <div style="width:100%">
        <div class="pause-usergroups" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:end">
${icons}
        </div>
        <div class="pause-charts" style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:center;margin-top:28px">
          ${img(b64('equitable-chart-1'), 'Seasonal use by user group', 'width:100%;height:auto;display:block')}
          ${img(b64('equitable-chart-2'), 'Time of day use by user group', 'width:100%;height:auto;display:block')}
        </div>
        ${img(proximity, 'Library Proximity Map', 'width:100%;max-width:780px;display:block;margin:40px auto 0')}
      </div>
    </div>
  </div>`,
    '4. equitable split into icon row + chart pair + map'
  );
}

// Breakpoints for the two new grids. The icon row needs the descendant
// selector: a later generic helper in this stylesheet rewrites any inline
// grid-template-columns:repeat(5,1fr) to 3 columns at 768px, and at 3 up the
// captions baked into these icons are far too small to read. Two classes beat
// that helper's single attribute selector regardless of source order.
replaceOnce(
  '  .pause-massing{grid-template-columns:repeat(2,1fr)!important}',
  '  .pause-massing{grid-template-columns:repeat(2,1fr)!important}\n' +
  '  .edit-images .pause-usergroups{grid-template-columns:repeat(2,1fr)!important}\n' +
  '  .pause-charts{grid-template-columns:1fr!important}',
  '4. usergroups 2up + charts stacked at 768px'
);

// ───────────────── 5. Building section — embed the approved crop ─────────────
swapBlob('alt="Building Section"', b64('building-section'), '5. building section embedded (approved crop)');

// ───────────────── sanity gates ──────────────────────────────────────────────
for (const [needle, label] of [
  ['</html>', 'closing html tag'],
  ['boards-popup', 'boards popup'],
  ['flipbook-popup', 'flipbook popup'],
  ['id="page-the-pause"', 'caesura page'],
  ['alt="Building Section"', 'building section image'],
  ['id="pause-economy"', 'economy section'],
  ['id="pause-equitable"', 'equitable section'],
]) {
  if (html.indexOf(needle) === -1) throw new Error(`SANITY FAIL: ${label} missing`);
}
if (html.indexOf('edit-full" style="padding-top:0') !== -1) throw new Error('SANITY FAIL: a full width diagram block survived');
if (html.indexOf('__cf_email__') !== -1) throw new Error('SANITY FAIL: __cf_email__ reappeared');
if (html.indexOf('data-cfasync') !== -1) throw new Error('SANITY FAIL: data-cfasync reappeared');
if (!html.trimEnd().endsWith('</html>')) throw new Error('SANITY FAIL: file does not end with </html>');
if (html.length < 25_000_000) throw new Error(`SANITY FAIL: file shrank to ${html.length}`);

writeFileSync(FILE, html);
console.log(`\nwritten: ${(startLen / 1e6).toFixed(2)}MB -> ${(html.length / 1e6).toFixed(2)}MB`);
