import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const B64 = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/revit';
const b64 = n => readFileSync(`${B64}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;

// ---------- 1) stylesheet additions ----------------------------------------
const cssAnchor = '@media(max-width:768px){\n  .flipbook-prev{left:8px}';
if (html.split(cssAnchor).length - 1 !== 1) throw new Error('css anchor not unique');
const css = `/* REVIT AXO FIGURES (professional work) */
.rv-figure{position:relative;max-width:1400px;margin:0 auto}
.rv-figure img{width:100%;display:block}
.rv-num{position:absolute;font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--text);margin-top:6px}
.rv-key{max-width:1400px;margin:20px auto 0;display:flex;justify-content:flex-end}
.rv-key-inner{font-size:12px;line-height:1.9;color:var(--text-light)}
.rv-key-title{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.rv-key-inner .rv-key-num{display:inline-block;width:26px;color:var(--text)}
@media(max-width:768px){
  .rv-num{font-size:9px;letter-spacing:1px}
  .rv-key{justify-content:flex-start}
}

`;
html = html.replace(cssAnchor, () => css + cssAnchor);

// ---------- 2) the four figures --------------------------------------------
// number positions measured from each drawing's callout bounding boxes;
// left side callouts anchor bottom left, right side callouts bottom right
const DRAWINGS = [
  { key:'king', room:'King Guestroom',
    alt:'King guestroom axonometric with custom Revit families called out',
    items:[
      ['01','Sculptural Headboard &amp; Bed', 'left:6.04%',  'top:45.87%'],
      ['02','Rolled Arm Sofa',                'left:6.75%',  'top:74.88%'],
      ['03','Double Arm Wall Sconce',         'right:15.39%','top:37.87%'],
      ['04','Tiered Wall Sconce',             'right:13.42%','top:66.75%'],
      ['05','Ribbed Dome Flush Mount',        'right:11.03%','top:86.25%'],
    ]},
  { key:'queen', room:'Queen Guestroom',
    alt:'Queen guestroom axonometric with custom Revit families called out',
    items:[
      ['01','Sculptural Headboard &amp; Bed', 'left:2.18%',  'top:29.87%'],
      ['02','Round Nightstand',               'left:7.03%',  'top:55.00%'],
      ['03','Bolster Daybed',                 'left:3.02%',  'top:84.87%'],
      ['04','Oval Wall Sconce',               'right:22.00%','top:36.87%'],
      ['05','Tiered Pendant',                 'right:7.59%', 'top:81.00%'],
    ]},
  { key:'library', room:'Library',
    alt:'Library axonometric with the custom millwork wall unit called out',
    items:[
      ['01','Custom Millwork Wall Unit',      'right:33.45%','top:49.87%'],
    ]},
  { key:'pdr', room:'Private Dining Room',
    alt:'Private dining room axonometric with the wine storage wall called out',
    items:[
      ['01','Wine Storage Wall',              'right:11.17%','top:62.37%'],
    ]},
];

const figures = DRAWINGS.map(d => {
  const nums = d.items.map(([n,,x,y]) => `      <span class="rv-num" style="${x};${y}">${n}</span>`).join('\n');
  const rows = d.items.map(([n,label]) => `        <div><span class="rv-key-num">${n}</span>${label}</div>`).join('\n');
  return `  <div class="edit-full" style="padding-top:48px;padding-bottom:48px">
    <div class="rv-figure">
      <img loading="lazy" src="${b64(d.key)}" alt="${d.alt}">
${nums}
    </div>
    <div class="rv-key">
      <div class="rv-key-inner">
        <div class="rv-key-title">${d.room}</div>
${rows}
      </div>
    </div>
  </div>`;
}).join('\n');

// ---------- 3) swap description + replace the card grid ---------------------
const oldDesc = '<p>Custom parametric geometry built during my internship at The Johnson Studio at Cooper Carry, for the public spaces and guestrooms of a high-end hospitality project. Shown here as isolated components to highlight the modeling itself, not the project it was built for.</p>';
if (html.split(oldDesc).length - 1 !== 1) throw new Error('description not unique');
html = html.replace(oldDesc, () => '<p>Custom Parametric Revit families built during my internship at The Johnson Studio at Cooper Carry, for the guestrooms and public spaces of a hospitality project. Each drawing shows one room modeled in full, with a few chosen families I developed called out beside it.</p>');

const gridStart = html.indexOf('<div style="padding:0 60px 60px">', html.indexOf('id="page-professional-work"'));
const gridEnd = html.indexOf('<footer class="footer"', gridStart);
if (gridStart === -1 || gridEnd === -1) throw new Error('card grid bounds not found');
const removed = html.slice(gridStart, gridEnd);
if ((removed.match(/class="project-card"/g) || []).length !== 7) throw new Error('expected 7 cards to replace');
html = html.slice(0, gridStart) + figures + '\n  ' + html.slice(gridEnd);

writeFileSync(P, html);
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'), '| popups:', (html.match(/boards-popup/g)||[]).length, (html.match(/flipbook-popup/g)||[]).length);
