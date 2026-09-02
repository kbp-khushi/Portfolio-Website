import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const B64 = join(BASE, 'base64/caesura');
let html = readFileSync(join(BASE, 'index.html'), 'utf8');

function b64(name) { return readFileSync(join(B64, `${name}.txt`), 'utf8').trim(); }
function must(str, label) { if (html.indexOf(str) === -1) throw new Error(`MISSING: ${label}`); return str; }
function replaceOnce(oldStr, newStr, label) {
  must(oldStr, label);
  html = html.replace(oldStr, () => newStr);
  console.log(`[ok] ${label}`);
}
function labelDiv(title, desc) {
  return `<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">${title}<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">${desc}</span></div>`;
}
function imgCol(src, alt, height, title, desc) {
  return `<div style="display:flex;flex-direction:column;align-items:center"><img loading="lazy" src="${src}" alt="${alt}" style="height:${height}px;width:auto;max-width:100%">${labelDiv(title, desc)}</div>`;
}

// 1) Economy — enlarge diagram, add sourcing-distance metrics
replaceOnce(
  'alt="Regional Sourcing" style="width:100%;max-width:360px;display:block;margin:0 auto">',
  'alt="Regional Sourcing" style="width:100%;max-width:640px;display:block;margin:0 auto">',
  'economy image enlarge'
);
replaceOnce(
  'so the building earns more from every square foot.</div>',
  'so the building earns more from every square foot. Sourcing spans 30 miles (ready-mix concrete) to 100 miles (steel rebar), keeping the full material palette within a two-hour drive of the site.</div>',
  'economy text metrics'
);

// 2) Equitable — enlarge diagram, add user-group metric
replaceOnce(
  'alt="User Groups" style="width:100%;max-width:400px;display:block;margin:0 auto">',
  'alt="User Groups" style="width:100%;max-width:640px;display:block;margin:0 auto">',
  'equitable image enlarge'
);
replaceOnce(
  'is universally accessible, open year-round, and free.</div>',
  'is universally accessible, open year-round, and free. Five distinct user groups — residents, retirees, families, seasonal visitors, and outdoor recreation users — return throughout the day, from morning to evening.</div>',
  'equitable text metrics'
);

// 3) Well-Being — split Louver Study into 3, move Floor Plan in below
{
  const oldStart = must(
    '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%">\n        <img loading="lazy" src="',
    'wellbeing images start'
  );
  const oldEndMarker = '\n      </div>\n    </div>\n  </div>\n\n  <!-- ECOSYSTEMS + WATER -->';
  const startIdx = html.indexOf(oldStart);
  const endIdx = html.indexOf(oldEndMarker, startIdx) + oldEndMarker.length;
  if (endIdx <= startIdx) throw new Error('wellbeing images end not found');

  const newBlock = `<div class="edit-images" style="align-items:stretch">
      <div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap">
        ${imgCol(b64('louver-solid'), 'Solid Panel', 320, 'Solid Panel', 'Blocks light completely, creating excessive shade and dark spaces.')}
        ${imgCol(b64('louver-straight'), 'Straight Louvers', 320, 'Straight Louvers', 'Allow permeability and airflow but admit too much direct sunlight.')}
        ${imgCol(b64('louver-angled'), 'Angled Louvers', 320, 'Angled Louvers', 'Filter daylight, allowing indirect light while blocking direct sun rays.')}
      </div>
      <div style="width:100%;margin-top:32px"><img loading="lazy" src="${b64('floorplan-existing')}" alt="Floor Plan" style="width:100%;max-width:640px;display:block;margin:0 auto"></div>
    </div>
  </div>

  <!-- ECOSYSTEMS + WATER -->`;

  html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);
  console.log('[ok] wellbeing louver split + floor plan moved in');
}

// 4) Remove the old standalone Floor Plan block (between Resources and Change)
{
  const startMarker = '<!-- FLOOR PLAN -->\n  <div class="edit-full" style="padding:0 60px;text-align:center"><img loading="lazy" src="';
  must(startMarker, 'old floor plan block');
  const startIdx = html.indexOf(startMarker);
  const changeMarker = '<!-- CHANGE -->';
  const changeIdx = html.indexOf(changeMarker, startIdx);
  if (changeIdx === -1) throw new Error('CHANGE comment not found after floor plan');
  html = html.slice(0, startIdx) + html.slice(changeIdx);
  console.log('[ok] old floor plan block removed');
}

