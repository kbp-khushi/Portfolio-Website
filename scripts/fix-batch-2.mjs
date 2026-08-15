import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

function b64(dir, name) {
  return readFileSync(`base64/${dir}/${name}.txt`, 'utf8').trim();
}

function replaceImgByAlt(html, alt, newB64) {
  const altIdx = html.indexOf(`alt="${alt}"`);
  if (altIdx === -1) throw new Error('alt not found: ' + alt);
  const srcIdx = html.lastIndexOf('src="', altIdx);
  const start = srcIdx + 5;
  const end = html.indexOf('"', start);
  return html.slice(0, start) + newB64 + html.slice(end);
}

// --- 1. Fix Section Perspective (was omitted from the original injection) ---
html = replaceImgByAlt(html, 'Section Perspective', b64('caesura', 'section-perspective'));
console.log('fixed: Section Perspective');

// --- 2. Sun and Wind ---
html = replaceImgByAlt(html, 'Sun and Wind', b64('caesura', 'sun-and-wind'));
console.log('fixed: Sun and Wind');

// --- 3. Site Section ---
html = replaceImgByAlt(html, 'Site Section', b64('caesura', 'site-section'));
console.log('fixed: Site Section');

// --- 4. Site Plan legend ---
const sitePlanAnchor = `alt="Site Plan"></div>`;
const sitePlanLegend = `

  <div style="padding:24px 60px 0;max-width:520px;margin:0 auto">
    <div style="font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:10px">Site Plan Key</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;line-height:1.7;color:var(--text-light)">
      <div>00&nbsp; Parking</div>
      <div>05&nbsp; Studio Pavilion</div>
      <div>01&nbsp; Emergency Lane</div>
      <div>06&nbsp; Library Pavilion</div>
      <div>02&nbsp; Open-Air Pavilion</div>
      <div>07&nbsp; Open-Air Pavilion</div>
      <div>03&nbsp; Outdoor Classroom Pavilion</div>
      <div>08&nbsp; Welcome Pavilion</div>
      <div>04&nbsp; Open-Air Pavilion</div>
      <div>09&nbsp; Historic Fishing Cabin</div>
    </div>
  </div>`;
if (!html.includes(sitePlanAnchor)) throw new Error('site plan anchor not found');
html = html.replace(sitePlanAnchor, sitePlanAnchor + sitePlanLegend);
console.log('added: Site Plan legend');

// --- 5. Exploded Axonometric legend ---
const axoAnchor = `alt="Exploded Axonometric" style="width:100%"></div>`;
const axoLegend = `
    <div style="width:100%;margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px 32px">
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">01&nbsp; Corrugated Metal Roof Deck</b><br>Lightweight, high-reflectivity surface that reduces structural demand and solar heat gain, directing rainwater to on-site collection basins. Fully recyclable at end of life.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">02&nbsp; Primary Glulam Roof Beams</b><br>Sloped profile supports rainwater collection and a deep overhang for solar control. Bolted connections allow disassembly and reuse.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">03&nbsp; Site-Charred Cypress Siding</b><br>Shou sugi ban finish eliminates the need for chemical treatment, hardening the surface against moisture, decay, and fire without maintenance.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">04&nbsp; Curtain Wall System</b><br>Glazing and timber frame provide daylight and a direct visual connection to the forest, with operable clerestories above for cross ventilation.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">05&nbsp; Angled Louver</b><br>Filters indirect daylight into occupied spaces while blocking direct sun at a peak solar altitude of 78&deg; during summer solstice.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">07&nbsp; Primary Glulam Floor Beams</b><br>Cantilever beyond the column line, extending occupied space over the floodplain without additional foundations.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">08&nbsp; Tapered Glulam Column</b><br>Narrows from 48&Prime; at the base to 24&Prime; at the top on a repetitive 20&rsquo; grid, elevating the structure above the 100-year base flood elevation.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">09&nbsp; Pre-Cast Concrete Column + Pile Cap</b><br>Elevates the structure above the 100-year flood elevation, allowing floodwater and wildlife to pass freely beneath.</div>
      <div style="font-size:12px;line-height:1.6;color:var(--text-light)"><b style="color:var(--text)">10&nbsp; Helical Piles</b><br>Driven into marshy site conditions with no excavation, no dewatering, and no disruption to floodplain root systems.</div>
    </div>`;
