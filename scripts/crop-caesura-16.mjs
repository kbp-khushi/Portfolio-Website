import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const OUTDIR='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';

// the three board crops that still carry a baked label, bottom left
const JOBS=[
  { name:'site-ecology-nolabel',  src:`${SP}/board-hi-0.jpg`, box:{left:7966,top:2524,width:2277,height:1414}, width:1800 },
  { name:'flood-resilience-nolabel', src:`${SP}/board-hi-1.jpg`, box:{left:5321,top:2200,width:1257,height:1278}, width:1600 },
  { name:'daylight-ventilation-nolabel', src:`${SP}/board-hi-0.jpg`, box:{left:4842,top:2496,width:1706,height:1452}, width:1600 },
];

for (const job of JOBS) {
  const base = sharp(job.src).extract(job.box);
  const { data, info } = await base.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
  const LEFT = Math.round(info.width*0.45);      // labels sit in the left portion
  const FROM = Math.round(info.height*0.80);     // and in the bottom band
  const MININK = 6;                              // ignore stray strokes and specks

  // row bands within that quadrant
  const rows=[];
  const DARK=150; // the baked labels are the darkest thing in this quadrant
  for (let y=FROM; y<info.height; y++){ let ink=0; for(let x=0;x<LEFT;x++) if(data[y*info.width+x]<DARK) ink++; rows.push([y,ink]); }
  const bands=[]; let s=-1;
  for (let i=0;i<rows.length;i++){
    const [y,ink]=rows[i];
    if (ink>=MININK && s===-1) s=y;
    if ((ink<MININK || i===rows.length-1) && s!==-1){ bands.push([s,y]); s=-1; }
  }
  // the label is the bottom-most short band, clear of whatever sits above it
  const cand = bands.filter(b => { const h=b[1]-b[0]; if (h<3 || h>info.height*0.07) return false; let x0=info.width,x1=0; for(let y=b[0];y<=b[1];y++) for(let x=0;x<LEFT;x++) if(data[y*info.width+x]<DARK){ if(x<x0)x0=x; if(x>x1)x1=x; } return (x1-x0) > info.width*0.06; }).pop();
  if (!cand) throw new Error(`${job.name}: no label band found in ${JSON.stringify(bands)}`);
  let lx0=info.width, lx1=0;
  for (let y=cand[0]; y<=cand[1]; y++) for (let x=0;x<LEFT;x++) if (data[y*info.width+x]<DARK){ if(x<lx0)lx0=x; if(x>lx1)lx1=x; }
  console.log(`${job.name}: bands ${JSON.stringify(bands)} -> label rows ${cand[0]}-${cand[1]}, cols ${lx0}-${lx1}`);

  // paint it out, then re-trim the now empty bottom
  const pad=10;
  const patch={ left:Math.max(0,lx0-pad), top:Math.max(0,cand[0]-pad),
                width:Math.min(info.width,(lx1-lx0)+pad*2), height:Math.min(info.height,(cand[1]-cand[0])+pad*2) };
  const cleaned = await base.clone()
    .composite([{ input:{ create:{ width:patch.width, height:patch.height, channels:3, background:{r:255,g:255,b:255} } }, left:patch.left, top:patch.top }])
    .toBuffer();

  const g = await sharp(cleaned).greyscale().raw().toBuffer({ resolveWithObject: true });
  let y1=0, x0=g.info.width, x1=0, y0=g.info.height;
  for (let y=0;y<g.info.height;y++) for (let x=0;x<g.info.width;x++) if (g.data[y*g.info.width+x]<247){ if(y>y1)y1=y; if(y<y0)y0=y; if(x<x0)x0=x; if(x>x1)x1=x; }
  const p2=14;
  const trim={ left:Math.max(0,x0-p2), top:Math.max(0,y0-p2),
               width:Math.min(g.info.width-Math.max(0,x0-p2),(x1-x0)+p2*2),
               height:Math.min(g.info.height-Math.max(0,y0-p2),(y1-y0)+p2*2) };
  const buf = await sharp(cleaned).extract(trim).flatten({background:{r:255,g:255,b:255}}).resize({width:job.width}).jpeg({quality:90}).toBuffer();
  const m = await sharp(buf).metadata();
  console.log(`   -> ${m.width}x${m.height} (${(m.width/m.height).toFixed(2)}), ${(buf.length/1024).toFixed(0)}KB`);
  await sharp(buf).resize({width:820}).jpeg({quality:80}).toFile(`${SP}/pv/${job.name}.jpg`);
  writeFileSync(`${OUTDIR}/${job.name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
}
