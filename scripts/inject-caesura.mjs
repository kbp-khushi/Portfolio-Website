import { readFileSync, writeFileSync } from 'fs';

const B64 = 'base64/caesura';
let html = readFileSync('index.html', 'utf8');

function b64(name) {
  return readFileSync(`${B64}/${name}.txt`, 'utf8').trim();
}

function replaceImgByAlt(html, alt, newB64) {
  const altIdx = html.indexOf(`alt="${alt}"`);
  if (altIdx === -1) throw new Error('alt not found: ' + alt);
  const srcIdx = html.lastIndexOf('src="data:', altIdx);
  const start = html.indexOf(',', srcIdx) + 1;
  const end = html.indexOf('"', start);
  return html.slice(0, start) + newB64 + html.slice(end);
}

// --- 1. Image replacements by alt ---
const imageMap = [
  ['Approach through cypress forest', 'hero'],
  ['Massing Studies', 'massing-studies'],
  ['Pavilion', 'pavilion'],
  ['Regional Sourcing', 'regional-sourcing'],
  ['User Groups', 'user-groups'],
  ['Site Plan', 'site-plan'],
  ['Exterior Library', 'exterior-library'],
  ['Louver Study', 'louver-study'],
  ['Ecosystem Diagram', 'ecosystem-diagram'],
  ['Interior Library', 'interior-library'],
  ['Exploded Axonometric', 'exploded-axo'],
  ['Floor Plan', 'floor-plan'],
  ['Operable Partitions', 'operable-partitions'],
  ['Energy', 'energy'],
];
for (const [alt, name] of imageMap) {
  html = replaceImgByAlt(html, alt, b64(name));
  console.log(`swapped: ${alt} -> ${name}`);
}

// --- 2. Massing caption rewrite (Carve/Frame/Raise/Hold) ---
const oldMassingCaptions = `Initial Massing<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Establish the total program volume on the site.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Carving Out the River Bend<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Bend the mass to follow the river geometry.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Frame Views &amp; Circulation<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Create openings and framed views toward forest and water.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Solidify Moments<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Consolidate into distinct pavilions connected by boardwalk.</span>`;

const newMassingCaptions = `Carve<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Bend the massing to follow the river's edge.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Frame<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Open sightlines and circulation toward forest and water.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Raise<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Lift the structure clear of the floodplain.</span></div>
      <div style="flex:1;min-width:140px;text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light)">Hold<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">Consolidate into distinct pavilions connected by boardwalk.</span>`;

if (!html.includes(oldMassingCaptions)) throw new Error('massing captions anchor not found');
html = html.replace(oldMassingCaptions, newMassingCaptions);
console.log('massing captions updated: Carve / Frame / Raise / Hold');

