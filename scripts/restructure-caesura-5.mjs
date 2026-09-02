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
function caption(text) {
  return `<div class="img-caption" style="text-align:center;margin-top:6px">${text}</div>`;
}

// 1) Revert Resources column width to the site default
replaceOnce(
  '<div class="edit-row" id="pause-resources" style="grid-template-columns:220px 1fr">',
  '<div class="edit-row" id="pause-resources">',
  'resources column reverted'
);

// 2) Well-Being — add Daylight and Ventilation Diagram below Floor Plan
replaceOnce(
  'alt="Floor Plan" style="width:100%;max-width:640px;display:block;margin:0 auto"></div>\n    </div>\n  </div>\n\n  <!-- ECOSYSTEMS + WATER -->',
  `alt="Floor Plan" style="width:100%;max-width:640px;display:block;margin:0 auto"></div>
      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('daylight-ventilation')}" alt="Daylight and Ventilation Diagram" style="width:100%;max-width:640px;display:block;margin:0 auto"></div>
    </div>
  </div>

  <!-- ECOSYSTEMS + WATER -->`,
  'daylight ventilation diagram added to wellbeing'
);

// 3) Ecosystems — add Site Ecology Diagram
replaceOnce(
  'alt="Ecosystem Diagram" style="width:100%"></div>\n      \n    </div>\n  </div>\n\n  <!-- INTERIOR RENDERS -->',
  `alt="Ecosystem Diagram" style="width:100%"></div>
      <div style="width:100%;margin-top:24px"><img loading="lazy" src="${b64('site-ecology')}" alt="Site Ecology Diagram" style="width:100%"></div>
    </div>
  </div>

  <!-- INTERIOR RENDERS -->`,
  'site ecology diagram added'
);

// 4) Change — add Flood Resilience diagram with caption
replaceOnce(
  'alt="Operable Partitions" style="width:100%"></div>\n    </div>\n  </div>\n\n  <!-- WATER -->',
  `alt="Operable Partitions" style="width:100%"></div>
      <div style="width:100%;margin-top:24px;max-width:360px;margin-left:auto;margin-right:auto"><img loading="lazy" src="${b64('flood-resilience')}" alt="Flood Resilience diagram">${caption('Flood Resilience')}</div>
    </div>
  </div>

  <!-- WATER -->`,
  'flood resilience diagram added'
);

// 5) Energy — remove Daylighting Analysis, keep only the bar-graph metric
{
  const marker = must(
    '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="',
    'energy images block start'
  );
  const startIdx = html.indexOf(marker, html.indexOf('id="pause-energy"'));
  const afterAltMarker = '" alt="Daylighting Analysis" style="width:100%;max-width:520px;display:block;margin:0 auto"></div>\n      <div style="width:100%;margin-top:24px"><img loading="lazy" src="';
  const afterAltIdx = html.indexOf(afterAltMarker, startIdx);
  if (afterAltIdx === -1) throw new Error('daylighting analysis marker not found in energy');
  const keepFrom = afterAltIdx + afterAltMarker.length;
  const newOpening = '<div class="edit-images" style="align-items:stretch">\n      <div style="width:100%"><img loading="lazy" src="';
  html = html.slice(0, startIdx) + newOpening + html.slice(keepFrom);
  console.log('[ok] daylighting analysis removed from energy, bar-graph metric kept');
}

// 6) Bottom of page — replace the all-boards composite with the tight
//    Building Section crop from board 2
{
  const startMarker = '<!-- SECTION PERSPECTIVE -->\n  <div class="edit-full"><img loading="lazy" src="';
  must(startMarker, 'bottom image start');
  const startIdx = html.indexOf(startMarker) + startMarker.length;
  const endIdx = html.indexOf('alt="Caesura Final Boards">', startIdx);
  if (endIdx === -1) throw new Error('caesura final boards alt not found');
  html = html.slice(0, startIdx) + b64('building-section') + '" ' + html.slice(endIdx).replace('alt="Caesura Final Boards">', 'alt="Building Section">');
  console.log('[ok] bottom image replaced with Building Section crop');
}

writeFileSync(join(BASE, 'index.html'), html);
console.log('checkpoint 5 written');
