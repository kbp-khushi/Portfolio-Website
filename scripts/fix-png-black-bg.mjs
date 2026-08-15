import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/The Woven Edge';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/woven-edge';

async function convert(filename, outname, maxWidth = 1600, quality = 80) {
  const buf = await sharp(join(SRC, filename))
    .rotate()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${outname}.txt`), b64);
  console.log(`${outname}: ${(b64.length/1024).toFixed(0)} KB`);
}

await convert('GA Site Context.png', 'georgia', 900);
await convert('City Square Axon Callouts.png', 'city-square-axon', 2000);
await convert('Demographics Diagrams-01.png', 'demographics', 1800);
await convert('Equitable Communities Diagram-01.png', 'equitable-communities', 1800);
await convert('User Groups Diagrams-01.png', 'user-groups', 1800);
await convert('bathroom perspective collage.png', 'bathroom-charette-hero', 2000);
await convert('Ecosystem Diagrams.png', 'ecosystems', 2000);
await convert('Weaving Diagram.png', 'weaving', 1600);
await convert('K bathroom floorplan-02.png', 'bathroom-detail-1', 1200);
await convert('k bathroom section-01.png', 'bathroom-detail-2', 1200);
await convert('K Bathroom Structure Detail-01.png', 'bathroom-detail-3', 1200);
await convert('V Bathroom Water Diagram.png', 'bathroom-detail-4', 1200);

console.log('Done — all PNG-sourced Woven Edge images reflattened to white');
