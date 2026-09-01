import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted/massing-model/finals';
const B64_OUT = 'C:/KHUSHI/Claude/Portfolio-Website/base64/massing-model/finals';
const bgColor = { r: 245, g: 242, b: 238 };

// User's 4 picks:
// Image 1 = IMG_8083 (plan view from above) — full width hero
// Image 2 = IMG_8101 (front elevation) — side by side with image 3
// Image 3 = IMG_8095 (overhead view) — side by side with image 2
// Image 4 = IMG_8088 (front view with brick wall) — full width

const picks = [
  { file: 'IMG_8083.jpg', name: 'pick-1' },
  { file: 'IMG_8101.jpg', name: 'pick-2' },
  { file: 'IMG_8095.jpg', name: 'pick-3' },
  { file: 'IMG_8088.jpg', name: 'pick-4' },
];

async function processPhoto(inputPath, outputPath) {
  // Resize first
  const resized = await sharp(inputPath)
    .rotate()
    .flatten({ background: bgColor })
    .resize({ width: 2000, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  // Get raw pixels to replace blue backdrop
  const { data, info } = await sharp(resized)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const bottomThreshold = Math.round(info.height * 0.65);

  for (let i = 0; i < pixels.length; i += 3) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const y = Math.floor((i / 3) / info.width);

    // Blue backdrop detection (conservative near model, aggressive near edges)
    const isBlue = y < bottomThreshold
      ? (b > r + 20 && b > 160 && g > 150)
      : (b > r + 10 && b > 140 && g > 130) || (b > r + 25 && b > 120);

    if (isBlue) {
      pixels[i] = bgColor.r;
      pixels[i + 1] = bgColor.g;
      pixels[i + 2] = bgColor.b;
    }
  }

  const finalBuf = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 3 }
  })
    .jpeg({ quality: 78 })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(outputPath, b64);

  const meta = await sharp(finalBuf).metadata();
  console.log(`  ${outputPath.split('/').pop()}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

for (const { file, name } of picks) {
  console.log(`Processing ${file} → ${name}.txt`);
  await processPhoto(join(CONVERTED, file), join(B64_OUT, `${name}.txt`));
}

console.log('\nDone! 4 massing model picks processed.');
