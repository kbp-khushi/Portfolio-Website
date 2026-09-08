import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
const FM = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/facade-mask';
const b64 = n => readFileSync(`${FM}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;

// rebuild everything between the photograph row and the project nav:
// the brief on the left, the keyed strategies image small beside it,
// and the process sheet dropped entirely
const start = html.indexOf('id="page-facade-mask"');
if (start === -1) throw new Error('facade mask page missing');
const descAt = html.indexOf('<div class="pp-description"', start);
const navAt = html.indexOf('<div class="project-nav"', start);
if (descAt === -1 || navAt === -1) throw new Error('facade mask bounds not found');

const block = `<div class="fm-brief">
    <div class="fm-text">
      <p>A facade you wear. The brief was to take a climate and build its environmental strategy as a mask, which turns an abstract set of tactics into something that has to fit a face, and something you have to see and breathe through.</p>
      <p>I chose Dubai, where the strategies that matter in a hot arid desert climate are shading, daylighting and ventilation. Three traditional elements do that work, and each became part of the mask: <strong>mashrabiya</strong> lattice screens, which diffuse light and filter dust while letting hot air escape; <strong>sikkas</strong>, the narrow alleys built close enough to stay shaded and channel wind toward the creek; and <strong>central courtyards</strong>, turned away from the sun, their overhangs and louvers blocking direct light while the walls hold off dusty winds.</p>
      <p>Put together, these are not defenses against the climate so much as ways of using it. That is the argument the mask is making.</p>
    </div>
    <img class="fm-strategies" loading="lazy" src="${b64('strategies')}" alt="The mask worn, with each strategy keyed to the element it comes from">
  </div>
  `;

html = html.slice(0, descAt) + block + html.slice(navAt);
console.log('[ok] brief and strategies image set side by side; process sheet removed');

const CSS_ANCHOR = '.fm-finals{display:grid';
if (html.split(CSS_ANCHOR).length - 1 !== 1) throw new Error('css anchor not found');
html = html.replace(CSS_ANCHOR, () => `.fm-brief{display:grid;grid-template-columns:1fr 380px;gap:52px;align-items:start;padding:64px 60px 40px;max-width:1240px}
.fm-text p{margin:0 0 14px;max-width:60ch}
.fm-text p:last-child{margin-bottom:0}
.fm-strategies{width:100%;display:block}
@media(max-width:900px){.fm-brief{grid-template-columns:1fr;gap:28px;padding:40px 16px 32px}.fm-strategies{max-width:420px}}
${CSS_ANCHOR}`);
console.log('[ok] styles added');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
console.log('process sheet gone:', !html.includes('Process and Ideation'));
