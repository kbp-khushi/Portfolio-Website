import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

async function flatten(name) {
  const pngBuf = readFileSync(`${OUT}/${name}-nobg.png`);
  const finalBuf = await sharp(pngBuf)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  writeFileSync(`${OUT}/${name}-white.jpg`, finalBuf);
  console.log(`${name}: flattened`);
}

await flatten('test-plan');
await flatten('test-frontelev');
