import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/The Woven Edge';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/woven-edge';
mkdirSync(OUT, { recursive: true });

async function convert(filename, outname, maxWidth = 1600, quality = 80) {
  const buf = await sharp(join(SRC, filename))
    .rotate()
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${outname}.txt`), b64);
  console.log(`${outname}: ${(b64.length/1024).toFixed(0)} KB`);
}

await convert('ARCH 717 Circ Map.jpg', 'circulation-diagram');
await convert('ARCH 717 Civic Map.jpg', 'civic-spaces');
await convert('ARCH 717 Entry Nodes.jpg', 'entry-nodes');
await convert('ARCH 717 Sun.jpg', 'sun-wind');
await convert('ARCH 717 Tree.jpg', 'vegetation');
await convert('ARCH 717 View.jpg', 'viewpoints');
await convert('GA Site Context.png', 'georgia', 900);
await convert('IMG_8432.JPG', 'site-photo-1', 1000);
await convert('IMG_8452.JPG', 'site-photo-2', 1000);
await convert('IMG_8463.JPG', 'site-photo-3', 1000);
await convert('IMG_8506.JPG', 'site-photo-4', 1000);
await convert('IMG_8520.JPG', 'site-photo-5', 1000);
await convert('Demographics Diagrams-01.png', 'demographics', 1800);
await convert('City Square Axon Callouts.png', 'city-square-axon', 2000);
await convert('Equitable Communities Diagram-01.png', 'equitable-communities', 1800);
await convert('User Groups Diagrams-01.png', 'user-groups', 1800);
await convert('bathroom perspective collage.png', 'bathroom-charette-hero', 2000);
await convert('Ecosystem Diagrams.png', 'ecosystems', 2000);
await convert('Sections-01.jpg', 'street-sections-1', 1800);
await convert('Sections-02.jpg', 'street-sections-2', 1800);
await convert('Sections-03.jpg', 'water-sections-1', 1800);
await convert('Sections-04.jpg', 'water-sections-2', 1800);
await convert('Weaving Diagram.png', 'weaving', 1600);
await convert('K bathroom floorplan-02.png', 'bathroom-detail-1', 1200);
await convert('k bathroom section-01.png', 'bathroom-detail-2', 1200);
await convert('K Bathroom Structure Detail-01.png', 'bathroom-detail-3', 1200);
await convert('V Bathroom Water Diagram.png', 'bathroom-detail-4', 1200);

console.log('Done — Woven Edge non-PDF images converted');
