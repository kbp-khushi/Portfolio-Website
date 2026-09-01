import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted';
const OUT = 'C:/KHUSHI/Claude/Portfolio-Website/base64/thumbnails';
mkdirSync(OUT, { recursive: true });

async function makeThumbnail(inputPath, outputName, width = 600, height = 400) {
  const buf = await sharp(inputPath)
    .resize({ width, height, fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${outputName}.txt`), b64);
  console.log(`${outputName}: ${(b64.length / 1024).toFixed(0)} KB`);
}

await makeThumbnail(join(CONVERTED, 'virtuous-book/page-13.jpg'), 'virtuous-book');
await makeThumbnail(join(CONVERTED, 'cookbook/page-07.jpg'), 'cookbook');
await makeThumbnail(join(CONVERTED, 'massing-model/finals/IMG_8083.jpg'), 'massing-model');
await makeThumbnail(join(CONVERTED, 'section-model/finals/IMG_8477.jpg'), 'section-model');
