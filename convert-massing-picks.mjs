import sharp from 'sharp';
import { writeFileSync } from 'fs';

const SRC = 'C:/KHUSHI/Claude/Portfolio-Website/Model Pictures/ARCH 727 Massing Model';
const OUT = 'C:/KHUSHI/Claude/Portfolio-Website/converted/massing-model/finals';

for (const num of [1, 2, 3, 4]) {
  const inputPath = `${SRC}/${num}.HEIC`;
  const outputPath = `${OUT}/pick-${num}.jpg`;
  console.log(`Converting ${num}.HEIC...`);
  await sharp(inputPath)
    .rotate() // auto-rotate from EXIF
    .resize({ width: 2400, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
  const meta = await sharp(outputPath).metadata();
  console.log(`  → ${meta.width}x${meta.height}`);
}
console.log('Done!');
