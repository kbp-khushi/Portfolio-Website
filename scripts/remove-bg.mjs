import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted';
const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64';

async function removeBg(inputPath, outputB64Path, bgColor, maxWidth, quality) {
  console.log(`Processing: ${inputPath}`);
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });

  const resultBlob = await removeBackground(blob, {
    output: { format: 'image/png' },
  });

  const arrayBuf = await resultBlob.arrayBuffer();
  const pngBuf = Buffer.from(arrayBuf);

  const finalBuf = await sharp(pngBuf)
    .flatten({ background: bgColor })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(outputB64Path, b64);
  console.log(`  Done: ${(b64.length / 1024).toFixed(0)} KB`);
}

// --- Massing Model Finals ---
console.log('\n=== Massing Model Finals ===');
const massingFinals = ['IMG_8083', 'IMG_8087', 'IMG_8088', 'IMG_8090', 'IMG_8091', 'IMG_8097'];
for (const name of massingFinals) {
  await removeBg(
    join(CONVERTED, 'massing-model/finals', `${name}.jpg`),
    join(B64, 'massing-model/finals', `${name}.txt`),
    { r: 245, g: 242, b: 238 },
    1600, 70
  );
}

// --- Massing Model Process ---
console.log('\n=== Massing Model Process ===');
const massingProcessDir = join(CONVERTED, 'massing-model/process');
const massingProcessFiles = readdirSync(massingProcessDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of massingProcessFiles) {
  const name = f.replace('.jpg', '');
  await removeBg(
    join(massingProcessDir, f),
    join(B64, 'massing-model/process', `${name}.txt`),
    { r: 245, g: 242, b: 238 },
    800, 60
  );
}

// --- Section Model Finals ---
console.log('\n=== Section Model Finals ===');
const sectionFinalsDir = join(CONVERTED, 'section-model/finals');
const sectionFinalFiles = readdirSync(sectionFinalsDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of sectionFinalFiles) {
  const name = f.replace('.jpg', '');
  await removeBg(
    join(sectionFinalsDir, f),
    join(B64, 'section-model/finals', `${name}.txt`),
    { r: 255, g: 255, b: 255 },
    1600, 70
  );
}

// --- Section Model Process ---
console.log('\n=== Section Model Process ===');
const sectionProcessDir = join(CONVERTED, 'section-model/process');
const sectionProcessFiles = readdirSync(sectionProcessDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of sectionProcessFiles) {
  const name = f.replace('.jpg', '');
  await removeBg(
    join(sectionProcessDir, f),
    join(B64, 'section-model/process', `${name}.txt`),
    { r: 255, g: 255, b: 255 },
    800, 60
  );
}

console.log('\nAll done!');
