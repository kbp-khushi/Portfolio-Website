import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// ---- locate the Well-Being edit-row -------------------------------------
const START = '<!-- WELL-BEING (louver full width, matching exterior library) -->';
const END = '<!-- ECOSYSTEMS + WATER -->';
const s = html.indexOf(START), e = html.indexOf(END);
if (s === -1 || e === -1 || e < s) throw new Error('well-being section not found');
let seg = html.slice(s, e);

// ---- 1) new paragraph ---------------------------------------------------
const oldPara = 'Every occupied space opens to the forest or the river. Movement through the pavilions provides a physical connection with the landscape, with moments of enclosure and exposure alternating along the path as the blend of indoor and outdoor space shapes the sense of comfort inside a public building.';
if (seg.split(oldPara).length - 1 !== 1) throw new Error('paragraph match count wrong');
const newPara = 'Every occupied space opens to the forest or the river, and moments of enclosure and exposure alternate along the path through the pavilions. The plans map daylight factor across all three, averaging 3.7%, which keeps the reading rooms and work areas in the range that supports sustained use without glare. Three louver studies tested how to get there: a solid panel darkened the interior, straight louvers admitted too much direct sun, and the angled profile filtered daylight while blocking the high summer sun. The section carries that through, drawing light in above the louvers and moving air across the plan and beneath the raised floor, so comfort comes from the section itself before any mechanical system.';
seg = seg.replace(oldPara, () => newPara);

// ---- 2) shrink louvers + narrow their caption boxes ---------------------
const louverImg = 'style="height:210px;width:auto;max-width:100%"';
if (seg.split(louverImg).length - 1 !== 3) throw new Error('expected 3 louver images');
seg = seg.split(louverImg).join('style="height:160px;width:auto;max-width:100%"');

const capOpen = '<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">';
if (seg.split(capOpen).length - 1 !== 3) throw new Error('expected 3 louver captions');
seg = seg.split(capOpen).join('<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px;max-width:165px">');

// ---- 3) reorder: floor plan first, louvers, then daylight+ventilation ----
const louverRowStart = seg.indexOf('<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">');
const planStart = seg.indexOf('<div style="width:100%;margin-top:32px">');
const dvStart = seg.indexOf('<div style="width:100%;margin-top:24px">');
const dvEnd = seg.indexOf('</div>', seg.indexOf('alt="Daylight and Ventilation Diagram"')) + 6;
if ([louverRowStart, planStart, dvStart].some(i => i === -1) || !(louverRowStart < planStart && planStart < dvStart)) {
  throw new Error('unexpected well-being image order');
}
const louverRow = seg.slice(louverRowStart, planStart).trimEnd();
const planBlock = seg.slice(planStart, dvStart).trimEnd();
const dvBlock = seg.slice(dvStart, dvEnd).trimEnd();

const reordered = [
  planBlock.replace('margin-top:32px', 'margin-top:0'),
  '\n      ' + louverRow.replace('<div style="display:flex;gap:16px', '<div style="margin-top:36px;display:flex;gap:16px'),
  '\n      ' + dvBlock,
  '\n    '
].join('');
seg = seg.slice(0, louverRowStart) + reordered + seg.slice(dvEnd);

html = html.slice(0, s) + seg + html.slice(e);
writeFileSync(P, html);
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'), '| popups:', (html.match(/boards-popup/g) || []).length, (html.match(/flipbook-popup/g) || []).length);
const order = [...html.slice(s, s + seg.length).matchAll(/alt="([^"]+)"/g)].map(m => m[1]);
console.log('image order:', order.join(' | '));
