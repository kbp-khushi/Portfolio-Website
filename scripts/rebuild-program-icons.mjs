import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
function b64(n) {
  return readFileSync(`base64/woven-edge/icon-${n}.txt`, 'utf8').trim();
}

const items = [
  ['playground', "Kids&rsquo; Playground"],
  ['green-flex', 'Green Flex Space'],
  ['dog-park', 'Dog Park'],
  ['boat-dock', 'Boat Dock'],
  ['marketspace', 'Marketspace'],
  ['waterfront-stepping', 'Waterfront Stepping'],
];

// locate the old block by its distinctive markers
const altIdx = html.indexOf('alt="Program Icons"');
if (altIdx === -1) throw new Error('Program Icons alt not found');
const blockStart = html.lastIndexOf('<div class="edit-full"', altIdx);
const gridEndMarker = 'Waterfront Stepping</div>\n    </div>\n  </div>';
const gridEndIdx = html.indexOf(gridEndMarker, altIdx);
if (gridEndIdx === -1) throw new Error('grid end marker not found');
const blockEnd = gridEndIdx + gridEndMarker.length;

const newItems = items.map(([slug, label]) => `      <div>
        <img loading="lazy" src="${b64(slug)}" alt="${label.replace('&rsquo;', "'")} icon" style="width:100%;display:block">
        <div style="font-family:var(--title);font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-light);margin-top:8px">${label}</div>
      </div>`).join('\n');

const newBlock = `<div class="edit-full" style="padding:8px 60px 24px">
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px;text-align:center">
${newItems}
    </div>
  </div>`;

html = html.slice(0, blockStart) + newBlock + html.slice(blockEnd);
writeFileSync('index.html', html);
console.log('Program Icons rebuilt as 6-up grid. size:', (html.length / 1024 / 1024).toFixed(1), 'MB');
