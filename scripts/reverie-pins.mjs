// Reverie: numbered key discs + legends on the 4 axos, matching her final boards (2026-11-17).
// Positions come from scripts/reverie-keys.mjs (disc centres read from BOARDS.indd), legends are
// her board lists verbatim. Re-running replaces the previous pins (stops if the pins are already in).
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');

const P = {
  'site-sav': { '01': [20.52, 80.76], '02': [41.92, 67.53], '03': [52.14, 58.05], '04': [50.77, 50.1], '05': [85.83, 85.68], '06': [29.72, 32.61], '07': [69.59, 29.42] },
  'site-atl': { '01': [28.79, 71.54], '02': [58.02, 66.17], '03': [56.73, 73.01], '04': [53.88, 40.11], '05': [64.57, 26.08], '06': [26.62, 20.55], '07': [78.82, 79.02], '08': [87.7, 55.39], '09': [47.54, 44.69] },
  'exploded-sav': { '01': [41.4, 31.75], '02': [33.69, 42.56], '03': [50.67, 47.06], '04': [59.77, 91.93], '05': [62.55, 79.46], '06': [72.15, 47.54], '07': [46.63, 34.92], '08': [71.52, 34.9], '09': [75.45, 28.44], '10': [62.66, 66.2], '11': [52.31, 10.69], '12': [47.44, 16], '13': [64.05, 9.08], '14': [72.58, 17.94] },
  'exploded-atl': { '01': [56.12, 53.95], '02': [56.54, 57.48], '03': [44.7, 53.37], '04': [33.41, 45.45], '05': [41.37, 47.65], '06': [20.76, 44.65], '07': [34.96, 52.19], '08': [39.12, 59.71], '09': [50.27, 64.79], '10': [66.14, 65.26], '11': [12.78, 50.81], '12': [17.19, 56.32], '13': [17.19, 60.29], '14': [17.19, 64.5], '15': [21.44, 33.31], '16': [19.99, 38.6], '17': [23.2, 9.93] },
};
const L = {
  'site-sav': ['Back40 Site', ['entrance from Route 17', 'parking', 'farm garden', 'apiary pavilion', 'athletic field', 'utility compound', 'the retreat']],
  'site-atl': ['Atlanta Site', ['I-75 + I-85', 'Buford-Spring Connector', 'SCAD Way underpass', 'FASH entrance', 'SCAD Atlanta', '1660 Peachtree', 'FORTY, SCAD housing', 'parking', 'the retreat']],
  'exploded-sav': ['The Retreat', ['the lattice walk', 'the waterfall', 'the court', 'the curved bench', 'the fountain', 'the water room', 'the sky room', 'the tower', 'the viewing platform', 'the fire pit', 'pod 1', 'pod 2', 'pod 3', 'the hub']],
  'exploded-atl': ['The Retreat', ['the arrival', 'the FASH steps', 'the slot benches', 'the dark walk', 'the bench in the gap', 'the niches', 'the waterfall nook', 'canopy 1 seating, the pool', 'canopy 2 seating', 'canopy 3 reading spot', 'the tower', 'pod 1', 'pod 2', 'pod 3', 'the overlook', 'the glass room', 'community space']],
};
const esc = s => s.replace(/&/g, '&amp;');
const pins = id => Object.entries(P[id]).map(([n, [x, y]]) => `<span class="rv-pin" style="left:${x}%;top:${y}%">${n}</span>`).join('');
const legend = id => {
  const [t, items] = L[id];
  return `<div class="rv-legend"><div class="rv-key-title">${t}</div><ol>${items.map((s, i) => `<li><span class="rv-key-num">${String(i + 1).padStart(2, '0')}</span>${esc(s)}</li>`).join('')}</ol></div>`;
};
const wrap = (img, id) => `<div class="rv-pins">${img}${pins(id)}</div>`;

function swap(re, fn, label) {
  const m = html.match(re);
  if (!m) throw new Error('no match: ' + label);
  html = html.replace(re, fn);
}

if (html.includes('class="rv-pin"')) throw new Error('pins already in, nothing to do');

// site axos: wrapper is the grid child, legend sits right after it (its own grid row on desktop)
swap(/(<img [^>]*src="images\/222-reverie-site-sav-framed\.jpg"[^>]*>)/, m => wrap(m, 'site-sav') + '\r\n    ' + legend('site-sav'), 'site sav');
swap(/(<img [^>]*src="images\/224-reverie-site-atl-framed\.jpg"[^>]*>)/, m => wrap(m, 'site-atl') + '\r\n    ' + legend('site-atl'), 'site atl');
// exploded axos: centred 1200 px block, legend under it
for (const [file, id] of [['223-reverie-exploded-sav.jpg', 'exploded-sav'], ['225-reverie-exploded-atl-cropped.jpg', 'exploded-atl']]) {
  const re = new RegExp(`(<img [^>]*src="images/${file.replace(/\./g, '\\.')}"[^>]*?) style="max-width:1200px;margin:0 auto">`);
  swap(re, (_, a) => `<div class="rv-axo">${wrap(a + '>', id)}\r\n    ${legend(id)}</div>`, id);
}

// CSS, once
const CSS = `/* numbered key discs over the axos, like the boards; sized off the drawing's width so they scale with it */
.rv-pins{position:relative;container-type:inline-size}
.rv-pins>img{width:100%;height:auto;display:block}
.rv-pin{position:absolute;transform:translate(-50%,-50%);width:2.3cqw;height:2.3cqw;min-width:15px;min-height:15px;max-width:26px;max-height:26px;border-radius:50%;background:#fff;border:1px solid #000;color:#000;font-family:var(--title);font-size:clamp(7px,1.05cqw,11px);font-weight:600;display:flex;align-items:center;justify-content:center;line-height:1;box-sizing:border-box;pointer-events:none}
.rv-axo{max-width:1200px;margin:0 auto}
.rv-legend{margin-top:18px}
.rv-legend ol{list-style:none;margin:0;padding:0;columns:4 180px;column-gap:28px;font-size:12px;line-height:1.9;color:var(--text-light)}
.rv-legend li{break-inside:avoid}
.rv-legend .rv-key-num{display:inline-block;width:26px;color:var(--text)}
.rv-site{row-gap:0}
.rv-site>.rv-pins{grid-row:1;grid-column:1}.rv-site>.rv-mass{grid-row:1;grid-column:2}.rv-site>.rv-legend{grid-row:2;grid-column:1}
.rv-site-l>.rv-mass{grid-column:1}.rv-site-l>.rv-pins,.rv-site-l>.rv-legend{grid-column:2}
@media(max-width:900px){.rv-site>.rv-pins,.rv-site>.rv-mass,.rv-site>.rv-legend{grid-row:auto;grid-column:auto}.rv-site>.rv-legend{margin-top:-10px}.rv-legend ol{columns:2 140px;column-gap:20px}}
`;
html = html.replace('.rv-site>img{width:100%;height:auto;display:block}', m => m + '\r\n' + CSS.replace(/\n/g, '\r\n').trimEnd());

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'pins', n('class="rv-pin"'), 'legends', n('class="rv-legend"'));
