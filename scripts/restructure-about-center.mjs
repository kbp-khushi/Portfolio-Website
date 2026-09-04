import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;

// wrap the whole About section in one centred measure so the title, divider,
// intro, experience, education, tools and licensure all share an edge
const OPEN='<section class="section" id="about" style="background:#FFF">\n';
if (html.split(OPEN).length-1 !== 1) throw new Error('about section open tag not unique');
const start=html.indexOf(OPEN)+OPEN.length;
const end=html.indexOf('</section>', start);
if (end===-1) throw new Error('about section close not found');
const inner=html.slice(start,end);
if (inner.includes('about-wrap')) throw new Error('already wrapped');
html = html.slice(0,start) + '  <div class="about-wrap">\n' + inner + '  </div>\n' + html.slice(end);
console.log('[ok] about section wrapped');

const anchor='.resume-grid{display:grid;grid-template-columns:1fr;gap:56px;max-width:1120px}';
if (html.split(anchor).length-1 !== 1) throw new Error('resume-grid rule not unique');
html = html.replace(anchor, () =>
  '.about-wrap{max-width:1120px;margin:0 auto}\n.resume-grid{display:grid;grid-template-columns:1fr;gap:56px}');
console.log('[ok] about-wrap style added, redundant cap removed');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
