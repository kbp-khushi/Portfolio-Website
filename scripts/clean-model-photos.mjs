import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted';
const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64';

async function cleanPhoto(inputPath, outputB64Path, opts = {}) {
  const {
    maxWidth = 1600,
    quality = 70,
    cropTop = 0,      // fraction of height to crop from top (0-0.5)
    cropBottom = 0,    // fraction from bottom
    cropLeft = 0,      // fraction from left
    cropRight = 0,     // fraction from right
    bgColor = { r: 245, g: 242, b: 238 }  // flatten background color
  } = opts;

  let pipeline = sharp(inputPath);
  const meta = await pipeline.metadata();

  // Crop to reduce visible background
  if (cropTop || cropBottom || cropLeft || cropRight) {
    const left = Math.round(meta.width * cropLeft);
    const top = Math.round(meta.height * cropTop);
    const width = Math.round(meta.width * (1 - cropLeft - cropRight));
    const height = Math.round(meta.height * (1 - cropTop - cropBottom));
    pipeline = pipeline.extract({ left, top, width, height });
  }

  // Process: flatten with bg color, resize, then use raw pixel manipulation
  // to replace blue-dominant pixels with the background color
  const resized = await pipeline
    .flatten({ background: bgColor })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  // Get raw pixel data to replace blue backdrop
  const { data, info } = await sharp(resized)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const bottomThreshold = Math.round(info.height * 0.65); // bottom 35% gets aggressive detection
  for (let i = 0; i < pixels.length; i += 3) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const y = Math.floor((i / 3) / info.width);

    // Conservative detection for upper part (model area)
    // More aggressive for bottom part (table/paper area)
    const isBlueBackdrop = y < bottomThreshold
      ? (b > r + 20 && b > 160 && g > 150)
      : (b > r + 10 && b > 140 && g > 130) || (b > r + 25 && b > 120);

    if (isBlueBackdrop) {
      pixels[i] = bgColor.r;
      pixels[i + 1] = bgColor.g;
      pixels[i + 2] = bgColor.b;
    }
  }

  const finalBuf = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 3 }
  })
    .jpeg({ quality })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(outputB64Path, b64);
  console.log(`  ${outputB64Path.split('/').pop()}: ${(b64.length / 1024).toFixed(0)} KB`);
}

// --- MASSING MODEL FINALS ---
console.log('=== Massing Model Finals ===');
// Replace IMG_8083 (overhead plan) with IMG_8089 (better 3/4 angle)
const massingFinals = [
  { file: 'IMG_8089.jpg', name: 'IMG_8083', cropTop: 0.18, cropBottom: 0.1, cropLeft: 0.15, cropRight: 0.15 },
  { file: 'IMG_8084.jpg', name: 'IMG_8084', cropTop: 0.15, cropBottom: 0.06, cropLeft: 0.12, cropRight: 0.12 },
  { file: 'IMG_8093.jpg', name: 'IMG_8093', cropTop: 0.15, cropBottom: 0.14, cropLeft: 0.12, cropRight: 0.12 },
  { file: 'IMG_8092.jpg', name: 'IMG_8092', cropTop: 0.15, cropBottom: 0.12, cropLeft: 0.12, cropRight: 0.12 },
  { file: 'IMG_8098.jpg', name: 'IMG_8098', cropTop: 0.15, cropBottom: 0.06, cropLeft: 0.12, cropRight: 0.12 },
  { file: 'IMG_8097.jpg', name: 'IMG_8097', cropTop: 0.15, cropBottom: 0.04, cropLeft: 0.12, cropRight: 0.12 },
];

for (const { file, name, ...crop } of massingFinals) {
  await cleanPhoto(
    join(CONVERTED, 'massing-model/finals', file),
    join(B64, 'massing-model/finals', `${name}.txt`),
    { maxWidth: 1600, quality: 70, cropTop: crop.cropTop || 0, cropLeft: crop.cropLeft || 0, cropRight: crop.cropRight || 0, bgColor: { r: 245, g: 242, b: 238 } }
  );
}

// --- MASSING MODEL PROCESS ---
console.log('\n=== Massing Model Process ===');
const massingProcessDir = join(CONVERTED, 'massing-model/process');
const massingProcessFiles = readdirSync(massingProcessDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of massingProcessFiles) {
  const name = f.replace('.jpg', '');
  await cleanPhoto(
    join(massingProcessDir, f),
    join(B64, 'massing-model/process', `${name}.txt`),
    { maxWidth: 800, quality: 60, cropTop: 0.1, bgColor: { r: 245, g: 242, b: 238 } }
  );
}

// --- SECTION MODEL FINALS ---
console.log('\n=== Section Model Finals ===');
const sectionFinalsDir = join(CONVERTED, 'section-model/finals');
const sectionFinalFiles = readdirSync(sectionFinalsDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of sectionFinalFiles) {
  const name = f.replace('.jpg', '');
  await cleanPhoto(
    join(sectionFinalsDir, f),
    join(B64, 'section-model/finals', `${name}.txt`),
    { maxWidth: 1600, quality: 70, cropTop: 0.05, bgColor: { r: 255, g: 255, b: 255 } }
  );
}

// --- SECTION MODEL PROCESS ---
console.log('\n=== Section Model Process ===');
const sectionProcessDir = join(CONVERTED, 'section-model/process');
const sectionProcessFiles = readdirSync(sectionProcessDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of sectionProcessFiles) {
  const name = f.replace('.jpg', '');
  await cleanPhoto(
    join(sectionProcessDir, f),
    join(B64, 'section-model/process', `${name}.txt`),
    { maxWidth: 800, quality: 60, cropTop: 0.05, bgColor: { r: 255, g: 255, b: 255 } }
  );
}

console.log('\nAll done!');
