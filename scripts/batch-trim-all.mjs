import sharp from 'sharp';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function trimFile(path) {
  const b64 = readFileSync(path, 'utf8').trim();
  const header = b64.split(',')[0] + ',';
  const buf = Buffer.from(b64.split(',')[1], 'base64');
  const before = await sharp(buf).metadata();
  try {
    const trimmed = await sharp(buf).trim({ background: '#ffffff', threshold: 12 }).jpeg({ quality: 88 }).toBuffer();
    const after = await sharp(trimmed).metadata();
    const changedEnough = (after.width !== before.width || after.height !== before.height) &&
      Math.abs((after.width*after.height) - (before.width*before.height)) / (before.width*before.height) > 0.03;
    if (changedEnough) {
      writeFileSync(path, header + trimmed.toString('base64'));
      console.log(`TRIMMED: ${path}  ${before.width}x${before.height} -> ${after.width}x${after.height}`);
      return true;
    } else {
      console.log(`skip (no meaningful change): ${path}`);
      return false;
    }
  } catch (e) {
    console.log(`ERROR on ${path}: ${e.message}`);
    return false;
  }
}

async function run() {
  const dirs = ['base64/caesura', 'base64/woven-edge'];
  let count = 0;
  for (const dir of dirs) {
    const files = readdirSync(dir).filter(f => f.endsWith('.txt'));
    for (const f of files) {
      const changed = await trimFile(join(dir, f));
      if (changed) count++;
    }
  }
  console.log(`\nDone. ${count} files trimmed.`);
}
run();
