import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SRC='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura/Water and Energy Metrics_Water_EUI.jpg';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/energy-eui-notitle.txt';
// the chart lives in this window on the sheet; its baked title sits at the top
const WIN={ left:1287, top:700, width:1511, height:1750 };
const { data, info } = await sharp(SRC).extract(WIN).greyscale().raw().toBuffer({ resolveWithObject: true });
const rows=[];
for (let y=0;y<info.height;y++){ let ink=0; for(let x=0;x<info.width;x++) if(data[y*info.width+x]<247) ink++; rows.push(ink); }
const bands=[]; let s=-1;
for (let y=0;y<rows.length;y++){
  if (rows[y]>0 && s===-1) s=y;
  if ((rows[y]===0||y===rows.length-1) && s!==-1){ bands.push([s,y-1]); s=-1; }
}
const merged=[];
for (const b of bands){ if (merged.length && b[0]-merged[merged.length-1][1] < 20) merged[merged.length-1][1]=b[1]; else merged.push([...b]); }
console.log('first 3 bands (top,bottom,height):');
for (const b of merged.slice(0,3)) console.log('  ', b[0], b[1], b[1]-b[0]);
const title = merged[0];                       // the baked "Energy use intensity" line
const chartTop = merged[1][0];                 // first band of the chart proper
console.log('dropping title band', title, '-> starting at', chartTop);

// content bounds below the title
let x0=info.width, x1=0, y1=0;
for (let y=chartTop; y<info.height; y++) for (let x=0; x<info.width; x++) {
  if (data[y*info.width+x] < 247) { if(x<x0)x0=x; if(x>x1)x1=x; if(y>y1)y1=y; }
}
const pad=24;
const box={ left:WIN.left+Math.max(0,x0-pad), top:WIN.top+Math.max(0,chartTop-pad),
            width:(x1-x0)+pad*2, height:(y1-chartTop)+pad*2 };
console.log('crop',box,'ratio',(box.width/box.height).toFixed(3));
const buf=await sharp(SRC).extract(box).flatten({background:{r:255,g:255,b:255}}).resize({width:1400}).jpeg({quality:90}).toBuffer();
const m=await sharp(buf).metadata();
console.log('output',m.width+'x'+m.height,(buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:760}).jpeg({quality:80}).toFile(`${SP}/pv/eui-notitle.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
