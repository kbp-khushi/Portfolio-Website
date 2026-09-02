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

// 1) Hero image
{
  const startMarker = '<img class="pp-hero" loading="lazy" src="';
  must(startMarker, 'hero start');
  const startIdx = html.indexOf(startMarker) + startMarker.length;
  const endIdx = html.indexOf('" alt="Approach through cypress forest">', startIdx);
  html = html.slice(0, startIdx) + b64('hero-fireflies') + html.slice(endIdx);
  console.log('[ok] hero image swapped');
}

// 2) Massing: smaller (height 175), tighter gap, bold Carve/Frame/Raise/Hold
replaceOnce(
  '<div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap;padding:0 60px">',
  '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;padding:0 60px">',
  'massing gap tightened'
);
for (const [name, h] of [['Carve', 300], ['Frame', 300], ['Raise', 300], ['Hold', 300]]) {
  replaceOnce(`alt="${name}" style="height:${h}px;width:auto;max-width:100%">`, `alt="${name}" style="height:175px;width:auto;max-width:100%">`, `massing ${name} resize`);
}
for (const [title, desc] of [
  ['Carve', "Bend the massing to follow the river's edge."],
  ['Frame', 'Open sightlines and circulation toward forest and water.'],
  ['Raise', 'Lift the structure clear of the floodplain.'],
  ['Hold', 'Consolidate into distinct pavilions connected by boardwalk.'],
]) {
  replaceOnce(
    `<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">${title}<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">${desc}</span></div>`,
    `<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px"><b style="color:var(--text)">${title}</b><br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px;font-weight:400">${desc}</span></div>`,
    `massing ${title} bold label`
  );
}

// 3) Integration — add metric line
replaceOnce(
  'no part of the building works alone.</div>',
  `no part of the building works alone.${metric('One structural move generates the entire environmental and programmatic strategy.')}</div>`,
  'integration metric'
);

// 4) Site Plan — key single column, image bigger
replaceOnce(
  '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;line-height:1.7;color:var(--text-light)">',
  '<div style="display:grid;grid-template-columns:1fr;gap:4px;font-size:12px;line-height:1.7;color:var(--text-light)">',
  'site plan key single column'
);
replaceOnce(
  '<div style="flex:0 1 320px;min-width:240px">',
  '<div style="flex:0 1 260px;min-width:200px">',
  'site plan key column narrower'
);
replaceOnce(
  '<div style="flex:1 1 480px;min-width:280px;max-width:600px"><img loading="lazy" src="',
  '<div style="flex:1 1 480px;min-width:280px;max-width:960px"><img loading="lazy" src="',
  'site plan image bigger'
);

// 5) Discovery — add metric line
replaceOnce(
  'turning a visit into sustained contact with the site.</div>',
  `turning a visit into sustained contact with the site.${metric('Constant contact and awareness of the South Edisto River landscape.')}</div>`,
  'discovery metric'
);

// 6) Economy — bigger image, replace prose metric with board Metric line
replaceOnce(
  'alt="Regional Sourcing" style="width:100%;max-width:640px;display:block;margin:0 auto">',
  'alt="Regional Sourcing" style="width:100%;max-width:860px;display:block;margin:0 auto">',
  'economy image bigger'
);
replaceOnce(
  'so the building earns more from every square foot. Sourcing spans 30 miles (ready-mix concrete) to 100 miles (steel rebar), keeping the full material palette within a two-hour drive of the site.</div>',
  `so the building earns more from every square foot.${metric('Max distance traveled for materials 98.2 miles; single repetitive bay for all seven pavilions.')}</div>`,
  'economy metric line'
);

// 7) Equitable — bigger image, replace prose metric, add library proximity map
replaceOnce(
  'alt="User Groups" style="width:100%;max-width:640px;display:block;margin:0 auto">',
  'alt="User Groups" style="width:100%;max-width:860px;display:block;margin:0 auto">',
  'equitable image bigger'
);
replaceOnce(
  'is universally accessible, open year-round, and free. Five distinct user groups — residents, retirees, families, seasonal visitors, and outdoor recreation users — return throughout the day, from morning to evening.</div>',
  `is universally accessible, open year-round, and free.${metric('5 free educational/cultural program spaces serving ZIP 29856 (pop. 2,698).')}</div>`,
  'equitable metric line'
);
{
  const marker = 'alt="User Groups" style="width:100%;max-width:860px;display:block;margin:0 auto"></div>\n    </div>\n  </div>\n\n  <!-- WELL-BEING';
  must(marker, 'equitable images end anchor');
  const replacement = `alt="User Groups" style="width:100%;max-width:860px;display:block;margin:0 auto"></div>
      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('library-proximity')}" alt="Library Proximity Map" style="width:100%;max-width:860px;display:block;margin:0 auto"></div>
    </div>
  </div>

  <!-- WELL-BEING`;
  replaceOnce(marker, replacement, 'library proximity map added');
}

writeFileSync(join(BASE, 'index.html'), html);
console.log('checkpoint 1 written');
