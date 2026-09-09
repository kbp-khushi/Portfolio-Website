import { readFileSync, writeFileSync } from 'fs';

// Contact Me joins View Resume under the bio. Same button style as the rest of
// the site, and it scrolls to the contact block rather than opening a mail
// client, which is what the hero's contact button does too.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

const OPEN = '<div class="about-resume-btn">';
const start = html.indexOf(OPEN);
if (start === -1) throw new Error('resume button wrapper not found');
const close = html.indexOf('</a></div>', start);
if (close === -1) throw new Error('wrapper close not found');

const CONTACT =
  '<a class="we-boards-btn" style="position:static" href="#contact" ' +
  "onclick=\"document.getElementById('contact').scrollIntoView({block:'start'});return false;\">" +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/></svg>Contact Me</a>';

html = html.slice(0, close + 4) + CONTACT + html.slice(close + 4);
console.log('[ok] Contact Me added beside View Resume');

swap('.about-resume-btn{margin-top:22px}',
     '.about-resume-btn{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}',
     'the two buttons sit side by side');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| Contact Me:', c('>Contact Me</a>'),
  '| resume links:', c('Khushi_Patel_Resume.pdf'),
  '| popups:', c('boards-popup'), c('flipbook-popup'));
