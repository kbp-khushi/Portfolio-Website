import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const SRC='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Camber/Camber_Charette_Boards.pdf';
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/camber';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
mkdirSync(OUT,{recursive:true});
const doc=mupdf.Document.openDocument(readFileSync(SRC),'application/pdf');
const names=['photo-1','photo-2','photo-3','photo-4','plans','elevation-east','elevation-north-section-a','section-b'];
for(let i=0;i<doc.countPages();i++){
  const pm=doc.loadPage(i).toPixmap(mupdf.Matrix.scale(2.6,2.6), mupdf.ColorSpace.DeviceRGB, false, true);
  const png=Buffer.from(pm.asPNG());
  // trim the sheet's white margin to the drawing or photograph itself
  const g=await sharp(png).flatten({background:{r:255,g:255,b:255}}).greyscale().raw().toBuffer({resolveWithObject:true});
  let x0=g.info.width,x1=0,y0=g.info.height,y1=0;
  for(let y=0;y<g.info.height;y++)for(let x=0;x<g.info.width;x++)
    if(g.data[y*g.info.width+x]<247){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  const pad=Math.round(g.info.width*0.008);
  const box={left:Math.max(0,x0-pad),top:Math.max(0,y0-pad),
             width:Math.min(g.info.width-Math.max(0,x0-pad),(x1-x0)+pad*2),
             height:Math.min(g.info.height-Math.max(0,y0-pad),(y1-y0)+pad*2)};
  const isPhoto=i<4;
  const buf=await sharp(png).flatten({background:{r:255,g:255,b:255}}).extract(box)
    .resize({width:isPhoto?1600:2000}).jpeg({quality:isPhoto?86:90}).toBuffer();
  const m=await sharp(buf).metadata();
  writeFileSync(`${OUT}/${names[i]}.txt`,`data:image/jpeg;base64,${buf.toString('base64')}`);
  console.log(names[i].padEnd(26), m.width+'x'+m.height, (buf.length/1024).toFixed(0)+'KB');
  if(i===4) await sharp(buf).resize({width:760}).jpeg({quality:80}).toFile(`${SP}/pv/camber-plans.jpg`);
}
