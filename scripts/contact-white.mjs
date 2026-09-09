import { readFileSync, writeFileSync } from 'fs';

// The black band was wrong: nothing else on this site is anything but white,
// so a dark ground reads as imported rather than as part of the system.
//
// The structural fix stays, since that was the actual defect: contact is still
// its own section outside .about-wrap with a full size heading. What separates
// it now is what separates every other section here, plus the heavy top rule
// the original block already had the right instinct about.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = '.contact-section{background:#000;color:#fff;padding:110px 60px;scroll-margin-top:0}\n' +
  '.contact-inner{max-width:1120px;margin:0 auto}\n' +
  '.contact-section .section-title{color:#fff}\n' +
  '.contact-section .section-divider{background:#fff;margin-bottom:44px}\n' +
  '.contact-section .contact-email{margin-top:0;color:#fff;font-size:clamp(28px,4.4vw,48px)}\n' +
  '.contact-section .contact-email::after{background:#fff}\n' +
  '.contact-section .contact-row{margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.6)}\n' +
  '.contact-section .contact-row a{color:rgba(255,255,255,.75);border-bottom-color:rgba(255,255,255,.28)}\n' +
  '.contact-section .contact-row a:hover{color:#fff;border-color:#fff}\n' +
  '@media(max-width:768px){.contact-section{padding:72px 24px}}';

const NEW = '/* Contact is a section in its own right, not a block inside About. It is\n' +
  '   separated the way every section here is separated, by a full size heading\n' +
  '   and the section divider, over a rule that runs the full width. */\n' +
  '.contact-section{padding:100px 60px;border-top:2px solid var(--text);scroll-margin-top:0}\n' +
  '.contact-inner{max-width:1120px;margin:0 auto}\n' +
  '.contact-section .section-divider{margin-bottom:40px}\n' +
  '.contact-section .contact-email{margin-top:0;font-size:clamp(28px,4.4vw,48px)}\n' +
  '.contact-section .contact-row{margin-top:40px;padding-top:24px;border-top:1px solid var(--line)}\n' +
  '@media(max-width:768px){.contact-section{padding:60px 24px}}';

const c = html.split(OLD).length - 1;
if (c !== 1) throw new Error(`black band styles: ${c} matches`);
html = html.replace(OLD, () => NEW);
console.log('[ok] black ground removed, section separation kept');

writeFileSync(P, html);
const n = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| dark rules left:', n('#fff') + n('#000'),
  '| contact section:', n('class="contact-section"'));
