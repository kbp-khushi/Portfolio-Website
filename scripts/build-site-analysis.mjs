import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
const B = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/site-analysis';
const b64 = n => readFileSync(`${B}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;
const once = (s, l) => { const c = html.split(s).length - 1; if (c !== 1) throw new Error(`${l}: ${c} matches`); return s; };

const CLOSE_BTN = '<button class="pp-close" onclick="exitProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s">&times;</button>';

const fig = (blob, label, max) => `    <div class="pp-reveal" style="margin-bottom:44px;max-width:${max}px">
      <img loading="lazy" src="${b64(blob)}" alt="${label}" style="width:100%;display:block">
      <div class="dg-label-b">${label}</div>
    </div>`;

const page = `<div class="project-page" id="page-site-analysis">
  <button class="pp-back" onclick="exitProject()">&#10229;Back</button>
  ${CLOSE_BTN}
  <div class="pp-header">
    <div class="pp-label">Site Analysis, Undergraduate</div>
    <h2 class="pp-title">Reading North Charleston</h2>
    <div class="pp-subtitle">The Study That Chose the Program for Beacon</div>
    <div class="pp-course">ARCH 404 | Professor Guess | Fall 2024</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>Site analysis is usually a set of maps filed behind the design. Here it came first and decided what the building would be. The study began as a physical map: a routed wood base, fabric laid over it for topography, hundreds of black pins for the existing fabric, and colored pins linked with thread to trace how people actually move between civic anchors. Red spirals mark intensity where those movements concentrate.</p>
    <p>Working at two radii, two miles and three quarters of a mile, then layering population density, zoning, flood extent and crime data over the same ground, the gap in the neighborhood became legible: the civic institutions people relied on were the ones they trusted least. That reading is what led to a police station as the program, and to <a onclick="closeProject();setTimeout(function(){openProject('beacon');},80)" style="color:var(--accent);cursor:pointer;border-bottom:1px solid var(--line)">Beacon</a>.</p>
  </div>
  <div style="padding:0 60px">
${fig('model-full', 'Physical Site Model', 1100)}
    <div class="sa-pair">
      <div><img loading="lazy" src="${b64('model-details-1')}" alt="Model detail, civic anchors and connections" style="width:100%;display:block"></div>
      <div><img loading="lazy" src="${b64('model-details-2')}" alt="Model detail, movement threads across the site" style="width:100%;display:block"></div>
    </div>
    <div class="dg-label-b" style="margin-bottom:52px">Mapping Movement Between Civic Anchors</div>
    <div class="sa-pair">
      <div><img loading="lazy" src="${b64('radius-2mile')}" alt="Two mile radius analysis" style="width:100%;display:block"><div class="dg-label-b">Two Mile Radius</div></div>
      <div><img loading="lazy" src="${b64('radius-threequarter')}" alt="Three quarter mile radius analysis" style="width:100%;display:block"><div class="dg-label-b">Three Quarter Mile Radius</div></div>
    </div>
    <div style="height:44px"></div>
${fig('research-1', 'Population, Zoning and Flood Research', 1100)}
${fig('research-2', 'Crime, Land Use and District Mapping', 760)}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <span></span>
    <a onclick="closeProject();setTimeout(function(){openProject('beacon');},100)" class="pnav-link"><span class="pnav-eyebrow">The building this became</span><span class="pnav-name">Beacon</span></a>
  </div>
</div>

`;

const pageAnchor = '<div class="project-page" id="page-camber">';
once(pageAnchor, 'camber page');
html = html.replace(pageAnchor, () => page + pageAnchor);
console.log('[ok] site analysis page created');

// list it under Additional Work
{
  const secStart = html.indexOf('<section class="section" id="additional-work">');
  const listOpen = '<div class="additional-list">';
  const listAt = html.indexOf(listOpen, secStart);
  if (secStart === -1 || listAt === -1) throw new Error('additional work list missing');
  const entry = '\r\n    <div class="additional-item" onclick="openProject(\'site-analysis\')">\r\n      <div class="additional-title">Reading North Charleston</div>\r\n      <div class="additional-sub">Physical mapping and research that chose Beacon\u2019s program</div>\r\n    </div>';
  html = html.slice(0, listAt + listOpen.length) + entry + html.slice(listAt + listOpen.length);
  console.log('[ok] listed under Additional Work');
}

// link to it from Beacon
{
  const i = html.indexOf('id="page-beacon"');
  const anchor = '<div id="boards-beacon"';
  const at = html.indexOf(anchor, i);
  if (at === -1) throw new Error('beacon boards container not found');
  const link = `<div class="model-links"><a onclick="closeProject();setTimeout(function(){openProject('site-analysis');},80)">View the site analysis that chose this program</a></div>\r\n  `;
  html = html.slice(0, at) + link + html.slice(at);
  console.log('[ok] linked from Beacon');
}

// styles
once('.camber-photos{display:grid', 'css anchor');
html = html.replace('.camber-photos{display:grid', `.sa-pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:12px}
@media(max-width:768px){.sa-pair{grid-template-columns:1fr;gap:16px}}
.camber-photos{display:grid`);
console.log('[ok] styles added');

writeFileSync(P, html);
const count = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', count('boards-popup'), count('flipbook-popup'));
