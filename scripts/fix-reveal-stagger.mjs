import { readFileSync, writeFileSync } from 'fs';

// The About fade staggers with (i%6)*70 across one combined list, so the six
// AXP rings inherited whatever index they happened to land on: the first ring
// came in at 350ms, after all five behind it. The rings and the honors list
// each get their own counter so they animate in reading order.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = "document.querySelectorAll('#about .exp-item,#about .education-item,#about .ai-tag,#about .about-ai-note,#about .about-lic-item,#about .axp-item,#about .honors-list li').forEach((el,i)=>{";
if (html.split(OLD).length - 1 !== 1) throw new Error('about reveal block not found');

html = html.replace(OLD,
  () => "document.querySelectorAll('#about .exp-item,#about .education-item,#about .ai-tag,#about .about-ai-note,#about .about-lic-item').forEach((el,i)=>{");
console.log('[ok] rings and honors taken out of the shared counter');

// add the two groups with their own stagger, right after that block closes
const ANCHOR = "  el.style.transitionDelay=(i%6)*70+'ms';\r\n  revealObs.observe(el);\r\n});";
if (html.split(ANCHOR).length - 1 !== 1) throw new Error('about reveal block close not unique');
html = html.replace(ANCHOR, () => ANCHOR + "\r\n\r\n" +
  "// the AXP rings and the honors list each read in their own order\r\n" +
  "[['#about .axp-item',70],['#about .honors-list li',60]].forEach(function(pair){\r\n" +
  "  document.querySelectorAll(pair[0]).forEach(function(el,i){\r\n" +
  "    el.classList.add('reveal');\r\n" +
  "    el.style.transitionDelay=(i*pair[1])+'ms';\r\n" +
  "    revealObs.observe(el);\r\n" +
  "  });\r\n" +
  "});");
console.log('[ok] rings and honors get their own stagger');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'));
