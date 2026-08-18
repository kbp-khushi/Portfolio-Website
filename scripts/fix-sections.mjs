import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
function b64(name) {
  return readFileSync(`base64/woven-edge/${name}.txt`, 'utf8').trim();
}

function replaceExistingProposedBlock(html, existingAlt, label) {
  const idx = html.indexOf(existingAlt);
  const start = html.lastIndexOf('<div class="edit-full"', idx);
  const proposedIdx = html.indexOf('Proposed</div></div>', idx);
  const end = html.indexOf('</div>', proposedIdx + 20) + 6; // close outer grid div
  const trueEnd = html.indexOf('</div>', end) + 6; // close edit-full div
  return { start, end: trueEnd, block: html.slice(start, trueEnd) };
}

// --- Street Sections: replace with Sections-01 and Sections-02 as separate complete images ---
const streetInfo = replaceExistingProposedBlock(html, 'Street section, existing condition');
const streetNew = `<div class="edit-full" style="padding:0 60px">
    <div class="pp-reveal" style="margin-bottom:32px"><img loading="lazy" src="${b64('street-sections-1')}" alt="Street section — rail corridor, existing and proposed" style="max-width:900px;width:100%;display:block;margin:0 auto"></div>
    <div class="pp-reveal"><img loading="lazy" src="${b64('street-sections-2')}" alt="Street section — marketplace corridor, existing and proposed" style="max-width:900px;width:100%;display:block;margin:0 auto"></div>
  </div>`;
html = html.slice(0, streetInfo.start) + streetNew + html.slice(streetInfo.end);
console.log('Street Sections fixed');

// --- Water Sections: replace with Sections-03 and Sections-04 as separate complete images ---
const waterInfo = replaceExistingProposedBlock(html, 'Waterfront section, existing condition');
const waterNew = `<div class="edit-full" style="padding:0 60px">
    <div class="pp-reveal" style="margin-bottom:32px"><img loading="lazy" src="${b64('water-sections-1')}" alt="Waterfront section — marina to boardwalk, existing and proposed" style="max-width:900px;width:100%;display:block;margin:0 auto"></div>
    <div class="pp-reveal"><img loading="lazy" src="${b64('water-sections-2')}" alt="Waterfront section — marina to park, existing and proposed" style="max-width:900px;width:100%;display:block;margin:0 auto"></div>
  </div>`;
html = html.slice(0, waterInfo.start) + waterNew + html.slice(waterInfo.end);
console.log('Water Sections fixed');

writeFileSync('index.html', html);
console.log('done. size:', (html.length / 1024 / 1024).toFixed(1), 'MB');
