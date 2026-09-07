import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const WRAP_OPEN='  <div class="about-wrap">\n';
const WRAP_CLOSE='  </div>\n';

function sectionBounds(openTag, label) {
  if (html.split(openTag).length-1 !== 1) throw new Error(`${label}: open tag not unique`);
  const start=html.indexOf(openTag)+openTag.length;
  const end=html.indexOf('</section>', start);
  if (end===-1) throw new Error(`${label}: close not found`);
  return { start, end };
}
function unwrap(openTag, label) {
  const { start, end } = sectionBounds(openTag, label);
  let inner=html.slice(start,end);
  if (!inner.startsWith(WRAP_OPEN)) throw new Error(`${label}: not wrapped as expected`);
  if (!inner.endsWith(WRAP_CLOSE)) throw new Error(`${label}: close marker missing`);
  inner = inner.slice(WRAP_OPEN.length, inner.length-WRAP_CLOSE.length);
  html = html.slice(0,start) + inner + html.slice(end);
  console.log('[ok] unwrapped', label);
}
function wrap(openTag, label) {
  const { start, end } = sectionBounds(openTag, label);
  const inner=html.slice(start,end);
  if (inner.includes('about-wrap')) throw new Error(`${label}: already wrapped`);
  html = html.slice(0,start) + WRAP_OPEN + inner + WRAP_CLOSE + html.slice(end);
  console.log('[ok] wrapped', label);
}

// work index and its project cards go back to full width
unwrap('<section class="section" id="projects" style="background:#FFF">\n', 'work index');
// professional work joins additional work on the centred measure
wrap('<section class="section" id="professional-work">\n', 'professional work');

// About: top of the page returns to full width, resume block stays centred
{
  const { start, end } = sectionBounds('<section class="section" id="about" style="background:#FFF">\n', 'about');
  let inner=html.slice(start,end);
  if (!inner.startsWith(WRAP_OPEN) || !inner.endsWith(WRAP_CLOSE)) throw new Error('about: not wrapped as expected');
  inner = inner.slice(WRAP_OPEN.length, inner.length-WRAP_CLOSE.length);

  const RESUME_START='  <div style="padding-bottom:56px"><a class="dl-link" href="Khushi_Patel_Resume.pdf"';
  const i=inner.indexOf(RESUME_START);
  if (i===-1) throw new Error('about: resume block start not found');
  inner = inner.slice(0,i) + WRAP_OPEN + inner.slice(i) + WRAP_CLOSE;
  html = html.slice(0,start) + inner + html.slice(end);
  console.log('[ok] about: intro full width, resume block centred');
}

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
