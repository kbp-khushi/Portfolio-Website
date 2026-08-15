import { readFileSync, writeFileSync } from 'fs';

const B64 = 'base64/woven-edge';
let html = readFileSync('index.html', 'utf8');

function b64(name) {
  return readFileSync(`${B64}/${name}.txt`, 'utf8').trim();
}

function replaceImgByAlt(html, alt, newB64) {
  const altIdx = html.indexOf(`alt="${alt}"`);
  if (altIdx === -1) throw new Error('alt not found: ' + alt);
  const srcIdx = html.lastIndexOf('src="', altIdx);
  const start = srcIdx + 5;
  const end = html.indexOf('"', start);
  return html.slice(0, start) + newB64 + html.slice(end);
}

// find the <img ...> tag that immediately precedes a given following text (used when alt="" and images are disambiguated by a caption after them)
function replaceImgBeforeText(html, followingText, newB64) {
  const textIdx = html.indexOf(followingText);
  if (textIdx === -1) throw new Error('following text not found: ' + followingText);
  const srcIdx = html.lastIndexOf('src="', textIdx);
  const start = srcIdx + 5;
  const end = html.indexOf('"', start);
  return html.slice(0, start) + newB64 + html.slice(end);
}

// --- 1. Simple alt-based swaps ---
const altMap = [
  ['Georgia', 'georgia'],
  ['Demographics', 'demographics'],
  ['Proposed Site Plan', 'proposed-site-plan'],
  ['Program Icons', 'program-icons'],
  ['Weaving', 'weaving'],
  ['City Square Axonometric', 'city-square-axon'],
  ['Equitable Communities', 'equitable-communities'],
  ['User Groups', 'user-groups'],
  ['Stepping Render', 'stepping-render'],
  ['Bioswale', 'bioswale'],
  ['Ecosystems and Integration', 'ecosystems'],
  ['Bathroom Charette', 'bathroom-charette-hero'],
];
for (const [alt, name] of altMap) {
  html = replaceImgByAlt(html, alt, b64(name));
  console.log(`swapped by alt: ${alt} -> ${name}`);
}

// --- 2. Caption-based swaps (6 analysis maps, alt="") ---
const captionMap = [
  ['Circulation Diagram', 'circulation-diagram'],
  ['Civic Spaces', 'civic-spaces'],
  ['Entry Nodes', 'entry-nodes'],
  ['Sun and Wind Analysis', 'sun-wind'],
  ['Existing Vegetation', 'vegetation'],
  ['Viewpoints', 'viewpoints'],
];
for (const [caption, name] of captionMap) {
  html = replaceImgBeforeText(html, caption, b64(name));
  console.log(`swapped by caption: ${caption} -> ${name}`);
}

// --- 3. Positional swap: 5 site photos ---
const gridMarker = 'display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:20px 60px';
const gridStart = html.indexOf(gridMarker);
if (gridStart === -1) throw new Error('site photo grid not found');
const gridDivEnd = html.indexOf('</div>', gridStart);
let gridBlock = html.slice(gridStart, gridDivEnd);
const photoNames = ['site-photo-1', 'site-photo-2', 'site-photo-3', 'site-photo-4', 'site-photo-5'];
let photoIdx = 0;
gridBlock = gridBlock.replace(/src="data:[^"]*"/g, () => {
  const replacement = `src="${b64(photoNames[photoIdx])}"`;
  photoIdx++;
  return replacement;
});
html = html.slice(0, gridStart) + gridBlock + html.slice(gridDivEnd);
console.log(`site photos replaced: ${photoIdx}/5`);

// --- 4. Street Sections: single image -> existing/proposed pair ---
const streetOld = html.slice(
  html.lastIndexOf('<div class="edit-full">', html.indexOf('alt="Street Sections"')),
  html.indexOf('</div>', html.indexOf('alt="Street Sections"')) + 6
);
const streetNew = `<div class="edit-full" style="padding:0 60px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;text-align:center">
      <div><img loading="lazy" src="${b64('street-sections-1')}" alt="Street section, existing condition" style="width:100%"><div style="font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">Existing</div></div>
      <div><img loading="lazy" src="${b64('street-sections-2')}" alt="Street section, proposed condition" style="width:100%"><div style="font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">Proposed</div></div>
    </div>
  </div>`;
if (!html.includes(streetOld)) throw new Error('street sections anchor mismatch');
html = html.replace(streetOld, streetNew);
console.log('Street Sections expanded to existing/proposed pair');

// --- 5. Water Sections: single image -> existing/proposed pair ---
const waterOld = html.slice(
  html.lastIndexOf('<div class="edit-full">', html.indexOf('alt="Water Sections"')),
  html.indexOf('</div>', html.indexOf('alt="Water Sections"')) + 6
);
const waterNew = `<div class="edit-full" style="padding:0 60px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;text-align:center">
      <div><img loading="lazy" src="${b64('water-sections-1')}" alt="Waterfront section, existing condition" style="width:100%"><div style="font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">Existing</div></div>
      <div><img loading="lazy" src="${b64('water-sections-2')}" alt="Waterfront section, proposed condition" style="width:100%"><div style="font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">Proposed</div></div>
    </div>
  </div>`;
if (!html.includes(waterOld)) throw new Error('water sections anchor mismatch');
html = html.replace(waterOld, waterNew);
console.log('Water Sections expanded to existing/proposed pair');

// --- 6. Bathroom detail strip (4 supporting drawings under the hero render) ---
const bathAnchor = `alt="Bathroom Charette"></div>`;
const bathStrip = `

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:16px 60px 0">
    <div><img loading="lazy" src="${b64('bathroom-detail-1')}" alt="Bathroom cluster floor plan" style="width:100%"></div>
    <div><img loading="lazy" src="${b64('bathroom-detail-2')}" alt="Bathroom section with rainwater collection" style="width:100%"></div>
    <div><img loading="lazy" src="${b64('bathroom-detail-3')}" alt="Bathroom stall structure detail" style="width:100%"></div>
    <div><img loading="lazy" src="${b64('bathroom-detail-4')}" alt="Bathroom roof-to-cistern water diagram" style="width:100%"></div>
  </div>`;
if (!html.includes(bathAnchor)) throw new Error('bathroom anchor not found');
html = html.replace(bathAnchor, bathAnchor + bathStrip);
console.log('Bathroom detail strip added');

writeFileSync('index.html', html);
console.log('Woven Edge injection complete. File size:', (html.length/1024/1024).toFixed(1), 'MB');
