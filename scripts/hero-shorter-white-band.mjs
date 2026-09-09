import { readFileSync, writeFileSync } from 'fs';

// The painting stops 144px (an inch and a half) short of the bottom of the
// screen, so the first view ends on a band of white instead of running edge to
// edge. Selected Work is pushed below that band, which also gives it the room
// above it that it was missing.
//
// On mobile this also frees the hero text: the canvas no longer reaches the
// fixed tab bar, so the 88px of bottom padding that was clearing it can go
// back to a normal 34px.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// 144px = 1.5in at 96dpi
swap('.hero-canvas{position:relative;width:100%;height:100vh;height:100svh;overflow:hidden}',
     '.hero-canvas{position:relative;width:100%;height:calc(100vh - 144px);height:calc(100svh - 144px);overflow:hidden}',
     'desktop painting stops 144px short of the bottom');

swap('.hero-canvas{height:100vh;height:100svh}',
     '.hero-canvas{height:calc(100vh - 144px);height:calc(100svh - 144px)}',
     'mobile painting stops 144px short of the bottom');

// the canvas no longer reaches the tab bar, so the text can sit normally again
swap('.hero-inner{padding:0 24px 88px}',
     '.hero-inner{padding:0 24px 34px}',
     'mobile hero text back to normal bottom padding');

// Selected Work sits below the white band rather than peeking into it
swap('.work-teaser{padding:40px 60px 100px;scroll-margin-top:100px}',
     '.work-teaser{padding:150px 60px 100px;scroll-margin-top:100px}',
     'desktop Selected Work pushed below the band');

swap('.work-teaser{padding:60px 24px}',
     '.work-teaser{padding:130px 24px 60px}',
     'mobile Selected Work pushed below the band');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
