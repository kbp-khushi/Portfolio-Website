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
function metric(text) {
  return `<div style="font-style:italic;margin-top:12px;color:var(--text-light)">Metric: ${text}</div>`;
}

// 1) Well-Being — louver resize smaller, add metric line
replaceOnce(
  '<div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap">\n        <div style="display:flex;flex-direction:column;align-items:center"><img loading="lazy" src="',
  '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">\n        <div style="display:flex;flex-direction:column;align-items:center"><img loading="lazy" src="',
  'louver row gap tightened'
);
for (const name of ['Solid Panel', 'Straight Louvers', 'Angled Louvers']) {
  replaceOnce(`alt="${name}" style="height:320px;width:auto;max-width:100%">`, `alt="${name}" style="height:210px;width:auto;max-width:100%">`, `louver ${name} resize`);
}
replaceOnce(
  'shapes the sense of comfort inside a public building.</div>',
  `shapes the sense of comfort inside a public building.${metric('Building average daylight factor 3.7%; 90% of user area within target range (2-10% DF); 95% with direct views to nature.')}</div>`,
  'wellbeing metric'
);

// 2) Remove Site Section (immediately under Ecosystems)
replaceOnce(
  '<!-- SITE SECTION (standard margins) -->\n  <div class="edit-full"><img loading="lazy" src="' + (() => {
    const m = '<!-- SITE SECTION (standard margins) -->\n  <div class="edit-full"><img loading="lazy" src="';
    const i = html.indexOf(m) + m.length;
    const e = html.indexOf('" alt="Site Section"></div>', i);
    return html.slice(i, e);
  })() + '" alt="Site Section"></div>\n\n  <!-- INTERIOR RENDERS -->',
  '<!-- INTERIOR RENDERS -->',
  'site section removed'
);

// 3) Ecosystems — add metric line
replaceOnce(
  'recharge the cypress swamp the building sits within.</div>',
  `recharge the cypress swamp the building sits within.${metric('94% site vegetated post-development; 100% native plantings; 5% waterways; 1% built post-development.')}</div>`,
  'ecosystems metric'
);

// 4) Resources — remove 10-item list, widen column, add metric line
{
  const listStart = must(
    '\n    <div style="width:100%;margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px 32px">',
    'resources list start'
  );
  const listStartIdx = html.indexOf(listStart);
  const listEndMarker = '\n    </div>\n      <div style="width:100%;margin-top:16px"><img loading="lazy" src="';
  const listEndIdx = html.indexOf(listEndMarker, listStartIdx);
  if (listEndIdx === -1) throw new Error('resources list end not found');
  html = html.slice(0, listStartIdx) + html.slice(listEndIdx + '\n    </div>'.length);
  console.log('[ok] resources 10-item list removed');
}
replaceOnce(
  '<div class="edit-row" id="pause-resources">\n    <div class="edit-text">',
  '<div class="edit-row" id="pause-resources" style="grid-template-columns:220px 1fr">\n    <div class="edit-text">',
  'resources column widened'
);
replaceOnce(
  'and the structure sequesters carbon for the full duration of its 200-year lifespan.</div>',
  `and the structure sequesters carbon for the full duration of its 200-year lifespan.${metric('707 m³ softwood; net carbon storage &minus;1,434,000 lbs CO&#8322; over 200-year lifespan.')}</div>`,
  'resources metric'
);

// 5) Change — add metric line
replaceOnce(
  'well beyond the program it currently serves.</div>',
  `well beyond the program it currently serves.${metric("FF 267' / BFE 255' (12' freeboard); 200-year design lifespan.")}</div>`,
  'change metric'
);

// 6) Water — replace enriched prose with clean metric line
replaceOnce(
  'The sloped metal roofs are the collection system: 13,450 SF of roof surface feeds two on-site cisterns, with a theoretical capacity of 354,376 gal/yr against an actual harvest of 192,000 gal/yr — well above the 155,183 gal/yr of indoor demand. The surplus of 162,376 gal/yr returns to the site basin, recharging the cypress swamp. No potable water is used for irrigation, and the elevated structure lets natural flooding continue beneath the building undisturbed.</div>',
  `The sloped metal roofs are the collection system: 13,450 SF of roof surface feeds two on-site cisterns. No potable water is used for irrigation, and the elevated structure lets natural flooding continue beneath the building undisturbed.${metric('192,000 gals of water collected; 0% potable water reliance; 83% stormwater managed onsite.')}</div>`,
  'water metric cleaned up'
);

// 7) Energy — remove duplicate diagrams, use Daylighting Analysis + bar-graph metric, clean metric line
replaceOnce(
  '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="' + (() => {
    const m = '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="';
    const i = html.indexOf(m, html.indexOf('id="pause-energy"')) + m.length;
    const e = html.indexOf('" alt="Energy" style="width:100%"></div>', i);
    return html.slice(i, e);
  })() + '" alt="Energy" style="width:100%"></div>\n      <div style="width:100%;margin-top:24px"><img loading="lazy" src="' + (() => {
    const m2 = 'alt="Energy Use Intensity chart" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>';
    const idx3 = html.indexOf('id="pause-energy"');
    const start2 = html.indexOf('<img loading="lazy" src="', html.indexOf('alt="Energy" style="width:100%"></div>', idx3) ) ;
    const srcStart = start2 + '<img loading="lazy" src="'.length;
    const srcEnd = html.indexOf('" ' + m2, srcStart);
    return html.slice(srcStart, srcEnd);
  })() + '" ' + 'alt="Energy Use Intensity chart" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>\n    </div>',
  `<div class="edit-images" style="align-items:stretch">
      <div style="width:100%"><img loading="lazy" src="${b64('daylighting-analysis')}" alt="Daylighting Analysis" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>
      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('energy-metric')}" alt="Energy Budget" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>
    </div>`,
  'energy images replaced (daylighting + bar graph)'
);
replaceOnce(
  'What remains after passive strategies is a net EUI of -14 kBtu/sf/yr — roughly 4,200 SF of south-facing photovoltaics generate more energy than the building demands, returning the surplus to the Aiken State Park grid. Against a CBECS 2003 public-assembly benchmark of 70 kBtu/sf/yr, passive strategies (shading, daylighting, ventilation, envelope) bring gross EUI to 42 before PV pushes it net negative.</div>',
  `What remains after passive strategies is a net EUI of -14 kBtu/sf/yr — roughly 4,200 SF of south-facing photovoltaics generate more energy than the building demands, returning the surplus to the Aiken State Park grid.${metric('Net EUI &minus;14 kBtu/sf/yr; 133% renewable energy coverage; LPD 0.62 W/sf.')}</div>`,
  'energy metric cleaned up'
);

writeFileSync(join(BASE, 'index.html'), html);
console.log('checkpoint 2 written');
