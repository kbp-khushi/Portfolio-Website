import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SCRATCH = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';
const B64_OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/massing-model/finals';
mkdirSync(B64_OUT, { recursive: true });

async function flatten(scratchName, outName) {
  const pngBuf = readFileSync(`${SCRATCH}/${scratchName}-nobg.png`);
  const finalBuf = await sharp(pngBuf)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  const b64 = `data:image/jpeg;base64,${finalBuf.toString('base64')}`;
  writeFileSync(join(B64_OUT, `${outName}.txt`), b64);
  console.log(`${outName}: ${(b64.length/1024).toFixed(0)} KB`);
}

await flatten('final-pick1-plan', 'pick-1');
await flatten('final-pick2-frontelev', 'pick-2');
await flatten('final-pick4-frontview', 'pick-4');
