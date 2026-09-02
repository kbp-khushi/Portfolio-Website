import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const B64 = join(BASE, 'base64/caesura');
let html = readFileSync(join(BASE, 'index.html'), 'utf8');

function b64(name) {
  return readFileSync(join(B64, `${name}.txt`), 'utf8').trim();
}
function must(str, label) {
  if (html.indexOf(str) === -1) throw new Error(`MISSING marker: ${label}`);
  return str;
}
function replaceOnce(oldStr, newStr, label) {
  must(oldStr, label);
  const before = html.length;
  html = html.replace(oldStr, () => newStr); // function form avoids $-pattern issues in newStr
  console.log(`[ok] ${label}: ${before} -> ${html.length}`);
}

function labelDiv(title, desc) {
  return `<div style="text-align:center;font-family:var(--title);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);margin-top:8px">${title}<br><span style="font-family:var(--body);text-transform:none;letter-spacing:0;font-size:10px">${desc}</span></div>`;
}
function imgCol(src, alt, height, title, desc) {
  return `<div style="display:flex;flex-direction:column;align-items:center"><img loading="lazy" src="${src}" alt="${alt}" style="height:${height}px;width:auto;max-width:100%">${labelDiv(title, desc)}</div>`;
}

// ---------------------------------------------------------------
// 1) MASSING STUDIES -> 4 separate cropped diagrams
// ---------------------------------------------------------------
{
  const oldStart = must('<!-- MASSING -->\n  <div class="edit-full"><img loading="lazy" src="', 'massing start');
  const oldEndMarker = '\n    </div>\n  </div>\n\n  <!-- DISCOVERY -->';
  const startIdx = html.indexOf(oldStart);
  const endIdx = html.indexOf(oldEndMarker, startIdx) + oldEndMarker.length;
  if (endIdx <= startIdx) throw new Error('massing end not found');
  const oldBlock = html.slice(startIdx, endIdx);

  const newBlock = `<!-- MASSING -->
  <div class="edit-full">
    <div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap;padding:0 60px">
      ${imgCol(b64('massing-carve'), 'Carve', 300, 'Carve', "Bend the massing to follow the river's edge.")}
      ${imgCol(b64('massing-frame'), 'Frame', 300, 'Frame', 'Open sightlines and circulation toward forest and water.')}
      ${imgCol(b64('massing-raise'), 'Raise', 300, 'Raise', 'Lift the structure clear of the floodplain.')}
      ${imgCol(b64('massing-hold'), 'Hold', 300, 'Hold', 'Consolidate into distinct pavilions connected by boardwalk.')}
    </div>
  </div>

  <!-- DISCOVERY -->`;

  html = html.slice(0, startIdx) + newBlock + html.slice(endIdx);
  console.log('[ok] massing replaced, old len', oldBlock.length, 'new len', newBlock.length);
}

// ---------------------------------------------------------------
// 2) SITE PLAN -> remove from old spot, reinsert after Massing,
//    resized + image-right/key-left
// ---------------------------------------------------------------
{
  const oldStart = must('<!-- SITE PLAN -->\n  <div class="edit-full" id="pause-site"><img loading="lazy" src="', 'site plan start');
  const oldEndMarker = '\n    </div>\n  </div>\n\n  <!-- WELL-BEING';
  const startIdx = html.indexOf(oldStart);
  const endIdx = html.indexOf(oldEndMarker, startIdx);
  if (endIdx === -1) throw new Error('site plan end not found');
  const oldBlock = html.slice(startIdx, endIdx); // stop before the WELL-BEING comment, leave that comment in place

  const keyItems = [
    ['00', 'Parking'], ['05', 'Studio Pavilion'],
    ['01', 'Emergency Lane'], ['06', 'Library Pavilion'],
    ['02', 'Open-Air Pavilion'], ['07', 'Open-Air Pavilion'],
    ['03', 'Outdoor Classroom Pavilion'], ['08', 'Welcome Pavilion'],
    ['04', 'Open-Air Pavilion'], ['09', 'Historic Fishing Cabin'],
  ].map(([n, t]) => `<div>${n}&nbsp; ${t}</div>`).join('\n          ');

  const newSitePlanBlock = `<!-- SITE PLAN -->
  <div class="edit-full" id="pause-site" style="padding:0 60px">
    <div style="display:flex;gap:40px;align-items:center;flex-wrap:wrap;justify-content:center">
      <div style="flex:0 1 320px;min-width:240px">
        <div style="font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:10px">Site Plan Key</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;line-height:1.7;color:var(--text-light)">
          ${keyItems}
        </div>
      </div>
      <div style="flex:1 1 480px;min-width:280px;max-width:600px"><img loading="lazy" src="${b64('siteplan-existing')}" alt="Site Plan" style="width:100%;display:block"></div>
    </div>
  </div>
`;

  // remove old block (it sits between EQUITABLE and WELL-BEING comment)
  html = html.slice(0, startIdx) + html.slice(endIdx);

  // insert new block right after the Massing/Discovery marker's Massing side —
  // i.e. right before "<!-- DISCOVERY -->"
  const insertMarker = '\n\n  <!-- DISCOVERY -->';
  const insertIdx = html.indexOf(insertMarker);
  if (insertIdx === -1) throw new Error('discovery insert point not found');
  html = html.slice(0, insertIdx) + '\n\n  ' + newSitePlanBlock + html.slice(insertIdx);
  console.log('[ok] site plan moved, old len', oldBlock.length, 'new len', newSitePlanBlock.length);
}

writeFileSync(join(BASE, 'index.html'), html);
console.log('Step A (massing + site plan) written.');
