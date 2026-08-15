import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const SRC = join(BASE, 'monet painting/IMG_7057.HEIC');
const CONVERTED_DIR = join(BASE, 'converted/hero');
const BASE64_DIR = join(BASE, 'base64/hero');

// Crop region, proportional to a 2400px-wide render of the (EXIF-rotated) source.
// Isolates a single canvas panel (the original two-panel crop had a visible seam
// down the middle where the two panels of the mural meet) - excludes ceiling/wall,
// baseboard/floor, and the seam.
const CROP = { left: 840, top: 450, width: 1560, height: 855 };

async function run() {
  await mkdir(CONVERTED_DIR, { recursive: true });
  await mkdir(BASE64_DIR, { recursive: true });

  const { default: convert } = await import('heic-convert');
  const buf = await readFile(SRC);
  const jpegBuf = await convert({ buffer: buf, format: 'JPEG', quality: 0.95 });

  const resizedBuf = await sharp(jpegBuf)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();

  const outPath = join(CONVERTED_DIR, 'monet-crop.jpg');
  await sharp(resizedBuf)
    .extract(CROP)
    .jpeg({ quality: 85 })
    .toFile(outPath);
  console.log('Wrote', outPath);

  const finalBuf = await sharp(outPath).toBuffer();
  const dataUri = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  const txtPath = join(BASE64_DIR, 'monet.txt');
  await writeFile(txtPath, dataUri);
  console.log('Wrote', txtPath, `(${(dataUri.length / 1024).toFixed(0)} KB)`);
}

run().catch(console.error);
