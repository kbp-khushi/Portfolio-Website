import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted/cookbook';
const B64_OUT = 'C:/KHUSHI/Claude/Portfolio-Website/base64/cookbook';
const BOOK_CONVERTED = 'C:/KHUSHI/Claude/Portfolio-Website/converted/virtuous-book';
const BOOK_B64 = 'C:/KHUSHI/Claude/Portfolio-Website/base64/virtuous-book';

async function recompress(inputDir, outputB64Dir, label, maxWidth, quality) {
  mkdirSync(outputB64Dir, { recursive: true });
  const files = readdirSync(inputDir).filter(f => f.endsWith('.jpg')).sort();
  let totalSize = 0;

  for (const f of files) {
    const buf = await sharp(join(inputDir, f))
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
    writeFileSync(join(outputB64Dir, f.replace('.jpg', '.txt')), b64);
    totalSize += b64.length;
  }
  console.log(`${label}: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB base64`);
}

async function run() {
  // Cookbook: resize to 1200px width, 60% quality
  await recompress(CONVERTED, B64_OUT, 'Cookbook (recompressed)', 1200, 60);
  // Virtuous Book: resize to 1400px, 65% quality
  await recompress(BOOK_CONVERTED, BOOK_B64, 'Virtuous Book (recompressed)', 1400, 65);
}

run().catch(console.error);
