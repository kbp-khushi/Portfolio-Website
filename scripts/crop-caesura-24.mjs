import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const OUTDIR='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';

// ---- A) building section: crop flush to the ground band, then clone out the label
// the band runs x152-6560 and ends at y6765 on the board; the old crop kept a
// white margin on the left, right and bottom, which read as a notched corner
const BOX={ left:152, top:4191, width:6408, height:2574 };
const TEXT={ left:4, top:2527, right:304, bottom:2565 };   // in the new crop's coordinates
const pad=16;
const patchTop=TEXT.top-pad;
const patch={ left:Math.max(0,TEXT.left-pad), top:patchTop,
              width:(TEXT.right-TEXT.left)+pad*2,
              height:Math.min(BOX.height-patchTop, (TEXT.bottom-TEXT.top)+pad*2) };
{
  const base=sharp(`${SP}/board-hi-1.jpg`).extract(BOX);
  const clone=await base.clone().extract({ left:patch.left+560, top:patch.top, width:patch.width, height:patch.height }).png().toBuffer();
  const patched=await base.clone().composite([{ input:clone, left:patch.left, top:patch.top }]).png().toBuffer();
  const buf=await sharp(patched).flatten({background:{r:255,g:255,b:255}}).resize({width:2400}).jpeg({quality:93}).toBuffer();
  const m=await sharp(buf).metadata();
  console.log('section', m.width+'x'+m.height, (buf.length/1024).toFixed(0)+'KB', '| patch', patch);
  await sharp(buf).extract({left:0,top:Math.round(m.height*0.78),width:Math.round(m.width*0.30),height:Math.round(m.height*0.22)})
    .resize({width:900}).jpeg({quality:88}).toFile(`${SP}/pv/section-corner-check.jpg`);
  writeFileSync(`${OUTDIR}/building-section-nolabel.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
}

// ---- B) exploded axonometric: paint out its baked label, trim, relabel in type
{
  const src=`${SP}/cur-exploded-axo.jpg`;
  const { data, info } = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject:true });
  const LEFT=Math.round(info.width*0.35), FROM=Math.round(info.height*0.93), DARK=150, MININK=5;
  let ty0=info.height, ty1=0, tx0=info.width, tx1=0;
  for (let y=FROM;y<info.height;y++) for (let x=0;x<LEFT;x++)
    if (data[y*info.width+x]<DARK){ if(y<ty0)ty0=y; if(y>ty1)ty1=y; if(x<tx0)tx0=x; if(x>tx1)tx1=x; }
  console.log('axo label box', {tx0,ty0,tx1,ty1});
  const p=10;
  const cleaned=await sharp(src).composite([{ input:{ create:{ width:(tx1-tx0)+p*2, height:Math.min(info.height-(ty0-p),(ty1-ty0)+p*2), channels:3, background:{r:255,g:255,b:255} } }, left:Math.max(0,tx0-p), top:Math.max(0,ty0-p) }]).png().toBuffer();
  const g=await sharp(cleaned).greyscale().raw().toBuffer({resolveWithObject:true});
  let x0=g.info.width,x1=0,y0=g.info.height,y1=0;
  for (let y=0;y<g.info.height;y++) for (let x=0;x<g.info.width;x++)
    if (g.data[y*g.info.width+x]<247){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  const p2=12;
  const trim={ left:Math.max(0,x0-p2), top:Math.max(0,y0-p2),
               width:Math.min(g.info.width-Math.max(0,x0-p2),(x1-x0)+p2*2),
               height:Math.min(g.info.height-Math.max(0,y0-p2),(y1-y0)+p2*2) };
  const buf=await sharp(cleaned).extract(trim).flatten({background:{r:255,g:255,b:255}}).resize({width:1300}).jpeg({quality:90}).toBuffer();
  const m=await sharp(buf).metadata();
  console.log('axo', m.width+'x'+m.height, (buf.length/1024).toFixed(0)+'KB');
  await sharp(buf).resize({width:820}).jpeg({quality:82}).toFile(`${SP}/pv/axo-nolabel.jpg`);
  writeFileSync(`${OUTDIR}/exploded-axo-nolabel.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
}
