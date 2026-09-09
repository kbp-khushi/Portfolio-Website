import { readFileSync, writeFileSync } from 'fs';

// Two asks:
//   1. View Resume moves up into the bio column, directly under the writing,
//      left aligned, instead of sitting alone above the resume grid.
//   2. The SCAD Alumni Fellowship comes out of the honors line. With the only
//      fellowship gone, the label becomes "SCAD scholarships".
//
// The Monet note stays last, under a hairline, so it reads as an aside to the
// whole block rather than as a caption on the button.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

const BTN = '<a class="we-boards-btn" style="position:static" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>View Resume</a>';

// lift it out of its own row above the grid
swap('  <div style="padding-bottom:56px">' + BTN + '</div>\n\n', '', 'old resume button row removed');

// and drop it in under the writing, ahead of the Monet note
swap('deeper into this beautiful profession.</p>\n',
     'deeper into this beautiful profession.</p>\n' +
     '      <div class="about-resume-btn">' + BTN + '</div>\n',
     'View Resume now sits under the bio');

swap('.about-note{font-family:var(--body);',
     '.about-resume-btn{margin-top:22px}\n' +
     '.about-note{font-family:var(--body);',
     'button spacing');

// honors
swap('<li>SCAD scholarships and fellowships &mdash; Academic Honors, Achievement Honor, Student Recognition, the Dr. Victor Andrews Endowed Scholarship, and the SCAD Alumni Fellowship</li>',
     '<li>SCAD scholarships &mdash; Academic Honors, Achievement Honor, Student Recognition, and the Dr. Victor Andrews Endowed Scholarship</li>',
     'SCAD Alumni Fellowship removed');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| resume btns:', c('Khushi_Patel_Resume.pdf'),
  '| alumni fellowship:', c('Alumni Fellowship'));