// 5) Design for Water — remove from Ecosystems row, insert as its own
//    row right before Design for Energy, with the water metric graphic
//    and enriched real numbers
{
  const waterOld = must(
    '\n      <div class="ds-title" id="pause-water" style="margin-top:28px">Design for Water</div>\n      <div class="ds-text">The South Edisto floods seasonally, sustaining the cypress swamp and its ecosystems. The sloped metal roofs are the collection system: 13,450 SF of roof surface feeds two on-site cisterns, harvesting enough rainwater annually to exceed indoor demand. No potable water is used for irrigation, and the elevated structure lets natural flooding continue beneath the building undisturbed.</div>',
    'water block in ecosystems'
  );
  html = html.replace(waterOld, () => '');
  console.log('[ok] water removed from ecosystems row');

  const waterRow = `<!-- WATER -->
  <div class="edit-row" id="pause-water">
    <div class="edit-text">
      <div class="ds-title">Design for Water</div>
      <div class="ds-text">The South Edisto floods seasonally, sustaining the cypress swamp and its ecosystems. The sloped metal roofs are the collection system: 13,450 SF of roof surface feeds two on-site cisterns, with a theoretical capacity of 354,376 gal/yr against an actual harvest of 192,000 gal/yr — well above the 155,183 gal/yr of indoor demand. The surplus of 162,376 gal/yr returns to the site basin, recharging the cypress swamp. No potable water is used for irrigation, and the elevated structure lets natural flooding continue beneath the building undisturbed.</div>
    </div>
    <div class="edit-images">
      <div style="width:100%"><img loading="lazy" src="${b64('water-metric')}" alt="Water Metric" style="width:100%;max-width:560px;display:block;margin:0 auto"></div>
    </div>
  </div>

  <!-- ENERGY -->`;
  replaceOnce('\n\n  <!-- ENERGY -->', '\n\n  ' + waterRow, 'water row inserted before energy');
}

// 6) Energy — add the EUI benchmark chart + enrich text
replaceOnce(
  'returning the surplus to the Aiken State Park grid.</div>',
  'returning the surplus to the Aiken State Park grid. Against a CBECS 2003 public-assembly benchmark of 70 kBtu/sf/yr, passive strategies (shading, daylighting, ventilation, envelope) bring gross EUI to 42 before PV pushes it net negative.</div>',
  'energy text metrics'
);
replaceOnce(
  '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="',
  '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="',
  'energy images anchor (noop, verifying marker exists)'
);
{
  const marker = 'alt="Energy" style="width:100%"></div>\n    </div>\n  </div>\n\n  <!-- SECTION PERSPECTIVE -->';
  must(marker, 'energy image container');
  const replacement = `alt="Energy" style="width:100%"></div>
      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('energy-eui')}" alt="Energy Use Intensity chart" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>
    </div>
  </div>

  <!-- SECTION PERSPECTIVE -->`;
  replaceOnce(marker, replacement, 'energy EUI chart added');
}

// 7) Nav order: Integration, Site, Discovery, Economy, Equitable,
//    Well-Being, Ecosystems, Resources, Change, Water, Energy
replaceOnce(
  `<a class="cote-link" onclick="weNav('pause-integration')">Design for Integration</a>
      <a class="cote-link" onclick="weNav('pause-discovery')">Design for Discovery</a>
      <a class="cote-link" onclick="weNav('pause-economy')">Design for Economy</a>
      <a class="cote-link" onclick="weNav('pause-equitable')">Design for Equitable Communities</a>
      <a class="cote-link" onclick="weNav('pause-wellbeing')">Design for Well-Being</a>
      <a class="cote-link" onclick="weNav('pause-ecosystems')">Design for Ecosystems</a>
      <a class="cote-link" onclick="weNav('pause-site')">Site</a>
      <a class="cote-link" onclick="weNav('pause-resources')">Design for Resources</a>
      <a class="cote-link" onclick="weNav('pause-change')">Design for Change</a>
      <a class="cote-link" onclick="weNav('pause-energy')">Design for Energy</a>`,
  `<a class="cote-link" onclick="weNav('pause-integration')">Design for Integration</a>
      <a class="cote-link" onclick="weNav('pause-site')">Site Plan</a>
      <a class="cote-link" onclick="weNav('pause-discovery')">Design for Discovery</a>
      <a class="cote-link" onclick="weNav('pause-economy')">Design for Economy</a>
      <a class="cote-link" onclick="weNav('pause-equitable')">Design for Equitable Communities</a>
      <a class="cote-link" onclick="weNav('pause-wellbeing')">Design for Well-Being</a>
      <a class="cote-link" onclick="weNav('pause-ecosystems')">Design for Ecosystems</a>
      <a class="cote-link" onclick="weNav('pause-resources')">Design for Resources</a>
      <a class="cote-link" onclick="weNav('pause-change')">Design for Change</a>
      <a class="cote-link" onclick="weNav('pause-water')">Design for Water</a>
      <a class="cote-link" onclick="weNav('pause-energy')">Design for Energy</a>`,
  'nav order updated'
);

writeFileSync(join(BASE, 'index.html'), html);
console.log('checkpoint written');
