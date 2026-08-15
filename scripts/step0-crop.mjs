import sharp from 'sharp';
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';

const meta = await sharp(`${BASE}/converted/massing-model/finals/IMG_8095.jpg`).metadata();
console.log('original size', meta.width, meta.height);
// crop out brick wall margins left/right, keep full height
const cropLeft = Math.round(meta.width * 0.06);
const cropRight = Math.round(meta.width * 0.93);
await sharp(`${BASE}/converted/massing-model/finals/IMG_8095.jpg`)
  .extract({ left: cropLeft, top: 0, width: cropRight - cropLeft, height: meta.height })
  .jpeg({ quality: 90 })
  .toFile(`${OUT}/test-overhead-cropped.jpg`);
console.log('cropped');
