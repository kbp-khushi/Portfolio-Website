import sharp from 'sharp';
import { readFileSync, writeFileSync, renameSync } from 'fs';

// Khushi read this correctly: the odd spacing on Woven Edge is not CSS, it is
// whitespace baked into the diagram files. 070 carries 16.8% blank at the top
// and 19.3% at the bottom, 075 carries 22.8% at the top. Cropping each to its
// content leaves the CSS rhythm to do the spacing.
//
// Also: Caesura's user group figures and radial charts are oversized on
// mobile, and Selected Work gets the AIA note for Caesura.

sharp.cache(false);

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = `${ROOT}/site/index.html`;

// ---------------------------------------------------------------------------
// 1) crop the three Woven Edge diagrams to their content, with a small margin
//    so nothing reads as cut to the edge
// ---------------------------------------------------------------------------
const bounds = async (file) => {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, TH = 245;
  let top = H, bot = -1, left = W, right = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[y * W + x] < TH) {
      if (y < top) top = y; if (y > bot) bot = y;
      if (x < left) left = x; if (x > right) right = x;
    }
  }
  return { W, H, top, bot, left, right };
};

for (const name of ['070-image', '071-image', '075-image']) {
  const file = `${ROOT}/site/images/${name}.jpg`;
  const b = await bounds(file);
  const margin = Math.round(b.W * 0.02);
  const left = Math.max(0, b.left - margin);
  const top = Math.max(0, b.top - margin);
  const width = Math.min(b.W - left, b.right - b.left + 1 + margin * 2);
  const height = Math.min(b.H - top, b.bot - b.top + 1 + margin * 2);
  const buf = await sharp(file).extract({ left, top, width, height }).jpeg({ quality: 92 }).toBuffer();
  writeFileSync(file + ".tmp", buf);
  renameSync(file + ".tmp", file);
  console.log(`[ok] ${name}: ${b.W}x${b.H} -> ${width}x${height} (trimmed ${b.H - height}px of height)`);
}

// ---------------------------------------------------------------------------
// 2) Caesura's equitable diagrams shrink on mobile
// ---------------------------------------------------------------------------
let html = readFileSync(P, 'utf8');
const before = html.length;
const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

swap('.edit-images .pause-usergroups{grid-template-columns:repeat(2,1fr)!important}',
     '.edit-images .pause-usergroups{grid-template-columns:repeat(3,1fr)!important;gap:10px!important}\r\n' +
     '  .pause-charts img{max-width:240px;margin:0 auto}',
     'Caesura user groups 3 across, radial charts capped at 240px');

// ---------------------------------------------------------------------------
// 3) the AIA note on Caesura in Selected Work, matching the Woven Edge credit
// ---------------------------------------------------------------------------
swap('<div class="stack-fact"><span class="fact-label">Completion Time</span><span class="fact-value">20 weeks</span></div>\r\n        </div>',
     '<div class="stack-fact"><span class="fact-label">Completion Time</span><span class="fact-value">20 weeks</span></div>\r\n' +
     '          <div class="stack-credit">COTE Top Ten for Students &mdash; AIA award competition contender</div>\r\n        </div>',
     'Caesura credit added to Selected Work');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'),
  '| stack-credit blocks:', c('class="stack-credit"'));
