// Reverie: her drawing titles, north arrows and bar scales on the 4 axos (2026-11-18).
// Geometry is her LABELS AND SCALES layer in BOARDS.indd (read from a copy): 12 pt circle at 0.5 pt,
// 1 pt north line from 0.47r in to 1.46r out, 3.2 pt bar (black then white), 8 pt labels, 10 pt title.
// Bar length and split come from the board bar ends run through scripts/reverie-keys.mjs, so the bar
// keeps its true length against the drawing (--bar, in cqw of the drawing).
// Layout (her ask "make them all cleanly aligned"): one block, identical on all 4, tucked into the
// drawing's bottom right corner at the same inset. Title right aligned to the bar end, north arrow
// left of the bar and centred on it, 0' flush with the bar start, end label flush with the bar end,
// middle label centred on the split. --pt is one board point in cqw so type and arrow scale too.
// Re-runnable: replaces any earlier scale blocks and their CSS.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');

// bar ends (S0, S1 split, S2) as % of each web image's width, from reverie-keys.mjs
const S = {
  'site-sav': { img: '222-reverie-site-sav-framed.jpg', title: 'Back40 Site &amp; Approach', barPt: 1318.22 - 1208.856, labels: ['0’', '50’', '100’'], north: [[-2.226, -1.732], [-6.913, -5.381]], x: [87.11, 92.81, 98.52] },
  'site-atl': { img: '224-reverie-site-atl-framed.jpg', title: 'Atlanta Site &amp; Approach', barPt: 6936.2 - 6829.709, labels: ['0’', '50’', '100’'], north: [[0.635, -2.748], [1.971, -8.535]], x: [86.77, 92.04, 97.32] },
  'exploded-sav': { img: '223-reverie-exploded-sav.jpg', title: 'Program &amp; Circulation', barPt: 1290.1 - 1162.204, labels: ['0’', '10’', '50’'], north: [[-2.225, -1.732], [-6.913, -5.381]], x: [80.15, 82.66, 92.73] },
  'exploded-atl': { img: '225-reverie-exploded-atl-cropped.jpg', title: 'Program &amp; Circulation', barPt: 6927.7 - 6761.792, labels: ['0’', '10’', '50’'], north: [[0.634, -2.748], [1.97, -8.535]], x: [80.65, 83.79, 96.36] },
};
const r = (n, d = 2) => +n.toFixed(d);

// clear earlier versions
html = html.replace(/<div class="rv-scale"[\s\S]*?(?:<\/span><\/div>(?=<\/div>)|<!--\/rv-scale-->)/g, '');

for (const [id, s] of Object.entries(S)) {
  const [x0, x1, x2] = s.x, w = x2 - x0;
  const [[a, b], [c, d]] = s.north;
  const block = `<div class="rv-scale" style="--pt:${r(w / s.barPt, 4)}cqw;--bar:${r(w)}cqw;--split:${r(100 * (x1 - x0) / w)}%">` +
    `<div class="rv-scale-t">${s.title}</div>` +
    `<svg class="rv-north" viewBox="-9.5 -9.5 19 19" aria-hidden="true"><circle r="6" fill="none" stroke="#000" stroke-width=".5"/><line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#000" stroke-width="1"/></svg>` +
    `<div class="rv-bar"><i></i></div>` +
    `<div class="rv-bar-ls"><span>${s.labels[0]}</span><span class="rv-bar-mid">${s.labels[1]}</span><span class="rv-bar-end">${s.labels[2]}</span></div>` +
    `</div><!--/rv-scale-->`;
  const re = new RegExp(`(<div class="rv-pins"><img [^>]*src="images/${s.img.replace(/\./g, '\\.')}"[^>]*>(?:<span class="rv-pin"[^>]*>\\d\\d</span>)+)</div>`);
  if (!re.test(html)) throw new Error('axo not found: ' + id);
  html = html.replace(re, (_, m) => `${m}${block}</div>`);
}

const CSS = `/* her drawing title, north arrow and bar scale: one block, same on all 4, in the drawing's bottom right corner.
   --bar is the true bar length (cqw of the drawing); --pt is one board point, so type and arrow scale with it */
.rv-scale{position:absolute;right:max(12px,2.4cqw);bottom:max(10px,2.4cqw);display:grid;grid-template-columns:auto var(--bar);column-gap:max(6px,calc(8*var(--pt)));row-gap:0;align-items:center;pointer-events:none;font-family:var(--title);color:var(--text-light);letter-spacing:.02em;line-height:1}
.rv-scale-t{grid-column:1/-1;justify-self:end;font-size:max(10px,calc(10*var(--pt)));font-weight:500;white-space:nowrap;margin-bottom:max(7px,calc(9*var(--pt)))}
.rv-north{grid-column:1;grid-row:2;justify-self:end;width:max(11px,calc(19*var(--pt)));height:max(11px,calc(19*var(--pt)));overflow:visible;margin:min(-2px,calc(-3*var(--pt))) 0}
.rv-bar{grid-column:2;grid-row:2;position:relative;height:max(4px,calc(3.2*var(--pt)));background:#fff;border:.5px solid #000;box-sizing:border-box}
.rv-bar i{position:absolute;left:0;top:0;bottom:0;width:var(--split);background:#000}
.rv-bar-ls{grid-column:2;grid-row:3;position:relative;margin-top:max(4px,calc(4*var(--pt)));display:flex;justify-content:space-between;font-size:max(8.5px,calc(8*var(--pt)))}
.rv-bar-mid{position:absolute;left:var(--split);transform:translateX(-50%)}
@media(max-width:600px){.rv-bar-mid{display:none}}`;
html = html.replace(/\/\* her drawing title, north arrow and bar scale[\s\S]*?@media\(max-width:600px\)\{\.rv-bar-mid\{display:none\}\}\r?\n?/, '');
const anchor = '/* legends run down vertically on the right of each axo, like the boards */';
if (!html.includes(anchor)) throw new Error('css anchor missing');
html = html.replace(anchor, CSS.replace(/\r?\n/g, '\r\n') + '\r\n' + anchor);

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'scales', n('class="rv-scale"'), 'pins', n('class="rv-pin"'), 'old bits', n('class="rv-scale-t" style'));
