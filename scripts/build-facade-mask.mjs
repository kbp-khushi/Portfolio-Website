import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const B = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask';
const b64 = n => readFileSync(`${B}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;
const once = (s, l) => { const c = html.split(s).length - 1; if (c !== 1) throw new Error(`${l}: ${c} matches`); return s; };

const CLOSE_BTN = '<button class="pp-close" onclick="exitProject()" style="position:fixed;top:24px;right:24px;z-index:210;width:36px;height:36px;border:1px solid var(--line);background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);color:var(--text-light);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s">&times;</button>';

const fig = (blob, label, max) => `    <div class="pp-reveal" style="margin:0 auto 44px;max-width:${max}px">
      <img loading="lazy" src="${b64(blob)}" alt="${label}" style="width:100%;display:block">
      <div class="dg-label-b" style="text-align:center">${label}</div>
    </div>`;

const page = `<div class="project-page" id="page-facade-mask">
  <button class="pp-back" onclick="exitProject()">&#10229;Back</button>
  ${CLOSE_BTN}
  <div class="pp-header">
    <div class="pp-label">Environmental Control, Undergraduate</div>
    <h2 class="pp-title">Facade Mask</h2>
    <div class="pp-subtitle">Wearing a Climate Strategy for Dubai</div>
    <div class="pp-course">Environmental Control | Professor Guess | Winter 2024</div>
  </div>
  <div class="pp-description" style="max-width:720px;padding:0 60px 40px">
    <p>A facade you wear. The brief was to take a climate and build its environmental strategy as a mask, which turns an abstract set of tactics into something you have to fit to a face, and something you have to be able to see and breathe through.</p>
    <p>I chose Dubai, a hot arid desert climate, where the strategies that matter are shading, daylighting and ventilation. Ventilation cools interior space, shading cools exterior space, and daylighting is a balance: you want the light without the heat that comes with it. Three traditional elements do that work, and each became a part of the mask.</p>
    <p><strong>Mashrabiya</strong> screens are lattice panels of geometric pattern. They diffuse sunlight as it enters without cutting off the view, and the geometry filters dust out of the wind. They let daylight and ventilation through while limiting glass, which in Dubai traps heat, and they let hot air escape as cool air comes in. <strong>Sikkas</strong> are the narrow alleys of traditional Islamic urban fabric, built close enough together to stay shaded most of the day, running north to south and ending at a creek so wind is drawn through them. <strong>Central courtyards</strong> turn away from the sun to cool passively, their walls blocking dusty winds while overhangs and louvers block direct light.</p>
    <p>Put together, these are not defences against the climate so much as ways of using it. That is the argument the mask is making.</p>
  </div>
  <div style="padding:0 60px">
${fig('strategies', 'Strategies, Keyed to the Mask', 1100)}
${fig('process', 'Process and Ideation', 1100)}
${fig('final-images', 'Final Images', 900)}
  </div>
  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">
    <span></span>
    <a onclick="closeProject();setTimeout(function(){openProject('beacon');},100)" class="pnav-link"><span class="pnav-eyebrow">Also with Professor Guess</span><span class="pnav-name">Beacon</span></a>
  </div>
</div>

`;

const pageAnchor = '<div class="project-page" id="page-camber">';
once(pageAnchor, 'camber page');
html = html.replace(pageAnchor, () => page + pageAnchor);
console.log('[ok] Facade Mask page created');

{
  const secStart = html.indexOf('<section class="section" id="additional-work">');
  const listOpen = '<div class="additional-list">';
  const listAt = html.indexOf(listOpen, secStart);
  if (secStart === -1 || listAt === -1) throw new Error('additional work list missing');
  const entry = '\r\n    <div class="additional-item" onclick="openProject(\'facade-mask\')">\r\n      <div class="additional-title">Facade Mask</div>\r\n      <div class="additional-sub">A Dubai climate strategy built as something you wear</div>\r\n    </div>';
  html = html.slice(0, listAt + listOpen.length) + entry + html.slice(listAt + listOpen.length);
  console.log('[ok] listed under Additional Work');
}

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
