import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/board-hi-1.jpg`;
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/building-section-nolabel.txt';
const BOX={ left:114, top:4191, width:6485, height:2615 };
const TEXT={ left:42, top:2527, right:342, bottom:2565 };
const pad=18;
const patch={ left:TEXT.left-pad, top:TEXT.top-pad,
              width:(TEXT.right-TEXT.left)+pad*2, height:(TEXT.bottom-TEXT.top)+pad*2 };
const OFFSET=520;   // clone a clean stretch of the same band from the right

const base = sharp(SRC).extract(BOX);
// lift a clean piece of band at identical rows, so tone, gradient and grain match
const clone = await base.clone()
  .extract({ left:patch.left+OFFSET, top:patch.top, width:patch.width, height:patch.height })
  .png().toBuffer();
const patched = await base.clone()
  .composite([{ input: clone, left: patch.left, top: patch.top }])
  .png().toBuffer();
const buf = await sharp(patched).flatten({background:{r:255,g:255,b:255}}).resize({width:2400}).jpeg({quality:93}).toBuffer();
const m = await sharp(buf).metadata();
console.log('cloned band over', patch, '-> output', m.width+'x'+m.height, (buf.length/1024).toFixed(0)+'KB');
await sharp(buf).extract({left:0,top:Math.round(m.height*0.80),width:Math.round(m.width*0.30),height:Math.round(m.height*0.20)})
  .resize({width:900}).jpeg({quality:88}).toFile(`${SP}/pv/section-patch-check.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
