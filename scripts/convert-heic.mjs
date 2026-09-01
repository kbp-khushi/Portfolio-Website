import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const OUT = join(BASE, 'converted');

const MODELS = [
  {
    name: 'massing-model',
    finals: join(BASE, 'Model Pictures/ARCH 727 Massing Model'),
    process: join(BASE, 'Model Pictures/ARCH 727 Massing Model/Process Pics'),
  },
  {
    name: 'section-model',
    finals: join(BASE, 'Model Pictures/ARCH 737 Section Model'),
    process: join(BASE, 'Model Pictures/ARCH 737 Section Model/Process Pics'),
  },
];

async function getHeicFiles(dir) {
  const files = await readdir(dir);
  return files.filter(f => f.toLowerCase().endsWith('.heic')).sort();
}

async function convertHeic(inputPath, outputPath, maxWidth, quality) {
  try {
    const img = sharp(inputPath);
    await img
      .resize({ width: maxWidth, withoutEnlargement: true })
      .flatten({ background: { r: 245, g: 242, b: 238 } }) // #F5F2EE
      .jpeg({ quality })
      .toFile(outputPath);
    console.log(`  OK: ${outputPath}`);
  } catch (e) {
    console.log(`  SHARP FAILED for ${inputPath}, trying heic-convert...`);
    const { default: convert } = await import('heic-convert');
    const buf = await readFile(inputPath);
    const pngBuf = await convert({ buffer: buf, format: 'JPEG', quality: quality / 100 });
    await sharp(pngBuf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .flatten({ background: { r: 245, g: 242, b: 238 } })
      .jpeg({ quality })
      .toFile(outputPath);
    console.log(`  OK (via heic-convert): ${outputPath}`);
  }
}

async function run() {
  await mkdir(OUT, { recursive: true });

  for (const model of MODELS) {
    const modelDir = join(OUT, model.name);
    const finalsDir = join(modelDir, 'finals');
    const processDir = join(modelDir, 'process');
    await mkdir(finalsDir, { recursive: true });
    await mkdir(processDir, { recursive: true });

    // Convert finals
    console.log(`\n=== ${model.name} finals ===`);
    const finalFiles = await getHeicFiles(model.finals);
    for (const f of finalFiles) {
      const outName = f.replace(/\.heic$/i, '.jpg');
      await convertHeic(join(model.finals, f), join(finalsDir, outName), 1600, 70);
    }

    // Convert process pics
    console.log(`\n=== ${model.name} process ===`);
    const processFiles = await getHeicFiles(model.process);
    for (const pf of processFiles) {
      const outName = pf.replace(/\.heic$/i, '.jpg');
      await convertHeic(join(model.process, pf), join(processDir, outName), 800, 60);
    }
  }

  console.log('\nDone! Check converted/ directory.');
}

run().catch(console.error);
