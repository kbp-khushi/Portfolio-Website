import sharp from 'sharp';
import { readFileSync, writeFileSync, renameSync } from 'fs';

// The model thumbnails read as shifted right of their labels. The card is
// 250px wide with the label left aligned at x=0, but the image is letterboxed
// by object-fit:contain and centred in that box, so its content began about
// 100px in. Section model was the worse of the two because its subject fills
// only 49% of the file width against 70% for massing.
//
// Cropping on its own would have made it narrower and worse, so this does
// both: crop each file to its content, then left align the box so the model
// starts on the same line as the words underneath, the way the project cards
// above already work.
//
// New filenames because these are already cached from earlier today.

sharp.cache(false);

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = `${ROOT}/site/index.html`;

const bounds = async (file) => {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, TH = 242;
  let top = H, bot = -1, left = W, right = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[y * W + x] < TH) {
      if (y < top) top = y; if (y > bot) bot = y;
      if (x < left) left = x; if (x > right) right = x;
    }
  }
  return { W, H, top, bot, left, right };
};

const crops = {};
for (const [name, slug] of [['117-image', 'section'], ['104-image', 'massing']]) {
  const file = `${ROOT}/site/images/${name}.jpg`;
  const b = await bounds(file);
  const margin = Math.round(b.W * 0.015);
  const left = Math.max(0, b.left - margin);
  const top = Math.max(0, b.top - margin);
  const width = Math.min(b.W - left, b.right - b.left + 1 + margin * 2);
  const height = Math.min(b.H - top, b.bot - b.top + 1 + margin * 2);
  const out = `${ROOT}/site/images/${name}-trimmed.jpg`;
  const buf = await sharp(file).extract({ left, top, width, height }).jpeg({ quality: 92 }).toBuffer();
  writeFileSync(out + '.tmp', buf);
  renameSync(out + '.tmp', out);
  crops[name] = { width, height };
  console.log(`[ok] ${slug}: ${b.W}x${b.H} -> ${width}x${height}`);
}

let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// the thumbnails resolve from the first image on each model page, so point
// those at the trimmed files
for (const [name, slug] of [['117-image', 'section model'], ['104-image', 'massing model']]) {
  const { width, height } = crops[name];
  const old = new RegExp(`src="images/${name}\\.jpg"`);
  const hits = (html.match(new RegExp(`images/${name}\\.jpg`, 'g')) || []).length;
  if (hits !== 1) throw new Error(`${name}: ${hits} references`);
  html = html.replace(old, `src="images/${name}-trimmed.jpg"`);
  // its width/height attributes have to follow the new file
  html = html.replace(
    new RegExp(`<img([^>]*)width="\\d+" height="\\d+"([^>]*images/${name}-trimmed\\.jpg[^>]*)>`),
    `<img$1width="${width}" height="${height}"$2>`);
  console.log('[ok]', slug, 'points at the trimmed file');
}

swap('.model-img{height:130px;width:100%;object-fit:contain;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     '.model-img{height:130px;width:100%;object-fit:contain;object-position:left center;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     'thumbnails left align with their labels');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| img tags:', c('<img'),
  '| trimmed refs:', c('-trimmed.jpg'));
