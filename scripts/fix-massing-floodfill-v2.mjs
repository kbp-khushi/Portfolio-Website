import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/converted/massing-model/finals';
const B64_OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/massing-model/finals';
const white = { r: 255, g: 255, b: 255 };
const MIN_ISLAND_SIZE = 150; // enclosed background regions (e.g. window gaps) at/above this size get filled too

function isBackgroundPixel(r, g, b, y, height) {
  // Below the building, the studio floor board picks up a faint blue
  // ambient cast from the backdrop — require a much stronger, more
  // saturated blue down there so we don't eat into real floor texture,
  // which is what was producing scattered white speckle on the ground.
  if (y > height * 0.6) {
    return b > r + 35 && b > 165 && g > 145;
  }
  return (b > r + 12 && b > 135 && g > 120) || (b > r + 25 && b > 110);
}

function neighbors(idx, width, height) {
  const x = idx % width, y = Math.floor(idx / width);
  const out = [];
  if (x > 0) out.push(idx - 1);
  if (x < width - 1) out.push(idx + 1);
  if (y > 0) out.push(idx - width);
  if (y < height - 1) out.push(idx + width);
  return out;
}

function processMask(pixels, width, height) {
  const n = width * height;
  const isBg = new Uint8Array(n);
  for (let idx = 0; idx < n; idx++) {
    const i = idx * 3;
    const y = Math.floor(idx / width);
    isBg[idx] = isBackgroundPixel(pixels[i], pixels[i + 1], pixels[i + 2], y, height) ? 1 : 0;
  }

  const fill = new Uint8Array(n); // final: 1 = replace with white
  const visited = new Uint8Array(n);

  // Pass 1: flood fill from the border through background-like pixels
  const stack = [];
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const idx = y * width + x;
      if (isBg[idx] && !visited[idx]) { visited[idx] = 1; fill[idx] = 1; stack.push(idx); }
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const idx = y * width + x;
      if (isBg[idx] && !visited[idx]) { visited[idx] = 1; fill[idx] = 1; stack.push(idx); }
    }
  }
  while (stack.length) {
    const idx = stack.pop();
    for (const nb of neighbors(idx, width, height)) {
      if (!visited[nb] && isBg[nb]) { visited[nb] = 1; fill[nb] = 1; stack.push(nb); }
    }
  }

  // Pass 2: connected components of remaining background-like pixels
  // (enclosed regions, e.g. backdrop visible through window openings) —
  // fill only if the component is large enough to be a real region, not
  // isolated single-pixel JPEG noise on the studio floor
  for (let start = 0; start < n; start++) {
    if (!isBg[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    let head = 0;
    while (head < component.length) {
      const idx = component[head++];
      for (const nb of neighbors(idx, width, height)) {
        if (!visited[nb] && isBg[nb]) { visited[nb] = 1; component.push(nb); }
      }
    }
    if (component.length >= MIN_ISLAND_SIZE) {
      for (const idx of component) fill[idx] = 1;
    }
  }

  return fill;
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
  const fill = processMask(pixels, info.width, info.height);

  for (let idx = 0; idx < fill.length; idx++) {
    if (fill[idx]) {
      const i = idx * 3;
      pixels[i] = white.r;
      pixels[i + 1] = white.g;
      pixels[i + 2] = white.b;
    }
  }

  const finalBuf = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 3 }
  })
    .jpeg({ quality: 82 })
    .toBuffer();

  writeFileSync(join(CONVERTED, `${outputName}-v2.jpg`), finalBuf);

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${outputName}.txt`), b64);

  const meta = await sharp(finalBuf).metadata();
  console.log(`  ${outputName}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB b64`);
}

await processPhoto(join(CONVERTED, 'IMG_8101.jpg'), 'pick-2');
console.log('Done — pick-2 reprocessed (flood fill + enclosed-island cleanup)');
