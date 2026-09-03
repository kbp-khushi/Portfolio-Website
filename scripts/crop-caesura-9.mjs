import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/floorplan-full.png`;            // Daylighting Analysis.pdf page 1 @3x
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/floor-plan-noscale.txt';
const BAR_SCALE_TOP = 7091;                       // isolated band at the bottom = bar scale
const CUT = 6800;                                 // below last real content (6729), above the gap

const base = sharp(SRC);
const { data, info } = await base.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
let x0=info.width, x1=0, y0=info.height, y1=0;
for (let y=0; y<CUT; y++) for (let x=0; x<info.width; x++) {
  if (data[y*info.width+x] < 247) { if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
}
const pad = 24;
const left = Math.max(0, x0-pad), top = Math.max(0, y0-pad);
const width = Math.min(info.width-left, (x1-x0)+pad*2);
const height = Math.min(CUT-top, (y1-y0)+pad*2);
console.log('content bbox', {x0,x1,y0,y1}, '-> crop', {left,top,width,height}, 'bar scale was at y', BAR_SCALE_TOP);

const buf = await base.extract({ left, top, width, height })
  .flatten({ background: { r:255, g:255, b:255 } })
  .resize({ width: 2000 })
  .jpeg({ quality: 90 })
  .toBuffer();
const meta = await sharp(buf).metadata();
console.log('output', meta.width+'x'+meta.height, (buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:800}).jpeg({quality:80}).toFile(`${SP}/pv/floorplan-noscale.jpg`);
writeFileSync(OUT, `data:image/jpeg;base64,${buf.toString('base64')}`);

// ---- swap into index.html --------------------------------------------------
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const anchor='" alt="Floor Plan" style="width:100%;max-width:640px;display:block;margin:0 auto"';
if (html.split(anchor).length-1 !== 1) throw new Error('floor plan anchor not unique');
const end = html.indexOf(anchor);
const srcOpen = html.lastIndexOf('src="', end);
const before = html.length;
html = html.slice(0, srcOpen+5) + readFileSync(OUT,'utf8').trim() + html.slice(end+1);
writeFileSync(P, html);
console.log('index.html', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
