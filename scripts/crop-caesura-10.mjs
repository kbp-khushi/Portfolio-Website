import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const SRC=`${SP}/board-hi-0.jpg`;                 // final boards page 1 @4x, 10368x6912
const OUT='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura/site-ecology-board.txt';

// window around the board's Site Ecology Diagram, excluding the flora circles
// on the left and the render band above
const WIN = { left: 7950, top: 2440, width: 2350, height: 1520 };
const win = sharp(SRC).extract(WIN);
const { data, info } = await win.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
let x0=info.width, x1=0, y0=info.height, y1=0;
for (let y=0; y<info.height; y++) for (let x=0; x<info.width; x++) {
  if (data[y*info.width+x] < 247) { if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
}
const pad = 20;
const box = {
  left: WIN.left + Math.max(0, x0-pad),
  top: WIN.top + Math.max(0, y0-pad),
  width: (x1-x0) + pad*2,
  height: (y1-y0) + pad*2,
};
console.log('board crop', box, 'ratio', (box.width/box.height).toFixed(3));

const buf = await sharp(SRC).extract(box)
  .flatten({ background:{r:255,g:255,b:255} })
  .resize({ width: 1800 })
  .jpeg({ quality: 90 })
  .toBuffer();
const meta = await sharp(buf).metadata();
console.log('output', meta.width+'x'+meta.height, (buf.length/1024).toFixed(0)+'KB');
await sharp(buf).resize({width:900}).jpeg({quality:80}).toFile(`${SP}/pv/site-ecology-board.jpg`);
writeFileSync(OUT, `data:image/jpeg;base64,${buf.toString('base64')}`);

// ---- swap + shrink both ecosystems diagrams --------------------------------
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;

const anchor='" alt="Site Ecology Diagram" style="width:100%"';
if (html.split(anchor).length-1 !== 1) throw new Error('site ecology anchor not unique');
const end = html.indexOf(anchor);
const srcOpen = html.lastIndexOf('src="', end);
html = html.slice(0, srcOpen+5) + readFileSync(OUT,'utf8').trim() + html.slice(end);

for (const alt of ['Ecosystem Diagram','Site Ecology Diagram']) {
  const o = `alt="${alt}" style="width:100%"`;
  const n = `alt="${alt}" style="width:100%;max-width:760px;display:block;margin:0 auto"`;
  if (html.split(o).length-1 !== 1) throw new Error(`sizing anchor not unique: ${alt}`);
  html = html.replace(o, () => n);
}
writeFileSync(P, html);
console.log('index.html', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
