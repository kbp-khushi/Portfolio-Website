// Reverie: the axo legends become one vertical list to the right of each drawing (her ask, 2026-11-17),
// placed like her boards. Exploded axos: list top right. ATL site: own column right of the axo, bottom
// aligned. SAV site: the right column already holds the massing, so the list sits under the massing,
// where Board 1 has it. Run once after reverie-pins.mjs.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
if (html.includes('class="rv-side"')) throw new Error('already done');

// SAV site: wrap the massing and the legend into one right column, legend last
const sav = html.match(/(<div class="rv-site">\r\n    <div class="rv-pins">[\s\S]*?<\/div>)\r\n    (<div class="rv-legend">[\s\S]*?<\/ol><\/div>)\r\n    (<div class="rv-mass">[\s\S]*?\r\n    <\/div>)\r\n  <\/div>/);
if (!sav) throw new Error('sav site not found');
html = html.replace(sav[0], `${sav[1]}\r\n    <div class="rv-side">\r\n    ${sav[3]}\r\n    ${sav[2]}\r\n    </div>\r\n  </div>`);

const CSS = `/* numbered key discs over the axos, like the boards; sized off the drawing's width so they scale with it */
.rv-pins{position:relative;container-type:inline-size}
.rv-pins>img{width:100%;height:auto;display:block}
.rv-pin{position:absolute;transform:translate(-50%,-50%);width:2.3cqw;height:2.3cqw;min-width:15px;min-height:15px;max-width:26px;max-height:26px;border-radius:50%;background:#fff;border:1px solid #000;color:#000;font-family:var(--title);font-size:clamp(7px,1.05cqw,11px);font-weight:600;display:flex;align-items:center;justify-content:center;line-height:1;box-sizing:border-box;pointer-events:none}
/* legends run down vertically on the right of each axo, like the boards */
.rv-legend ol{list-style:none;margin:0;padding:0;font-size:12px;line-height:1.9;color:var(--text-light)}
.rv-legend li{break-inside:avoid;white-space:nowrap}
.rv-legend .rv-key-num{display:inline-block;width:26px;color:var(--text)}
.rv-axo{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:40px;align-items:start}
.rv-site>.rv-pins{grid-row:1;grid-column:1}
.rv-side{grid-row:1;grid-column:2;contain:size;display:flex;flex-direction:column;gap:32px}
.rv-side>.rv-mass{flex:1 1 0;min-height:0}
.rv-site-l{grid-template-columns:200px minmax(0,860px) 190px}
.rv-site-l>.rv-mass{grid-row:1;grid-column:1}.rv-site-l>.rv-pins{grid-row:1;grid-column:2}.rv-site-l>.rv-legend{grid-row:1;grid-column:3;align-self:end}
@media(max-width:1280px){.rv-site-l{grid-template-columns:200px minmax(0,860px)}.rv-site-l>.rv-legend{grid-row:2;grid-column:2;align-self:start;margin-top:-30px}}
@media(max-width:900px){.rv-axo{grid-template-columns:1fr;gap:18px}.rv-side{display:contents}.rv-side>.rv-mass{order:1}.rv-site>.rv-pins,.rv-site-l>.rv-mass,.rv-site-l>.rv-pins,.rv-site-l>.rv-legend{grid-row:auto;grid-column:auto}.rv-site .rv-legend{margin-top:-10px}.rv-legend ol{columns:2 140px;column-gap:20px}}`;
const re = /\/\* numbered key discs over the axos[\s\S]*?\.rv-legend ol\{columns:2 140px;column-gap:20px\}\}/;
if (!re.test(html)) throw new Error('css block not found');
html = html.replace(re, CSS.replace(/\n/g, '\r\n'));

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'pins', n('class="rv-pin"'), 'legends', n('class="rv-legend"'), 'side', n('class="rv-side"'));
