import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/converted/massing-model/finals';
const B64_OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/massing-model/finals';
const white = { r: 255, g: 255, b: 255 };

function isBackgroundPixel(r, g, b) {
  const isBlue = (b > r + 12 && b > 135 && g > 120) || (b > r + 25 && b > 110);
  const isBrick = (r > g + 15) && (r > b + 20) && r > 35 && r < 150;
  const isNearWhite = r > 220 && g > 215 && b > 205;
  return isBlue || isBrick || isNearWhite;
}

// Flood-fill from the image border: only pixels reachable from the edge
// through other "background-like" pixels get removed. This protects any
// interior model pixel that happens to share the background's color
// (e.g. a pale roof surface) but isn't actually connected to the backdrop.
function floodFillMask(pixels, width, height) {
  const mask = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const stack = [];

  const idxOf = (x, y) => y * width + x;
  const pushIfBg = (x, y) => {
    const idx = idxOf(x, y);
    if (visited[idx]) return;
    const i = idx * 3;
    if (isBackgroundPixel(pixels[i], pixels[i + 1], pixels[i + 2])) {
      visited[idx] = 1;
      mask[idx] = 1;
      stack.push(idx);
    } else {
      visited[idx] = 1;
    }
  };

  for (let x = 0; x < width; x++) { pushIfBg(x, 0); pushIfBg(x, height - 1); }
  for (let y = 0; y < height; y++) { pushIfBg(0, y); pushIfBg(width - 1, y); }

  while (stack.length) {
    const idx = stack.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    if (x > 0) pushIfBg(x - 1, y);
    if (x < width - 1) pushIfBg(x + 1, y);
    if (y > 0) pushIfBg(x, y - 1);
    if (y < height - 1) pushIfBg(x, y + 1);
  }

  return mask;
}

async function processPhoto(inputPath, outputName) {
  const resized = await sharp(inputPath)
    .rotate()
    .flatten({ background: white })
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const { data, info } = await sharp(resized)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const mask = floodFillMask(pixels, info.width, info.height);

  for (let idx = 0; idx < mask.length; idx++) {
    if (mask[idx]) {
      const i = idx * 3;
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

  writeFileSync(join(CONVERTED, `${outputName}-flood.jpg`), finalBuf);

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${outputName}.txt`), b64);

  const meta = await sharp(finalBuf).metadata();
  console.log(`  ${outputName}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

const picks = [
  { file: 'IMG_8083.jpg', name: 'pick-1' },
  { file: 'IMG_8101.jpg', name: 'pick-2' },
  { file: 'IMG_8095.jpg', name: 'pick-3' },
  { file: 'IMG_8088.jpg', name: 'pick-4' },
];

for (const { file, name } of picks) {
  console.log(`Processing ${file} -> ${name}`);
  await processPhoto(join(CONVERTED, file), name);
}

console.log('Done — all 4 picks reprocessed with flood-fill white background');
