import { readFileSync, writeFileSync } from 'fs';

// 1. On mobile .pp-aside goes static, and since it is the first child of
//    .pp-header it rendered ABOVE the project name. On Caesura that meant the
//    whole right-hand sidebar, the boards button plus the drawing set and
//    section model blocks, came first and the title did not appear until
//    y=1000. The header becomes a flex column on mobile and the aside is
//    ordered after the title and meta.
//
// 2. The hero buttons stack full width. They go back to a single row like
//    desktop, sized down so all three labels fit on one line at 375px.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (oldStr, newStr, label) => {
  const hits = html.split(oldStr).length - 1;
  if (hits !== 1) throw new Error(`${label}: ${hits} matches`);
  html = html.replace(oldStr, () => newStr);
  console.log('[ok]', label);
};

// 1) title leads on mobile
swap('@media(max-width:900px){.pp-aside{position:static;width:auto;margin-top:24px}}',
     '@media(max-width:900px){.pp-header{display:flex;flex-direction:column}.pp-aside{position:static;width:auto;margin-top:24px;order:2}}',
     'project name leads, aside ordered after it');

// 2) hero buttons back in a row, smaller
swap('.hero-actions{margin-top:16px;flex-direction:column;align-items:stretch;width:100%;gap:10px}',
     '.hero-actions{margin-top:16px;flex-direction:row;flex-wrap:nowrap;align-items:stretch;width:auto;gap:8px}',
     'hero buttons back in one row');
swap('.hero-btn{padding:12px 16px;text-align:center;white-space:nowrap}',
     '.hero-btn{padding:9px 9px;font-size:9.5px;letter-spacing:.6px;text-align:center;white-space:nowrap}',
     'hero buttons sized to fit three across');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'));
