// Reverie: the 2 site axo legends sit inside their drawings (her ask, 2026-11-18): Atlanta Site in the
// bottom left corner, Back40 Site in the top left, on a small white panel. They overlap the axo's grid
// cell (not inside .rv-pins, so the numbered discs keep their positions). Phone: back under the drawing.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
// the CSS area has mixed line endings, so accept LF where CRLF is not found
const swap = (a, b) => {
  if (!html.includes(a)) { a = a.replace(/\r\n/g, '\n'); b = b.replace(/\r\n/g, '\n'); }
  if (!html.includes(a)) throw new Error('missing: ' + a.slice(0, 80));
  html = html.replace(a, b);
};

// SAV: lift the Back40 legend out of the side column so it is a grid item next to the axo
const m = html.match(/\r?\n    (<div class="rv-legend"><div class="rv-key-title">Back40 Site<\/div>[\s\S]*?<\/ol><\/div>)\r?\n    <\/div>\r?\n  <\/div>/);
if (!m) throw new Error('back40 legend not found');
html = html.replace(m[0], '\r\n    </div>\r\n    ' + m[1] + '\r\n  </div>');

// CSS: ATL grid back to 2 columns, both legends overlap their axo's cell
swap('.rv-site-l{grid-template-columns:200px minmax(0,860px) 190px}\r\n', '');
swap('.rv-site-l>.rv-legend{grid-row:1;grid-column:3;align-self:end}', '');
swap('@media(max-width:1280px){.rv-site-l{grid-template-columns:200px minmax(0,860px)}.rv-site-l>.rv-legend{grid-row:2;grid-column:2;align-self:start;margin-top:-30px}}\r\n', '');
swap('.rv-side>.rv-mass{flex:1 1 0;min-height:0}',
  '.rv-side>.rv-mass{flex:1 1 0;min-height:0}\r\n' +
  '/* site legends inside the drawing: Back40 top left, Atlanta bottom left, on a small white panel */\r\n' +
  '.rv-site>.rv-legend{grid-row:1;grid-column:1;justify-self:start;align-self:start;z-index:1;margin:20px;padding:14px 18px 12px;background:#fff}\r\n' +
  '.rv-site-l>.rv-legend{grid-column:2;align-self:end}');
swap('.rv-site-l>.rv-legend{grid-row:auto;grid-column:auto}.rv-site .rv-legend{margin-top:-10px}',
  '.rv-site-l>.rv-legend{grid-row:auto;grid-column:auto}.rv-site>.rv-legend{grid-row:auto;grid-column:auto;margin:-10px 0 0;padding:0;background:none}');

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'legends', n('class="rv-legend"'), 'pins', n('class="rv-pin"'), 'scales', n('class="rv-scale"'));
