import { readFileSync, writeFileSync } from 'fs';

// Contact did not read as its own section because structurally it wasn't one.
// It sat as the last item inside .about-wrap, and its heading was 13px
// uppercase grey while every real section heading on the site is
// clamp(32px,4vw,52px) bold. It was dressed as a label inside About.
//
// It now leaves the About column and becomes a full bleed band at the end of
// the view, on black, with a heading the same size as every other section. The
// dark ground bookends the hero and makes it the one surface on the site that
// is not white, which is what "its own section" needs to mean here.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// lift the existing block out of the About column, matching div depth
const OPEN = '<div class="contact-block" id="contact">';
const start = html.indexOf(OPEN);
if (start === -1) throw new Error('contact block not found');
let i = start, depth = 0, end = -1;
const tag = /<(\/?)div\b/g;
tag.lastIndex = start;
for (let m; (m = tag.exec(html)); ) {
  depth += m[1] ? -1 : 1;
  if (depth === 0) { end = html.indexOf('>', m.index) + 1; break; }
}
if (end === -1) throw new Error('could not match the contact block');
const block = html.slice(start, end);
if (!block.includes('kbp.khushi@gmail.com')) throw new Error('unexpected block contents');
html = html.slice(0, start) + html.slice(end);
console.log('[ok] contact block lifted out of .about-wrap,', block.length, 'chars');

// keep its content, rebuild its shell
const email = block.match(/<a class="contact-email"[\s\S]*?<\/a>/)[0];
const row = block.match(/<div class="contact-row">[\s\S]*?<\/div>\s*<\/div>/)[0].replace(/\s*<\/div>$/, '');

const SECTION = '\n<section class="contact-section" id="contact">\n' +
  '  <div class="contact-inner">\n' +
  '    <h2 class="section-title">contact</h2>\n' +
  '    <div class="section-divider"></div>\n' +
  '    ' + email + '\n' +
  '    ' + row + '\n' +
  '  </div>\n' +
  '</section>\n';

const ANCHOR = '</div><!-- end view-about -->';
if (html.split(ANCHOR).length - 1 !== 1) throw new Error('view-about close not unique');
html = html.replace(ANCHOR, () => SECTION + ANCHOR);
console.log('[ok] contact is now a full bleed section at the end of the view');

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

swap('.contact-block{margin-top:96px;padding:44px 0 8px;border-top:2px solid var(--text);scroll-margin-top:100px}',
  '.contact-section{background:#000;color:#fff;padding:110px 60px;scroll-margin-top:0}\n' +
  '.contact-inner{max-width:1120px;margin:0 auto}\n' +
  '.contact-section .section-title{color:#fff}\n' +
  '.contact-section .section-divider{background:#fff;margin-bottom:44px}\n' +
  '.contact-section .contact-email{margin-top:0;color:#fff;font-size:clamp(28px,4.4vw,48px)}\n' +
  '.contact-section .contact-email::after{background:#fff}\n' +
  '.contact-section .contact-row{margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.6)}\n' +
  '.contact-section .contact-row a{color:rgba(255,255,255,.75);border-bottom-color:rgba(255,255,255,.28)}\n' +
  '.contact-section .contact-row a:hover{color:#fff;border-color:#fff}\n' +
  '@media(max-width:768px){.contact-section{padding:72px 24px}}',
  'black band styles replace the old block styles');

// the old heading class is gone, so the fade has to follow the new one
swap("addReveal(document,'.teaser-viewall-wrap,#contact .contact-title,#contact .contact-email,#contact .contact-row','reveal'",
     "addReveal(document,'.teaser-viewall-wrap,#contact .section-title,#contact .section-divider,#contact .contact-email,#contact .contact-row','reveal'",
     'fade follows the new heading');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| contact sections:', c('class="contact-section"'),
  '| id contact:', c('id="contact"'),
  '| email links:', c('mailto:kbp.khushi@gmail.com'),
  '| popups:', c('boards-popup'), c('flipbook-popup'));
