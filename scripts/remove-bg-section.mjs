import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted';
const B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64';
const BG = { r: 245, g: 242, b: 238 }; // matches --bg: #F5F2EE

async function removeBg(inputPath, outputB64Path, maxWidth, quality) {
  console.log(`Processing: ${inputPath}`);
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });

  const resultBlob = await removeBackground(blob, {
    output: { format: 'image/png' },
  });

  const arrayBuf = await resultBlob.arrayBuffer();
  const pngBuf = Buffer.from(arrayBuf);

  const finalBuf = await sharp(pngBuf)
    .flatten({ background: BG })
    .resize({ width: maxWidth, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(outputB64Path, b64);
  console.log(`  Done: ${(b64.length / 1024).toFixed(0)} KB`);
}

// --- Section Model Finals ---
console.log('=== Section Model Finals ===');
const sectionFinalsDir = join(CONVERTED, 'section-model/finals');
const sectionFinalFiles = readdirSync(sectionFinalsDir).filter(f => f.endsWith('.jpg')).sort();
for (const f of sectionFinalFiles) {
  const name = f.replace('.jpg', '');
  await removeBg(
    join(sectionFinalsDir, f),
    join(B64, 'section-model/finals', `${name}.txt`),
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
    800, 60
  );
}

console.log('\nAll done!');
