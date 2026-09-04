import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SRC='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura/Timber Life Cycle.jpg';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/timber-lifecycle-tight.txt';
const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
let x0=info.width,x1=0,y0=info.height,y1=0;
for (let y=0;y<info.height;y++) for (let x=0;x<info.width;x++)
  if (data[y*info.width+x]<247){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
const pad=Math.round(info.width*0.008);
const box={ left:Math.max(0,x0-pad), top:Math.max(0,y0-pad), width:(x1-x0)+pad*2, height:(y1-y0)+pad*2 };
console.log('sheet',info.width+'x'+info.height,'-> content',box,'ratio',(box.width/box.height).toFixed(2));
const buf=await sharp(SRC).extract(box).flatten({background:{r:255,g:255,b:255}}).resize({width:1800}).jpeg({quality:90}).toBuffer();
const m=await sharp(buf).metadata();
console.log('output',m.width+'x'+m.height,(buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:820}).jpeg({quality:80}).toFile(`${SP}/pv/timber-tight.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
