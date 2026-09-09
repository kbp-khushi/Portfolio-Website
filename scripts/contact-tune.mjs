import { readFileSync, writeFileSync } from 'fs';

// Three notes from her, all correct:
//
//  1. the divider did not match about and work. Every divider on the site is
//     150px, so it was not length: I had put the heading and divider inside
//     the centred 1120 wrapper, so they started at x=73 while every other
//     section heading starts at the 60px padding edge. Begins late, ends
//     short. They come out of the wrapper, exactly like #about does it.
//  2. the full bleed 2px rule was too much. It now spans the content box
//     rather than the whole page, at 1px.
//  3. the email did not need to rival the heading. Back to its original
//     clamp, which lands at 36px against the heading's 50.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// heading and divider move out of the centred column, mirroring #about
swap('  <div class="contact-inner">\n' +
     '    <h2 class="section-title">contact</h2>\n' +
     '    <div class="section-divider"></div>\n',
     '  <h2 class="section-title">contact</h2>\n' +
     '  <div class="section-divider"></div>\n' +
     '  <div class="contact-inner">\n',
     'heading and divider align with every other section');

swap('.contact-section{padding:100px 60px;border-top:2px solid var(--text);scroll-margin-top:0}\n' +
     '.contact-inner{max-width:1120px;margin:0 auto}\n' +
     '.contact-section .section-divider{margin-bottom:40px}\n' +
     '.contact-section .contact-email{margin-top:0;font-size:clamp(28px,4.4vw,48px)}\n' +
     '.contact-section .contact-row{margin-top:40px;padding-top:24px;border-top:1px solid var(--line)}\n' +
     '@media(max-width:768px){.contact-section{padding:60px 24px}}',

     // the rule sits on the section box, which is inset by margin rather than\n' +
     // padding, so it stops at the same gutter the content does
     '.contact-section{margin:0 60px;padding:104px 0 100px;border-top:1px solid var(--text);scroll-margin-top:0}\n' +
     '.contact-inner{max-width:1120px;margin:0 auto}\n' +
     '.contact-section .section-divider{margin-bottom:36px}\n' +
     '.contact-section .contact-email{margin-top:0}\n' +
     '.contact-section .contact-row{margin-top:36px;padding-top:24px;border-top:1px solid var(--line)}\n' +
     '@media(max-width:768px){.contact-section{margin:0 24px;padding:60px 0 56px}}',
     'rule shortened to the content box at 1px, email back to its own size');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| contact sections:', c('class="contact-section"'),
  '| inner:', c('class="contact-inner"'));
