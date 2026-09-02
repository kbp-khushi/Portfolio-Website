import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CAESURA = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura';
const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/79ba3c13-fa71-498e-bc3a-756cd58c6081/scratchpad';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
mkdirSync(OUT, { recursive: true });

async function toB64(inputPath, name, opts = {}) {
  let pipeline = sharp(inputPath).flatten({ background: { r: 255, g: 255, b: 255 } });
  if (opts.width) pipeline = pipeline.resize({ width: opts.width });
  const buf = await pipeline.jpeg({ quality: opts.quality || 88 }).toBuffer();
  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${name}.txt`), b64);
  const meta = await sharp(buf).metadata();
  console.log(`${name}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB`);
}

await toB64(join(CAESURA, 'Approach Fireflies more trees.png'), 'hero-fireflies', { width: 2200 });
await toB64(join(CAESURA, 'Library Proximity Map-01.jpg'), 'library-proximity', { width: 1200 });
await toB64(join(SCRATCH, 'daylighting.jpg'), 'daylighting-analysis', { width: 1200 });
await toB64(join(SCRATCH, 'all-boards.jpg'), 'all-boards', { width: 1800, quality: 82 });

console.log('done');
