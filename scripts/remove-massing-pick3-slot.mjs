import { readFileSync, writeFileSync } from 'fs';

const HTML = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const html = readFileSync(HTML, 'utf8');

const gridMarker = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1200px;margin:0 auto">';
const gridStart = html.indexOf(gridMarker);
if (gridStart === -1) throw new Error('grid marker not found');

// The grid div's matching close is the very next "</div>\n    </div>" after
// the second image — find it by locating the "Massing model front view"
// hero block that follows, and taking everything up to its opening <div.
const afterMarker = gridStart + gridMarker.length;
const nextHeroMarker = '<div class="pp-reveal" style="margin-top:32px">';
const gridEnd = html.indexOf(nextHeroMarker, afterMarker);
if (gridEnd === -1) throw new Error('next hero marker not found');

const gridBlock = html.slice(afterMarker, gridEnd);

// Extract the front-elevation <img> tag (including its base64 src) intact
const feAltMarker = 'alt="Massing model front elevation"';
const feAltIdx = gridBlock.indexOf(feAltMarker);
if (feAltIdx === -1) throw new Error('front elevation alt not found');
const imgTagStart = gridBlock.lastIndexOf('<img', feAltIdx);
const imgTagEnd = gridBlock.indexOf('>', feAltIdx) + 1;
const frontElevationImgTag = gridBlock.slice(imgTagStart, imgTagEnd);

// Rebuild that <img> tag's style to match the full-width hero pattern used
// by images 1 and 4, instead of the 2-up grid's object-fit:cover style
const rebuiltImgTag = frontElevationImgTag.replace(
  'style="width:100%;object-fit:cover;background:none !important"',
  'style="width:100%;max-width:900px;display:block;margin:0 auto;background:none !important"'
);

const replacement =
  `<div class="pp-reveal" style="margin-bottom:32px">\n      ${rebuiltImgTag}\n    </div>\n    `;

const newHtml = html.slice(0, gridStart) + replacement + html.slice(gridEnd);
writeFileSync(HTML, newHtml);

console.log('Grid block length removed:', gridEnd - gridStart);
console.log('Replacement length:', replacement.length);
console.log('Done — pick-3 slot removed, front elevation now full-width');
