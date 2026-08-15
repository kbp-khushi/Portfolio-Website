import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Professional Work';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/professional-work';
mkdirSync(OUT, { recursive: true });

async function convert(filename, outname, maxWidth = 1200) {
  const buf = await sharp(join(SRC, filename))
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${outname}.txt`), b64);
  console.log(`${outname}: ${(b64.length/1024).toFixed(0)} KB`);
}

await convert('tiered-bell-pendant.png', 'tiered-bell-pendant');
await convert('wine-storage-wall.png', 'wine-storage-wall');
await convert('ribbed-dome-pendant.png', 'ribbed-dome-pendant');
await convert('scalloped-drum-shade.png', 'scalloped-drum-shade');
await convert('double-arm-sconce.png', 'double-arm-sconce');
await convert('millwork-wall-unit.png', 'millwork-wall-unit');
await convert('sculptural-headboard-bed.png', 'sculptural-headboard-bed');

console.log('Done — Professional Work images converted');
