import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';
const pngBuf = readFileSync(`${OUT}/test-overhead-cropped-nobg.png`);
const finalBuf = await sharp(pngBuf)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toBuffer();
writeFileSync(`${OUT}/test-overhead-cropped-white.jpg`, finalBuf);
console.log('done');
