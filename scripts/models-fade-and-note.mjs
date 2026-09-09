import { readFileSync, writeFileSync } from 'fs';

// 1. The two Caesura model cards go back to stacked on desktop and stay side
//    by side only on mobile. Making them a row everywhere was my
//    overcorrection: the ask was about vertical space on a phone.
// 2. Additional work and professional work items fade in on scroll, the way
//    the About lists do. Both sections use .additional-item.
// 3. Drops the closing sentence of the software note.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// ---------------------------------------------------------------------------
// 1) stacked on desktop, side by side on mobile
// ---------------------------------------------------------------------------
swap('.model-stack{display:flex;flex-direction:row;gap:18px;max-width:none;align-self:start}',
     '.model-stack{display:flex;flex-direction:column;gap:26px;max-width:250px;align-self:start}\r\n' +
     '@media(max-width:768px){.model-stack{flex-direction:row;gap:14px;max-width:none}.model-stack .model-card{flex:1 1 0}}',
     'model cards stacked on desktop, side by side on mobile');

swap('.model-card{cursor:pointer;flex:1 1 0;min-width:0}',
     '.model-card{cursor:pointer;min-width:0}',
     'model cards no longer forced to share width on desktop');

// ---------------------------------------------------------------------------
// 2) the work index lists fade in like the About lists
// ---------------------------------------------------------------------------
swap("[['#about .axp-item',70],['#about .honors-list li',60]].forEach(function(pair){",
     "[['#about .axp-item',70],['#about .honors-list li',60],['.additional-item',70]].forEach(function(pair){",
     'additional and professional work items join the fade');

// ---------------------------------------------------------------------------
// 3) the software note loses its last sentence
// ---------------------------------------------------------------------------
swap(' They are not used to produce final drawings.', '', 'software note trimmed');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
console.log('final drawings sentence gone:', !html.includes('not used to produce final drawings'),
  '| additional-item count:', c('class="additional-item"'));