// --- 3. COTE copy pass (10 categories, fuller board copy) ---
const copyPairs = [
  ['Elevated open structures provide shade, promote cross ventilation, and maintain visual connection to the surrounding forest.',
   `Every occupied space opens to the forest or the river. Movement through the pavilions provides a physical connection with the landscape, with moments of enclosure and exposure alternating along the path as the blend of indoor and outdoor space shapes the sense of comfort inside a public building.`],
  ['The elevated structure allows water and wildlife to move freely beneath the building, while the flowing water provides passive cooling through evaporation.',
   `The building lifts entirely off the ground, and helical piles replace excavation so that root systems, floodplain hydrology, and the wildlife corridors of white-tailed deer, river otters, and wading birds continue undisturbed beneath the structure. All plantings are native to the South Edisto watershed, and surplus rainwater from the roofs returns to on-site basins that recharge the cypress swamp the building sits within.`],
  ['Sloped roof surfaces collect rainwater and direct it to on-site basins, allowing water to be captured and reused within the building system. Raised structures allow natural flooding and site drainage beneath the building.',
   `The South Edisto floods seasonally, sustaining the cypress swamp and its ecosystems. The sloped metal roofs are the collection system: 13,450 SF of roof surface feeds two on-site cisterns, harvesting enough rainwater annually to exceed indoor demand. No potable water is used for irrigation, and the elevated structure lets natural flooding continue beneath the building undisturbed.`],
  ['Spaces are designed to be universally accessible and open to a wide range of users, supporting equitable access to the river, education, and recreation.',
   `Caesura provides free access to educational and cultural resources in a rural community with limited availability. Windsor, SC has a bachelor's attainment rate roughly half the national average and no full-service library, gallery, computer lab, or classroom within 25 miles. Every program space — the library, computer access, outdoor classrooms, gallery, and studio — is universally accessible, open year-round, and free.`],
  ['A repetitive mass timber structural grid simplifies construction, reduces material waste, and supports efficient long-term maintenance. The cantilevered structure minimizes ground disturbance and preserves the natural landscape beneath the building.',
   `The project explores material availability within 100 miles of the site, favoring wood for both human experience and carbon performance. Mass timber cantilever structures create minimal disturbance — no excavation, no dewatering, no disruption to root systems or the floodplain below. Bolted joints allow disassembly and reuse, and the structure sequesters carbon for the full duration of its 200-year lifespan.`],
  ['Operable partitions and adjustable windows allow spaces to adapt to different conditions. Panels slide or pivot to regulate airflow, daylight, and enclosure, allowing the building to respond to seasonal climate and changing program needs.',
   `The South Edisto floods seasonally, and climate projections anticipate increased precipitation and storm intensity through 2080. The finished floor sits 12' above the base flood elevation without altering the site. Operable partitions let spaces shift between classroom and exterior space as program needs evolve, and bolted glulam connections allow the mass timber structure to be disassembled and reused well beyond the program it currently serves.`],
  ['Deep roof overhangs, operable louvers, and cross ventilation reduce solar heat gain and limit reliance on mechanical cooling. These passive strategies improve indoor comfort, increase access to fresh air and daylight, and support occupant well-being.',
   `The project incorporates passive strategies toward light, air, and thermal comfort before any mechanical system. Deep roof overhangs and angled louvers reduce solar heat gain at 33 degrees latitude, while operable clerestories and cross ventilation move air through the section without conditioning it. What remains after passive strategies is a net EUI of -14 kBtu/sf/yr — roughly 4,200 SF of south-facing photovoltaics generate more energy than the building demands, returning the surplus to the Aiken State Park grid.`],
  ['Seamless relationship between movement, space, and landscape, where architecture recedes to support perception.',
   `A single structural decision generates the entire environmental and programmatic strategy. Lifting the building above the floodplain kept the site intact, opened the section to cross ventilation, tilted the roof toward rainwater collection, and placed a free library, studio, and outdoor classrooms inside a state park that doesn't have them anywhere else. Water, wildlife, and air move beneath the structure — no part of the building works alone.`],
  ['Nature-forward design allows for various points of discovery and moments to develop connections with the environment.',
   `The elevated boardwalk moves visitors through the cypress canopy at eye level with branches, birds, and filtered light. Pavilions frame the river, then the forest, then the sky through sightlines, positioning people inside the landscape rather than simply looking at it. The library, studio, and outdoor classrooms give structure to that attention, turning a visit into sustained contact with the site.`],
  ['All materials, including the structural timber system, are sourced from regional suppliers in Macon, GA and Columbia, SC, within 150 miles.',
   `All primary materials are sourced within a hundred-mile radius of the site, reducing transportation cost and lead time. A repetitive 20' structural bay reduces fabrication complexity and accelerates construction, and bolted connections allow prefabrication off-site and assembly with minimal heavy equipment. Spaces serve multiple programs — studio becomes gallery, classroom becomes event space — so the building earns more from every square foot.`],
];

let copyReplacedCount = 0;
for (const [oldText, newText] of copyPairs) {
  if (!html.includes(oldText)) {
    console.warn('COPY ANCHOR NOT FOUND, skipped:', oldText.slice(0, 60));
    continue;
  }
  html = html.replace(oldText, newText);
  copyReplacedCount++;
}
console.log(`COTE copy pass: ${copyReplacedCount}/10 paragraphs replaced`);

writeFileSync('index.html', html);
console.log('Caesura injection complete. File size:', (html.length/1024/1024).toFixed(1), 'MB');
