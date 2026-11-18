// Reverie: the 4 options she approved together on 2026-11-18 ("all"):
// 1. The Light: water room + lattice walls side by side (pair via reverie-pairs.mjs, run separately)
// 2. The Garden: waterfall fills the image column (its 560 px cap removed)
// 3. Exploded axo legends inside the drawing, on the white panel: SAV top left, ATL top right
// 4. Every legend reads name first, number on the right, like her boards
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
const swap = (a, b) => {
  if (!html.includes(a)) { a = a.replace(/\r\n/g, '\n'); b = b.replace(/\r\n/g, '\n'); }
  if (!html.includes(a)) throw new Error('missing: ' + a.slice(0, 90));
  html = html.replace(a, b);
};

// 2. waterfall
swap('<div style="max-width:560px"><img width="1600" height="2000" loading="lazy" src="images/214-reverie-waterfall.jpg"',
  '<div><img width="1600" height="2000" loading="lazy" src="images/214-reverie-waterfall.jpg"');

// 3. exploded legends inside the drawing; ATL axo gets a right hand modifier
swap('<div class="rv-axo"><div class="rv-pins"><img width="1932" height="2448" loading="lazy" src="images/225-reverie-exploded-atl-cropped.jpg"',
  '<div class="rv-axo rv-axo-r"><div class="rv-pins"><img width="1932" height="2448" loading="lazy" src="images/225-reverie-exploded-atl-cropped.jpg"');
swap('.rv-axo{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:40px;align-items:start}',
  '.rv-axo{max-width:1200px;margin:0 auto;position:relative}\r\n' +
  '/* exploded axo legends inside the drawing on the same white panel as the site ones: SAV top left, ATL top right */\r\n' +
  '.rv-axo>.rv-legend{position:absolute;top:20px;left:20px;z-index:2;padding:14px 18px 12px;background:#fff}\r\n' +
  '.rv-axo-r>.rv-legend{left:auto;right:20px}');
swap('@media(max-width:900px){.rv-axo{grid-template-columns:1fr;gap:18px}',
  '@media(max-width:900px){.rv-axo>.rv-legend{position:static;margin-top:18px;padding:0;background:none}');

// 4. name first, number on the right
swap('.rv-legend li{break-inside:avoid;white-space:nowrap}', '.rv-legend li{break-inside:avoid;white-space:nowrap;display:flex;justify-content:space-between;gap:24px}');
swap('.rv-legend .rv-key-num{display:inline-block;width:26px;color:var(--text)}', '.rv-legend .rv-key-num{order:2;color:var(--text)}');

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'legends', n('class="rv-legend"'), 'pairs', n('class="rv-pair"'));
