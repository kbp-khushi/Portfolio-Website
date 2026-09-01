import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted/section-model';
const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64/section-model';

async function whiteBackground(inputPath, outputName, outDir, width = 1600, quality = 70) {
  const buf = await sharp(inputPath)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(outDir, `${outputName}.txt`), b64);
  console.log(`${outputName}: ${(b64.length / 1024).toFixed(0)} KB`);
}

// Finals
const finalsDir = join(CONVERTED, 'finals');
const finalsB64 = join(B64, 'finals');
const finals = readdirSync(finalsDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of finals) {
  const name = f.replace('.jpg', '');
  await whiteBackground(join(finalsDir, f), name, finalsB64, 1600, 70);
}

// Process
const processDir = join(CONVERTED, 'process');
const processB64 = join(B64, 'process');
const process_ = readdirSync(processDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of process_) {
  const name = f.replace('.jpg', '');
  await whiteBackground(join(processDir, f), name, processB64, 800, 60);
}

console.log('Done reprocessing section model images with white backgrounds');
