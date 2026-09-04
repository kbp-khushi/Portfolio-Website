import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/board-hi-0.jpg`;
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/site-ecology-nolabel.txt';
const BOX={ left:7966, top:2524, width:2277, height:1414 };

const base=sharp(SRC).extract(BOX);
const { data, info } = await base.clone().greyscale().raw().toBuffer({ resolveWithObject:true });
// the pool outline sits at the same rows as the label, so keep the search
// well left of it — the label is only ~210px wide
const LEFT=Math.round(info.width*0.16), FROM=Math.round(info.height*0.80), DARK=150, MININK=6;
const rows=[];
for (let y=FROM;y<info.height;y++){ let ink=0; for(let x=0;x<LEFT;x++) if(data[y*info.width+x]<DARK) ink++; rows.push([y,ink]); }
const bands=[]; let s=-1;
for (let i=0;i<rows.length;i++){ const [y,ink]=rows[i];
  if (ink>=MININK && s===-1) s=y;
  if ((ink<MININK || i===rows.length-1) && s!==-1){ bands.push([s,y]); s=-1; } }
const cand=bands.pop();
// rows are found in a narrow window so the pool cannot skew them, but the
// label runs wider than that window, so measure its columns across more width
const WIDE=Math.round(info.width*0.35);
let lx0=info.width, lx1=0;
for (let y=cand[0]; y<=cand[1]; y++) for (let x=0;x<WIDE;x++) if (data[y*info.width+x]<DARK){ if(x<lx0)lx0=x; if(x>lx1)lx1=x; }
console.log('bands', bands.concat([cand]), '-> label rows', cand, 'cols', lx0, lx1, `(width ${lx1-lx0})`);
if (lx1-lx0 > info.width*0.20) throw new Error('label box still too wide, it is catching the drawing');

const pad=12;
const patch={ left:Math.max(0,lx0-pad), top:Math.max(0,cand[0]-pad),
              width:(lx1-lx0)+pad*2, height:(cand[1]-cand[0])+pad*2 };
console.log('patch', patch);
const cleaned=await base.clone()
  .composite([{ input:{ create:{ width:patch.width, height:patch.height, channels:3, background:{r:255,g:255,b:255} } }, left:patch.left, top:patch.top }])
  .png().toBuffer();

// retrim now that the label is gone
const g=await sharp(cleaned).greyscale().raw().toBuffer({resolveWithObject:true});
let x0=g.info.width,x1=0,y0=g.info.height,y1=0;
for (let y=0;y<g.info.height;y++) for (let x=0;x<g.info.width;x++)
  if (g.data[y*g.info.width+x]<247){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
const p2=14;
const trim={ left:Math.max(0,x0-p2), top:Math.max(0,y0-p2),
             width:Math.min(g.info.width-Math.max(0,x0-p2),(x1-x0)+p2*2),
             height:Math.min(g.info.height-Math.max(0,y0-p2),(y1-y0)+p2*2) };
const buf=await sharp(cleaned).extract(trim).flatten({background:{r:255,g:255,b:255}}).resize({width:1800}).jpeg({quality:90}).toBuffer();
const m=await sharp(buf).metadata();
console.log('output',m.width+'x'+m.height,(buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:900}).jpeg({quality:82}).toFile(`${SP}/pv/site-ecology-fixed.jpg`);
writeFileSync(OUT,`data:image/jpeg;base64,${buf.toString('base64')}`);
