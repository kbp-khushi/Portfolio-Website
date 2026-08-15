import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
mkdirSync(OUT, { recursive: true });

async function convert(filename, outname, maxWidth = 2000, quality = 80) {
  const buf = await sharp(join(SRC, filename))
    .rotate()
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${outname}.txt`), b64);
  console.log(`${outname}: ${(b64.length/1024).toFixed(0)} KB`);
}

await convert('Approach Fireflies more trees.png', 'hero', 2200);
await convert('Massing.jpg', 'massing-studies', 2000);
await convert('Pavilion Render.jpg', 'pavilion', 2000);
await convert('Resources.jpg', 'regional-sourcing', 1600);
await convert('Equitable Comm-01.jpg', 'user-groups', 1600);
await convert('Site Plan JPEG.jpg', 'site-plan', 2200, 75);
await convert('Library Exterior.jpg', 'exterior-library', 2000);
await convert('Light Studies.jpg', 'louver-study', 1600);
await convert('Ecology-01.jpg', 'ecosystem-diagram', 1600);
await convert('Library Interior.jpg', 'interior-library', 2000);
await convert('Folding Partition Diagram.jpg', 'operable-partitions', 1600);
await convert('Water and Energy Metrics_Water_EUI.jpg', 'energy', 1600);
await convert('Studio Interior with art.jpg', 'studio-interior', 2000);
await convert('Timber Life Cycle.jpg', 'timber-lifecycle', 1600);
await convert('Parking Bioswale.jpg', 'parking-bioswale', 1600);

console.log('Done — Caesura non-PDF images converted');
