// Reverie: her drawing titles, north arrows and bar scales back on the 4 axos (2026-11-18).
// Geometry is her LABELS AND SCALES layer in BOARDS.indd (read from a copy): 12 pt circle at 0.5 pt,
// 1 pt north line from 0.47r in to 1.46r out, 3.2 pt bar (black then white, 0.4 pt edge), 8 pt labels,
// 10 pt title right aligned to the bar end. Positions are the bar ends / north centre / title corner
// run through scripts/reverie-keys.mjs, so the bar keeps its true length against the drawing.
// --pt is one board point in cqw of the drawing, so the type and arrow scale with it.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
if (html.includes('class="rv-scale"')) throw new Error('scales already in');

const S = {
  'site-sav': { img: '222-reverie-site-sav-framed.jpg', title: 'Back40 Site &amp; Approach', barPt: 1318.22 - 1208.856, labels: ['0’', '50’', '100’'], north: [[-2.226, -1.732], [-6.913, -5.381]],
    p: { S0: [87.11, 97.18], S1: [92.81, 97.18], S2: [98.52, 97.18], N: [84.63, 97.18] } },
  'site-atl': { img: '224-reverie-site-atl-framed.jpg', title: 'Atlanta Site &amp; Approach', barPt: 6936.2 - 6829.709, labels: ['0’', '50’', '100’'], north: [[0.635, -2.748], [1.971, -8.535]],
    p: { S0: [86.77, 97.69], S1: [92.04, 97.69], S2: [97.32, 97.69], N: [84.42, 97.69] } },
  'exploded-sav': { img: '223-reverie-exploded-sav.jpg', title: 'Program &amp; Circulation', barPt: 1290.1 - 1162.204, labels: ['0’', '10’', '50’'], north: [[-2.225, -1.732], [-6.913, -5.381]], tight: true,
    p: { S0: [80.15, 97.08], S1: [82.66, 97.08], S2: [92.73, 97.08], N: [77.81, 97.08] } },
  'exploded-atl': { img: '225-reverie-exploded-atl-cropped.jpg', title: 'Program &amp; Circulation', barPt: 6927.7 - 6761.792, labels: ['0’', '10’', '50’'], north: [[0.634, -2.748], [1.97, -8.535]], tight: true,
    p: { S0: [80.65, 90.4], S1: [83.79, 90.4], S2: [96.36, 90.4], N: [78.4, 90.4] } },
};
const r2 = (n) => +n.toFixed(2);

for (const [id, s] of Object.entries(S)) {
  const { S0, S1, S2, N } = s.p;
  const w = S2[0] - S0[0], y = S0[1];
  const pt = (w / s.barPt).toFixed(4);
  const right = r2(100 - S2[0]), bottom = r2(100 - y);
  const [[x1, y1], [x2, y2]] = s.north;
  const block = `<div class="rv-scale" style="--pt:${pt}cqw">` +
    `<div class="rv-scale-t" style="right:${right}%;bottom:${bottom}%">${s.title}</div>` +
    `<svg class="rv-north" style="left:${N[0]}%;top:${N[1]}%" viewBox="-9.5 -9.5 19 19" aria-hidden="true"><circle r="6" fill="none" stroke="#000" stroke-width=".5"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="1"/></svg>` +
    `<div class="rv-bar" style="left:${S0[0]}%;top:${y}%;width:${r2(w)}%"><i style="width:${r2(100 * (S1[0] - S0[0]) / w)}%"></i></div>` +
    `<span class="rv-bar-l" style="left:${S0[0]}%;top:${y}%">${s.labels[0]}</span>` +
    `<span class="rv-bar-l rv-bar-mid" style="left:${S1[0]}%;top:${y}%">${s.labels[1]}</span>` +
    `<span class="rv-bar-l rv-bar-end" style="right:${right}%;top:${y}%">${s.labels[2]}</span>` +
    `</div>`;
  // the scale goes inside the axo's .rv-pins wrapper, after its numbered discs
  const re = new RegExp(`(<div class="rv-pins"><img [^>]*src="images/${s.img.replace(/\./g, '\\.')}"[^>]*>(?:<span class="rv-pin"[^>]*>\\d\\d</span>)+)</div>`);
  if (!re.test(html)) throw new Error('axo not found: ' + id);
  html = html.replace(re, (_, a) => `${a}${block}</div>`);
}

const CSS = `/* her drawing title, north arrow and bar scale, sized in board points (--pt) so the bar stays true to the drawing */
.rv-scale{position:absolute;inset:0;pointer-events:none;font-family:var(--title);color:var(--text-light);letter-spacing:.02em}
.rv-scale-t{position:absolute;margin-bottom:max(7px,calc(10*var(--pt)));font-size:max(8px,calc(10*var(--pt)));font-weight:500;line-height:1;white-space:nowrap}
.rv-north{position:absolute;width:max(11px,calc(19*var(--pt)));height:max(11px,calc(19*var(--pt)));transform:translate(-50%,-50%);overflow:visible}
.rv-bar{position:absolute;height:max(4px,calc(3.2*var(--pt)));transform:translateY(-50%);background:#fff;border:.5px solid #000;box-sizing:border-box}
.rv-bar i{position:absolute;left:0;top:0;bottom:0;background:#000}
.rv-bar-l{position:absolute;margin-top:max(4px,calc(4*var(--pt)));transform:translateX(-50%);font-size:max(7px,calc(8*var(--pt)));line-height:1;white-space:nowrap}
.rv-bar-l.rv-bar-end{transform:none}
@media(max-width:600px){.rv-bar-mid{display:none}}`;
const anchor = '/* legends run down vertically on the right of each axo, like the boards */';
if (!html.includes(anchor)) throw new Error('css anchor missing');
html = html.replace(anchor, CSS.replace(/\n/g, '\r\n') + '\r\n' + anchor);

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'scales', n('class="rv-scale"'), 'pins', n('class="rv-pin"'));
