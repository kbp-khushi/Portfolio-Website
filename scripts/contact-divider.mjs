import { readFileSync, writeFileSync } from 'fs';

// Every divider on the site is 150px, but the rule the eye reads is that the
// divider runs past the word above it: work is 115px wide, about is 134px.
// "contact" is 172px, so the same 150px falls 22px short and looks stubby.
// 190px puts it 18px past, matching about's 16px.
//
// Mobile keeps 150px: the heading drops to 32px there, so the word is about
// 109px and 150px already runs well past it.
//
// Also dropping the scrollbar gutter on phones. It reserves space at the right
// edge that page content respects but fixed elements do not, which shifts the
// content left relative to the nav and tab bar. It earns its keep on desktop,
// where it stops the layout jumping when a scrollbar appears; on a phone with
// overlay scrollbars it can only cost.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

swap('.contact-section .section-divider{margin-bottom:36px}',
     '.contact-section .section-divider{width:190px;margin-bottom:36px}',
     'contact divider runs past its word, like the others do');

swap('@media(max-width:768px){.contact-section{margin:0 24px;padding:60px 0 56px}}',
     '@media(max-width:768px){.contact-section{margin:0 24px;padding:60px 0 56px}\n' +
     '  .contact-section .section-divider{width:150px}\n' +
     '  html{scrollbar-gutter:auto}}',
     'mobile keeps the 150px divider, and drops the scrollbar gutter');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| gutter rules:', c('scrollbar-gutter'));
