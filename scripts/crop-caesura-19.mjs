import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/board-hi-1.jpg`;
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/building-section-nolabel.txt';
const BOX={ left:114, top:4191, width:6485, height:2615 };   // the approved section crop
// "Building Section" measured inside the dark ground band, in crop coordinates
const TEXT={ left:42, top:2527, right:342, bottom:2565 };

const base = sharp(SRC).extract(BOX);
const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true });
const at=(x,y)=>{const i=(y*info.width+x)*info.channels; return [data[i],data[i+1],data[i+2]];};

// sample the poche just to the right of the type, on the same rows
const acc=[0,0,0]; let c=0;
for (let y=TEXT.top; y<=TEXT.bottom; y++) for (let x=TEXT.right+60; x<TEXT.right+560; x++){
  const [r,g,b]=at(x,y); acc[0]+=r; acc[1]+=g; acc[2]+=b; c++;
}
const ground={ r:Math.round(acc[0]/c), g:Math.round(acc[1]/c), b:Math.round(acc[2]/c) };
console.log('sampled ground colour', ground, 'from', c, 'px');

const pad=16;
const patch={ left:TEXT.left-pad, top:TEXT.top-pad,
              width:(TEXT.right-TEXT.left)+pad*2, height:(TEXT.bottom-TEXT.top)+pad*2 };
// stay inside the band
if (patch.top + patch.height > info.height) throw new Error('patch runs past the image');
console.log('patch', patch);

// sharp applies composite AFTER resize, so patch at full size first, then scale
const patched = await base.clone()
  .composite([{ input:{ create:{ width:patch.width, height:patch.height, channels:3, background:ground } }, left:patch.left, top:patch.top }])
  .png()
  .toBuffer();
const buf = await sharp(patched)
  .flatten({ background:{r:255,g:255,b:255} })
  .resize({ width:2400 })
  .jpeg({ quality:93 })
  .toBuffer();
const m=await sharp(buf).metadata();
console.log('output',m.width+'x'+m.height,(buf.length/1024).toFixed(0)+'KB');
await sharp(buf).extract({left:0,top:Math.round(m.height*0.80),width:Math.round(m.width*0.30),height:Math.round(m.height*0.20)})
  .resize({width:900}).jpeg({quality:88}).toFile(`${SP}/pv/section-patch-check.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
