import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;

// wrap a section's contents in the shared centred measure
function wrapSection(openTag, label, mustContain) {
  if (html.split(openTag).length-1 !== 1) throw new Error(`${label}: open tag not unique`);
  const start=html.indexOf(openTag)+openTag.length;
  const end=html.indexOf('</section>', start);
  if (end===-1) throw new Error(`${label}: close not found`);
  const inner=html.slice(start,end);
  if (inner.includes('about-wrap')) throw new Error(`${label}: already wrapped`);
  if (mustContain && !inner.includes(mustContain)) throw new Error(`${label}: missing ${mustContain}`);
  html = html.slice(0,start) + '  <div class="about-wrap">\n' + inner + '  </div>\n' + html.slice(end);
  console.log('[ok] wrapped', label);
}

wrapSection('<section class="section" id="projects" style="background:#FFF">\n', 'work index', 'project-grid');
wrapSection('<section class="section" id="additional-work">\n', 'additional work', 'additional-list');

// that list had its own narrower cap, which would sit off centre inside the measure
const anchor='.additional-list{display:flex;flex-direction:column;max-width:900px}';
if (html.split(anchor).length-1 !== 1) throw new Error('additional-list rule not unique');
html = html.replace(anchor, () => '.additional-list{display:flex;flex-direction:column}');
console.log('[ok] additional work list fills the measure');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
