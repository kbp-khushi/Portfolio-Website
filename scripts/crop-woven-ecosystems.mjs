import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
const SRC='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/The Woven Edge/Ecosystem Diagrams.png';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/woven';
mkdirSync(OUT,{recursive:true});

const flat = await sharp(SRC).flatten({background:{r:255,g:255,b:255}}).png().toBuffer();
const { data, info } = await sharp(flat).greyscale().raw().toBuffer({ resolveWithObject:true });
const rowInk=[];
for (let y=0;y<info.height;y++){ let ink=0; for(let x=0;x<info.width;x++) if(data[y*info.width+x]<247) ink++; rowInk.push(ink); }
const bands=[]; let s=-1;
for (let y=0;y<info.height;y++){
  if (rowInk[y]>0 && s===-1) s=y;
  if ((rowInk[y]===0 || y===info.height-1) && s!==-1){ bands.push([s,y]); s=-1; }
}
const merged=[];
for (const b of bands){ if (merged.length && b[0]-merged[merged.length-1][1] < 40) merged[merged.length-1][1]=b[1]; else merged.push([...b]); }
console.log('blocks found:', merged.length, merged.map(b=>`${b[0]}-${b[1]}`).join(', '));
if (merged.length!==3) throw new Error('expected three habitat blocks');

const names=['oyster-reef','marsh','maritime-forest'];
for (let i=0;i<3;i++){
  const [y0,y1]=merged[i];
  const pad=16;
  const top=Math.max(0,y0-pad), height=Math.min(info.height-top,(y1-y0)+pad*2);
  // trim each block's own left/right margins too
  let x0=info.width, x1=0;
  for (let y=y0;y<=y1;y++) for (let x=0;x<info.width;x++) if (data[y*info.width+x]<247){ if(x<x0)x0=x; if(x>x1)x1=x; }
  const left=Math.max(0,x0-pad), width=Math.min(info.width-left,(x1-x0)+pad*2);
  const buf=await sharp(flat).extract({left,top,width,height}).resize({width:900}).jpeg({quality:90}).toBuffer();
  const m=await sharp(buf).metadata();
  console.log(`  ${names[i]}: ${m.width}x${m.height} (${(m.width/m.height).toFixed(2)}), ${(buf.length/1024).toFixed(0)}KB`);
  await sharp(buf).resize({width:420}).jpeg({quality:82}).toFile(`${SP}/pv/we-${names[i]}.jpg`);
  writeFileSync(`${OUT}/${names[i]}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
}
