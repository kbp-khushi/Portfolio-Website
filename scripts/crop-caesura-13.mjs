import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/board-hi-0.jpg`;
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/daylight-ventilation-board.txt';
// window: right of the Well-Being text column, left of the Ecosystems column,
// below the render band, above the floor plan block
const WIN = { left: 4842, top: 2470, width: 1714, height: 1475 };
const { data, info } = await sharp(SRC).extract(WIN).greyscale().raw().toBuffer({ resolveWithObject: true });
let x0=info.width, x1=0, y0=info.height, y1=0;
for (let y=0; y<info.height; y++) for (let x=0; x<info.width; x++) {
  if (data[y*info.width+x] < 247) { if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
}
const pad=18;
const box={ left:WIN.left+Math.max(0,x0-pad), top:WIN.top+Math.max(0,y0-pad), width:(x1-x0)+pad*2, height:(y1-y0)+pad*2 };
console.log('crop',box,'ratio',(box.width/box.height).toFixed(3),'| touched window edges:',
  {left:x0===0,right:x1===info.width-1,top:y0===0,bottom:y1===info.height-1});
const buf=await sharp(SRC).extract(box).flatten({background:{r:255,g:255,b:255}}).resize({width:1600}).jpeg({quality:90}).toBuffer();
const m=await sharp(buf).metadata();
console.log('output',m.width+'x'+m.height,(buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:900}).jpeg({quality:80}).toFile(`${SP}/pv/daylight-board.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
