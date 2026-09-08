import { readFileSync, writeFileSync } from 'fs';

// One button style for "go see this thing": the bordered box with a leading
// icon. It was already 14 of the 19 such controls; this converts the
// remaining five, which were split across two weaker treatments:
//
//   .dl-link        View Resume, View Full Boards (Caesura), View Full Boards (Woven)
//   .model-links a  View the massing model, View the site analysis
//
// The hero buttons, the COTE chips and the utility links (view all work,
// back to top) stay as they are on purpose.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${inner}</svg>`;
const GRID  = svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>');
const SHEET = svg('<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8"/><path d="M8 17h5"/>');
const HOUSE = svg('<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>');
const MAP   = svg('<path d="M1 6l7-3 8 3 7-3v15l-7 3-8-3-7 3z"/><path d="M8 3v15"/><path d="M16 6v15"/>');

const BTN = 'class="we-boards-btn" style="position:static"';

// ---------------------------------------------------------------------------
// a shared wrapper for a button that sits inline under a drawing
// ---------------------------------------------------------------------------
swap('.pp-cta{padding:8px 60px 60px;text-align:center}',
  '.pp-cta{padding:8px 60px 60px;text-align:center}\r\n' +
  '.pp-cta-inline{text-align:center;padding:18px 60px 0}\r\n' +
  '.pp-cta-inline.has-gap{padding-bottom:60px}\r\n' +
  '@media(max-width:768px){.pp-cta-inline{padding:16px 24px 0}.pp-cta-inline.has-gap{padding-bottom:48px}}',
  'inline button wrapper styles');

// ---------------------------------------------------------------------------
// 1) About: View Resume
// ---------------------------------------------------------------------------
swap('<a class="dl-link" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener" style="text-transform:none">view resume</a>',
     `<a ${BTN} href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">${SHEET}View Resume</a>`,
     'About: View Resume -> bordered button with sheet icon');

// ---------------------------------------------------------------------------
// 2) View Full Boards, both pages
// ---------------------------------------------------------------------------
swap(`<a class="dl-link" onclick="document.getElementById('boards-popup').style.display='flex'" style="cursor:pointer">View Full Boards</a>`,
     `<a ${BTN} onclick="document.getElementById('boards-popup').style.display='flex'">${GRID}View Full Boards</a>`,
     'Caesura: View Full Boards -> button');
swap(`<a class="dl-link" onclick="document.getElementById('we-boards-popup').style.display='flex'" style="cursor:pointer">View Full Boards</a>`,
     `<a ${BTN} onclick="document.getElementById('we-boards-popup').style.display='flex'">${GRID}View Full Boards</a>`,
     'Woven Edge: View Full Boards -> button');

// ---------------------------------------------------------------------------
// 3) the two underlined cross links
// ---------------------------------------------------------------------------
swap(`<div class="model-links"><a onclick="closeProject();setTimeout(function(){openProject('massing-model');},80)">View the massing model</a></div>`,
     `<div class="pp-cta-inline"><a ${BTN} onclick="closeProject();setTimeout(function(){openProject('massing-model');},80)">${HOUSE}View the Massing Model</a></div>`,
     'Caesura: massing model link -> button with house icon');
swap(`<div class="model-links pp-cta-sub"><a onclick="closeProject();setTimeout(function(){openProject('site-analysis');},80)">View the site analysis that chose this program</a></div>`,
     `<div class="pp-cta-inline has-gap"><a ${BTN} onclick="closeProject();setTimeout(function(){openProject('site-analysis');},80)">${MAP}View the Site Analysis</a></div>`,
     'Beacon: site analysis link -> button with map icon');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'));
console.log('we-boards-btn:', c('class="we-boards-btn"'),
  '| dl-link left:', c('class="dl-link"'),
  '| model-links left:', c('class="model-links'));
