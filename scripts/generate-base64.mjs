import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const CONVERTED = join(BASE, 'converted');
const B64_OUT = join(BASE, 'base64');

mkdirSync(B64_OUT, { recursive: true });

function toBase64(filePath) {
  const buf = readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

function processDir(inputDir, outputDir, label) {
  mkdirSync(outputDir, { recursive: true });
  const files = readdirSync(inputDir).filter(f => f.endsWith('.jpg')).sort();
  let totalSize = 0;
  for (const f of files) {
    const b64 = toBase64(join(inputDir, f));
    const outPath = join(outputDir, f.replace('.jpg', '.txt'));
    writeFileSync(outPath, b64);
    totalSize += b64.length;
  }
  console.log(`${label}: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB base64`);
}

// Massing model - selected finals
const massingSelected = ['IMG_8083','IMG_8087','IMG_8088','IMG_8090','IMG_8091','IMG_8097'];
mkdirSync(join(B64_OUT, 'massing-model', 'finals'), { recursive: true });
let massingSize = 0;
for (const name of massingSelected) {
  const b64 = toBase64(join(CONVERTED, 'massing-model', 'finals', `${name}.jpg`));
  writeFileSync(join(B64_OUT, 'massing-model', 'finals', `${name}.txt`), b64);
  massingSize += b64.length;
}
console.log(`Massing finals (6 selected): ${(massingSize / 1024 / 1024).toFixed(1)} MB base64`);

// Massing model - process pics
processDir(
  join(CONVERTED, 'massing-model', 'process'),
  join(B64_OUT, 'massing-model', 'process'),
  'Massing process'
);

// Section model - all finals
processDir(
  join(CONVERTED, 'section-model', 'finals'),
  join(B64_OUT, 'section-model', 'finals'),
  'Section finals'
);

// Section model - process pics
processDir(
  join(CONVERTED, 'section-model', 'process'),
  join(B64_OUT, 'section-model', 'process'),
  'Section process'
);

// Virtuous Book - all pages
processDir(
  join(CONVERTED, 'virtuous-book'),
  join(B64_OUT, 'virtuous-book'),
  'Virtuous Book'
);

// Cookbook - all pages
processDir(
  join(CONVERTED, 'cookbook'),
  join(B64_OUT, 'cookbook'),
  'Cookbook'
);

console.log('\nDone! Base64 files ready in base64/ directory.');
