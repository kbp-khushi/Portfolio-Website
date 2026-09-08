import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;

function inPage(pageId, find, replace, label){
  const i=html.indexOf(`id="${pageId}"`);
  const nextPage=html.indexOf('id="page-', i+10);
  const at=html.indexOf(find, i);
  if(at===-1 || (nextPage>-1 && at>nextPage)) throw new Error(`${label}: anchor not inside page`);
  html = html.slice(0,at) + replace + html.slice(at+find.length);
  console.log('[ok]', label);
}

// Beacon: rewritten from her own project text — the community program and the
// environmental systems were both missing from the site
inPage('page-beacon','<div class="pp-description">',`<div class="pp-description">`,'beacon anchor');
{
  const i=html.indexOf('id="page-beacon"');
  const open='<div class="pp-description">';
  const at=html.indexOf(open,i);
  const close=html.indexOf('</div>',at);
  html = html.slice(0,at+open.length)
    + `A police station is a building most people approach only when something has gone wrong. Beacon is built to be entered for other reasons. Alongside the operational station it holds meeting rooms and multipurpose spaces used for events, educational programs and everyday gathering, so the building works as a neighbourhood hub as much as a police station. Transparent materials and open layouts blur the boundary between the two, breaking from the enclosed civic buildings that put officers on one side of a wall and residents on the other. Wind turbines, a solar panel facade, cross ventilation and a water collection system carry that same openness into how the building runs.`
    + html.slice(close);
  console.log('[ok] Beacon rewritten');
}

// Beacon: name the program on the page
inPage('page-beacon',
  '<div class="pp-meta-row"><div class="pp-meta-label">Software</div>',
  `<div class="pp-meta-row"><div class="pp-meta-label">Program</div><div class="pp-meta-value">Police station, meeting rooms, multipurpose community space</div></div>\n      <div class="pp-meta-row"><div class="pp-meta-label">Software</div>`,
  'Beacon program row');

// Fluke ran eight weeks
inPage('page-fluke',
  '<div class="pp-meta-label">Completion Time</div><div class="pp-meta-value">10 weeks</div>',
  '<div class="pp-meta-label">Completion Time</div><div class="pp-meta-value">8 weeks</div>',
  'Fluke completion time');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