if (!html.includes(axoAnchor)) throw new Error('axo anchor not found');
html = html.replace(axoAnchor, axoAnchor + axoLegend);
console.log('added: Exploded Axonometric legend');

// --- 6. Boards popup: replace 2 old images with 4 fresh boards, fix title ---
const popupOldTitle = `The Pause &mdash; Full Boards`;
html = html.replace(popupOldTitle, `Caesura &mdash; Full Boards`);

const popupImgsOld = `<img loading="lazy" src="${(() => {
  // capture nothing here; we'll do a direct block replace below instead
  return '';
})()}"`;
// Simpler: locate the two sequential Board 1/Board 2 <img> tags and replace the whole pair
const b1Idx = html.indexOf('alt="Board 1"');
const b2EndIdx = html.indexOf('alt="Board 2"');
const b2TagEnd = html.indexOf('>', b2EndIdx) + 1;
const b1TagStart = html.lastIndexOf('<img', b1Idx);
const oldBoardsBlock = html.slice(b1TagStart, b2TagEnd);
const newBoardsBlock = `<img loading="lazy" src="${b64('caesura', 'board-1')}" alt="Caesura board 1 of 4" style="width:100%">
    <img loading="lazy" src="${b64('caesura', 'board-2')}" alt="Caesura board 2 of 4" style="width:100%">
    <img loading="lazy" src="${b64('caesura', 'board-3')}" alt="Caesura board 3 of 4" style="width:100%">
    <img loading="lazy" src="${b64('caesura', 'board-4')}" alt="Caesura board 4 of 4" style="width:100%">`;
html = html.slice(0, b1TagStart) + newBoardsBlock + html.slice(b2TagEnd);
console.log('replaced: boards-popup now shows 4 fresh boards');

// --- 7. Woven Edge site plan: constrain size (was rendering huge/tall) ---
const wePlanOld = `<div class="edit-full"><img loading="lazy" src="${b64('woven-edge', 'proposed-site-plan')}" alt="Proposed Site Plan"></div>`;
if (!html.includes(wePlanOld)) throw new Error('woven edge site plan anchor mismatch (may need current src)');
const wePlanNew = `<div class="edit-full" style="padding:0 60px;text-align:center"><img loading="lazy" src="${b64('woven-edge', 'proposed-site-plan')}" alt="Proposed Site Plan" style="max-width:520px;width:100%;display:inline-block"></div>`;
html = html.replace(wePlanOld, wePlanNew);
console.log('fixed: Woven Edge Proposed Site Plan sizing');

// --- 8. Re-inject the 12 PNG-sourced Woven Edge images with correct white backgrounds ---
const whiteFixAlts = [
  ['Georgia', 'georgia'],
  ['City Square Axonometric', 'city-square-axon'],
  ['Demographics', 'demographics'],
  ['Equitable Communities', 'equitable-communities'],
  ['User Groups', 'user-groups'],
  ['Bathroom Charette', 'bathroom-charette-hero'],
  ['Ecosystems and Integration', 'ecosystems'],
  ['Weaving', 'weaving'],
  ['Bathroom cluster floor plan', 'bathroom-detail-1'],
  ['Bathroom section with rainwater collection', 'bathroom-detail-2'],
  ['Bathroom stall structure detail', 'bathroom-detail-3'],
  ['Bathroom roof-to-cistern water diagram', 'bathroom-detail-4'],
];
for (const [alt, name] of whiteFixAlts) {
  html = replaceImgByAlt(html, alt, b64('woven-edge', name));
  console.log(`white-bg fixed: ${alt} -> ${name}`);
}

writeFileSync('index.html', html);
console.log('Batch 2 fixes complete. File size:', (html.length/1024/1024).toFixed(1), 'MB');
