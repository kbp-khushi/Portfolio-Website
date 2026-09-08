import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const FM = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask';
const b64 = n => readFileSync(`${FM}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;
const once = (s, l) => { const c = html.split(s).length - 1; if (c !== 1) throw new Error(`${l}: ${c} matches`); return s; };

// ===========================================================================
// 1) Facade Mask: photographs first, shorter copy, and the right images
// ===========================================================================
const start = html.indexOf('id="page-facade-mask"');
if (start === -1) throw new Error('facade mask page missing');
const descOpen = html.indexOf('<div class="pp-description"', start);
const navAt = html.indexOf('<div class="project-nav"', start);
if (descOpen === -1 || navAt === -1) throw new Error('facade mask bounds not found');

const rebuilt = `<div class="fm-finals">
    <img loading="lazy" src="${b64('final-1')}" alt="The mask worn, profile">
    <img loading="lazy" src="${b64('final-2')}" alt="The mask worn, front">
    <img loading="lazy" src="${b64('final-3')}" alt="The mask worn, reverse profile">
  </div>
  <div class="pp-description" style="max-width:720px;padding:32px 60px 40px">
    <p>A facade you wear. The brief was to take a climate and build its environmental strategy as a mask, which turns an abstract set of tactics into something that has to fit a face, and something you have to see and breathe through.</p>
    <p>I chose Dubai, where the strategies that matter in a hot arid desert climate are shading, daylighting and ventilation. Three traditional elements do that work, and each became part of the mask: <strong>mashrabiya</strong> lattice screens, which diffuse light and filter dust while letting hot air escape; <strong>sikkas</strong>, the narrow alleys built close enough to stay shaded and channel wind toward the creek; and <strong>central courtyards</strong>, turned away from the sun, their overhangs and louvers blocking direct light while the walls hold off dusty winds.</p>
    <p>Put together, these are not defenses against the climate so much as ways of using it. That is the argument the mask is making.</p>
  </div>
  <div style="padding:0 60px">
    <div class="pp-reveal" style="margin:0 auto 44px;max-width:1100px">
      <img loading="lazy" src="${b64('strategies')}" alt="Strategies, keyed to the mask" style="width:100%;display:block">
      <div class="dg-label-b" style="text-align:center">Strategies, Keyed to the Mask</div>
    </div>
    <div class="pp-reveal" style="margin:0 auto 44px;max-width:1100px">
      <img loading="lazy" src="${b64('process')}" alt="Process and ideation sketches" style="width:100%;display:block">
      <div class="dg-label-b" style="text-align:center">Process and Ideation</div>
    </div>
  </div>
  `;
html = html.slice(0, descOpen) + rebuilt + html.slice(navAt);
console.log('[ok] facade mask rebuilt: photographs lead, copy trimmed');

// ===========================================================================
// 2) licensure moves alongside software
// ===========================================================================
const LIC = `\r\n      <div class="group-label" style="margin-top:48px">licensure</div>\r\n      <div class="about-lic-item">AXP Hours: 1,336.25 / 3,740 (35.7% complete)</div>\r\n`;
if (html.split(LIC).length - 1 !== 1) throw new Error('licensure block not matched');
html = html.replace(LIC, () => '\r\n');
// single line anchor, since the file carries CRLF endings
const NOTE = '<div class="about-ai-note">The generative tools above are used for research, iteration and visual studies, and for website development and document preparation. They are not used to produce final drawings.</div>';
if (html.split(NOTE).length - 1 !== 1) throw new Error('software note not matched');
html = html.replace(NOTE, () => NOTE + '\r\n        </div>\r\n        <div>\r\n          <div class="group-label">licensure</div>\r\n          <div class="about-lic-item">AXP Hours: 1,336.25 / 3,740 (35.7% complete)</div>');
console.log('[ok] licensure now sits beside software');

// ===========================================================================
// 3) the flipbook needs an obvious way out
// ===========================================================================
// It was absolutely positioned 48px above the image container, so on a tall
// sheet it scrolled off the top and there was no visible way out. Pin it to
// the viewport and give it enough contrast to find.
const OLD_CLOSE = '.flipbook-close{position:absolute;top:-48px;right:0;width:36px;height:36px;border:none;background:transparent;color:rgba(255,255,255,0.55);font-size:18px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;border-radius:50%}';
if (html.split(OLD_CLOSE).length - 1 !== 1) throw new Error('flipbook close rule not matched');
html = html.replace(OLD_CLOSE, () => '.flipbook-close{position:fixed;top:20px;right:20px;z-index:320;width:40px;height:40px;border:1px solid rgba(255,255,255,0.45);background:rgba(0,0,0,0.45);color:rgba(255,255,255,0.95);font-size:20px;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;border-radius:50%}\n.flipbook-close:hover{background:rgba(0,0,0,0.7);border-color:#fff}');
console.log('[ok] flipbook close button pinned to the viewport and made legible');

// the paging arrows failed contrast too
for (const [o, n] of [['.flipbook-prev,.flipbook-next{', '.flipbook-prev,.flipbook-next{']]) {
  if (html.includes(o)) console.log('[ok] arrow rule present');
}
html = html.split('color:rgba(255,255,255,0.5);').join('color:rgba(255,255,255,0.8);');
console.log('[ok] flipbook arrows brightened');

// ---- the aside: give the section model the same treatment as its neighbours
const ASIDE_LINK = '<a class="aside-link" onclick="closeProject();setTimeout(function(){openProject(\'section-model\');},80)">View the section model</a>';
if (html.split(ASIDE_LINK).length - 1 !== 1) throw new Error('aside link not matched');
html = html.replace(ASIDE_LINK, () => `</div>
      <div class="pp-aside-set">
        <div class="dg-label">Section Model</div>
        <p>A handcut study of the building section and its structure, at the scale the drawings describe.</p>
        <a class="we-boards-btn" style="position:static" onclick="closeProject();setTimeout(function(){openProject('section-model');},80)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></svg>View the Section Model</a>`);
console.log('[ok] section model given its own block in the aside');

// ===========================================================================
// 4) styles
// ===========================================================================
once('.sa-row{display:grid', 'css anchor');
html = html.replace('.sa-row{display:grid', `.fm-finals{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:0 60px}
.fm-finals img{width:100%;display:block}
@media(max-width:768px){.fm-finals{grid-template-columns:1fr;gap:14px;padding:0 16px}}
.sa-row{display:grid`);
console.log('[ok] styles added');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
