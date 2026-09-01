import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/converted/massing-model/finals';
const B64_OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/massing-model/finals';
const white = { r: 255, g: 255, b: 255 };

const picks = [
  { file: 'IMG_8101.jpg', name: 'pick-2' },
];

async function processPhoto(inputPath, outputName) {
  const resized = await sharp(inputPath)
    .rotate()
    .flatten({ background: white })
    .resize({ width: 2000, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

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

    const isBlue = y < bottomThreshold
      ? (b > r + 20 && b > 160 && g > 150)
      : (b > r + 10 && b > 140 && g > 130) || (b > r + 25 && b > 120);

    if (isBlue) {
      pixels[i] = white.r;
      pixels[i + 1] = white.g;
      pixels[i + 2] = white.b;
    }
  }

  const finalBuf = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 3 }
  })
    .jpeg({ quality: 80 })
    .toBuffer();

  writeFileSync(join(CONVERTED, `${outputName}-white.jpg`), finalBuf);

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${outputName}.txt`), b64);

  const meta = await sharp(finalBuf).metadata();
  console.log(`  ${outputName}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

for (const { file, name } of picks) {
  console.log(`Processing ${file} -> ${name}`);
  await processPhoto(join(CONVERTED, file), name);
}

console.log('Done — picks 1, 2, 4 reprocessed with white background');
