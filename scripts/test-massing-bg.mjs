import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

async function test(inputPath, outName) {
  const inputBuf = readFileSync(inputPath);
  const blob = new Blob([inputBuf], { type: 'image/jpeg' });
  const resultBlob = await removeBackground(blob, { output: { format: 'image/png' } });
  const arrayBuf = await resultBlob.arrayBuffer();
  const pngBuf = Buffer.from(arrayBuf);

  const finalBuf = await sharp(pngBuf)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  writeFileSync(`${OUT}/${outName}-white.jpg`, finalBuf);
  console.log(`${outName}: done`);
}

await test('../converted/massing-model/finals/IMG_8083.jpg', 'test-plan');
await test('../converted/massing-model/finals/IMG_8101.jpg', 'test-frontelev');
