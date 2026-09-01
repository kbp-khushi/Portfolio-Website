import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted/massing-model';
const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64/massing-model';

async function cleanBackground(inputPath, outputName, outDir, width = 1600, quality = 70) {
  const buf = await sharp(inputPath)
    .flatten({ background: { r: 245, g: 242, b: 238 } })
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .modulate({ brightness: 1.05 })
    .jpeg({ quality })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(outDir, `${outputName}.txt`), b64);
  console.log(`${outputName}: ${(b64.length / 1024).toFixed(0)} KB`);
}

// Finals - the 6 selected photos
const finalsDir = join(CONVERTED, 'finals');
const finalsB64 = join(B64, 'finals');
const selectedFinals = ['IMG_8083', 'IMG_8087', 'IMG_8088', 'IMG_8090', 'IMG_8091', 'IMG_8097'];
for (const name of selectedFinals) {
  await cleanBackground(join(finalsDir, `${name}.jpg`), name, finalsB64, 1600, 70);
}

// Process photos
const processDir = join(CONVERTED, 'process');
const processB64 = join(B64, 'process');
const processFiles = readdirSync(processDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of processFiles) {
  const name = f.replace('.jpg', '');
  await cleanBackground(join(processDir, f), name, processB64, 800, 60);
}

console.log('Done reprocessing massing model images');
