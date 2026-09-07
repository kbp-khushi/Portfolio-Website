import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const CB = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/camber';
const b64 = n => readFileSync(`${CB}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;
const once = (s, l) => { const c = html.split(s).length - 1; if (c !== 1) throw new Error(`${l}: ${c} matches`); return s; };
const swap = (o, n, l) => { once(o, l); html = html.replace(o, () => n); console.log('[ok]', l); };

// ---------------------------------------------------------------- 1) Camber
const CLOSE_BTN = '<button class="pp-close" onclick="exitProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s">&times;</button>';

const drawing = (blob, label, max) => `    <div class="pp-reveal" style="margin-bottom:44px;max-width:${max}px">
      <img loading="lazy" src="${b64(blob)}" alt="${label}" style="width:100%;display:block">
      <div class="dg-label-b">${label}</div>
    </div>`;

const camber = `<div class="project-page" id="page-camber">
  <button class="pp-back" onclick="exitProject()">&#10229;Back</button>
  ${CLOSE_BTN}
  <div class="pp-header">
    <div class="pp-label">Charette, Undergraduate</div>
    <h2 class="pp-title">Camber</h2>
    <div class="pp-subtitle">An Inhabited Bridge</div>
    <div class="pp-course">ARCH 303 | Professor Nicholson | Spring 2024</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>A one week charette for a bridge that is also a house. Two piers anchor a curved timber truss that carries the crossing and the dwelling hung inside it: sleeping and bathing at one end, kitchen and gathering at the other, so crossing the span means passing through someone&rsquo;s home. The camber of the deck, the upward curve a bridge is built with so it reads level under load, became the organising line for both.</p>
    <p style="font-family:var(--title);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:12px">Laser cut wood, hand glued, with chipboard</p>
  </div>
  <div style="padding:0 60px">
    <div class="camber-photos">
      <img loading="lazy" src="${b64('photo-1')}" alt="Study model, long elevation">
      <img loading="lazy" src="${b64('photo-2')}" alt="Study model, truss and deck">
      <img loading="lazy" src="${b64('photo-3')}" alt="Study model, dwelling within the span">
      <img loading="lazy" src="${b64('photo-4')}" alt="Study model, three quarter view">
    </div>
    <div class="dg-label-b" style="margin-bottom:52px">Study Model</div>
${drawing('plans', 'First and Second Floor Plans', 900)}
${drawing('elevation-east', 'East Elevation', 1100)}
${drawing('elevation-north-section-a', 'North Elevation and Section A', 1100)}
${drawing('section-b', 'Section B', 1100)}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <span></span>
    <a onclick="closeProject();setTimeout(function(){openProject('fluke');},100)" class="pnav-link"><span class="pnav-eyebrow">Same studio</span><span class="pnav-name">Fluke</span></a>
  </div>
</div>

`;

const pageAnchor = '<div class="project-page" id="page-professional-work">';
once(pageAnchor, 'professional work page');
html = html.replace(pageAnchor, () => camber + pageAnchor);
console.log('[ok] Camber page created');

{
  const secStart = html.indexOf('<section class="section" id="additional-work">');
  if (secStart === -1) throw new Error('additional work section missing');
  const listOpen = '<div class="additional-list">';
  const listAt = html.indexOf(listOpen, secStart);
  if (listAt === -1) throw new Error('additional list missing');
  const entry = '\n    <div class="additional-item" onclick="openProject(\'camber\')">\n      <div class="additional-title">Camber</div>\n      <div class="additional-sub">One week charette for a bridge that is also a house</div>\n    </div>';
  html = html.slice(0, listAt + listOpen.length) + entry + html.slice(listAt + listOpen.length);
  console.log('[ok] Camber listed under Additional Work');
}

// ------------------------------------------------- 2) model thumbnail sizing
swap('.model-stack{display:flex;flex-direction:column;gap:20px;max-width:215px;align-self:start}',
     '.model-stack{display:flex;flex-direction:column;gap:22px;max-width:250px;align-self:start}',
     'model stack widened');
swap('.model-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--line);transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     '.model-img{width:100%;height:168px;object-fit:contain;display:block;background:var(--bg);transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     'model thumbnails no longer cropped');

// ------------------------------------ 3) drawing set moves into the header
{
  const start = html.indexOf('<div class="drawing-set">');
  if (start === -1) throw new Error('drawing set block missing');
  const end = html.indexOf('<!-- INTEGRATION', start);
  if (end === -1) throw new Error('integration marker missing');
  html = html.slice(0, start) + html.slice(end);
  console.log('[ok] drawing set lifted out of the body');
}

const boardsOpen = '<a class="we-boards-btn" onclick="document.getElementById(\'boards-popup\').style.display=\'flex\'">';
swap(boardsOpen, '<div class="pp-aside"><a class="we-boards-btn" style="position:static" onclick="document.getElementById(\'boards-popup\').style.display=\'flex\'">', 'boards button wrapped');

// Woven Edge has an identical boards button, so anchor to the wrapper we just added
const boardsTail = '<rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>View Final Boards</a>';
{
  const asideAt = html.indexOf('<div class="pp-aside">');
  const at = html.indexOf(boardsTail, asideAt);
  if (at === -1) throw new Error('caesura boards tail not found after the wrapper');
  const panel = `
      <div class="pp-aside-set">
        <div class="dg-label">Technical Drawing Set</div>
        <p>A complete nineteen sheet set drawn at graduate level: life safety plan with occupancy and exit calculations, site and floor plans, elevations, building sections, wall sections and details, and a full structural package with foundation, framing and roof framing plans, structural sections and calculations.</p>
        <a class="we-boards-btn" style="position:static" href="Caesura_Technical_Drawing_Set.pdf" target="_blank" rel="noopener">View the Drawing Set</a>
      </div>
    </div>`;
  html = html.slice(0, at + boardsTail.length) + panel + html.slice(at + boardsTail.length);
  console.log('[ok] drawing set panel added beside the boards button');
}

// ---------------------------------------------------------------- 5) styles
once('.model-stack{', 'css anchor');
html = html.replace('.model-stack{', `.camber-photos{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.camber-photos img{width:100%;display:block}
.pp-aside{position:absolute;top:100px;right:60px;z-index:3;width:300px;display:flex;flex-direction:column;align-items:flex-start;gap:18px}
.pp-aside-set{border-top:1px solid var(--line);padding-top:18px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.pp-aside-set p{font-size:13px;line-height:1.65;color:var(--text-light);margin:0}
@media(max-width:900px){.pp-aside{position:static;width:auto;margin-top:24px}}
@media(max-width:768px){.camber-photos{grid-template-columns:1fr;gap:14px}}
.model-stack{`);
console.log('[ok] styles added');

writeFileSync(P, html);
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', (html.match(/boards-popup/g) || []).length, (html.match(/flipbook-popup/g) || []).length, '| imgs:', (html.match(/<img/g) || []).length);
