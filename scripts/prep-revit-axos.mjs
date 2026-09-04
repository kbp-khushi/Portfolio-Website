import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
const D = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Professional Work';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/revit';
mkdirSync(OUT, { recursive: true });

// callout search regions as fractions of the ORIGINAL sheet
const SETS = {
  king: { file:'Revit Modeling_King.jpg', items:[
    ['01', 0.03,0.30, 0.12,0.46, 'left'],
    ['02', 0.06,0.27, 0.56,0.75, 'left'],
    ['03', 0.76,0.90, 0.04,0.38, 'right'],
    ['04', 0.76,0.90, 0.41,0.68, 'right'],
    ['05', 0.75,0.92, 0.70,0.88, 'right'],
  ]},
  queen: { file:'Revit Modeling_Queen.jpg', items:[
    ['01', 0.02,0.28, 0.06,0.30, 'left'],
    ['02', 0.07,0.20, 0.38,0.57, 'left'],
    ['03', 0.03,0.26, 0.61,0.85, 'left'],
    ['04', 0.70,0.82, 0.04,0.37, 'right'],
    ['05', 0.83,0.95, 0.16,0.86, 'right'],
  ]},
  library: { file:'Revit Modeling_Library.jpg', items:[
    ['01', 0.40,0.72, 0.07,0.50, 'right'],
  ]},
  pdr: { file:'Revit Modeling_PDR.jpg', items:[
    ['01', 0.79,0.93, 0.35,0.67, 'right'],
  ]},
};

const W = 1423;                 // analysis scale
const THRESH = 244;
const positions = {};

for (const [name, cfg] of Object.entries(SETS)) {
  const src = `${D}/${cfg.file}`;
  const { data, info } = await sharp(src).resize({ width: W }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const inkBox = (rx0, rx1, ry0, ry1) => {
    let x0=rx1, x1=rx0, y0=ry1, y1=ry0, ink=0;
    for (let y=ry0; y<ry1; y++) for (let x=rx0; x<rx1; x++) {
      if (data[y*info.width+x] < THRESH) { ink++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    }
    return { x0, x1, y0, y1, ink };
  };
  // 1) overall content bounds -> trim the sheet's dead margins
  const full = inkBox(0, info.width, 0, info.height);
  const pad = Math.round(info.width * 0.012);
  const t = {
    x0: Math.max(0, full.x0-pad), y0: Math.max(0, full.y0-pad),
    x1: Math.min(info.width-1, full.x1+pad), y1: Math.min(info.height-1, full.y1+pad),
  };
  // only the drawings whose lowest callout sits near the bottom need extra
  // room for its number; adding it everywhere left Library and PDR floating high
  const rawBoxes = cfg.items.map(([,fx0,fx1,fy0,fy1]) => inkBox(
    Math.round(fx0*info.width), Math.round(fx1*info.width),
    Math.round(fy0*info.height), Math.round(fy1*info.height)));
  const lowest = Math.max(...rawBoxes.map(b => b.y1));
  if (lowest > full.y1 - (full.y1-full.y0)*0.06) {
    t.y1 = Math.min(info.height-1, t.y1 + Math.round((t.y1-t.y0) * 0.05));
    console.log('   (bottom room added for the lowest callout)');
  }
  // keep every drawing landscape so the four read as a set
  const MIN_RATIO = 1.4;
  let tw = t.x1-t.x0, th = t.y1-t.y0;
  if (tw/th < MIN_RATIO) {
    const grow = Math.round((Math.round(th*MIN_RATIO)-tw)/2);
    t.x0 = Math.max(0, t.x0-grow);
    t.x1 = Math.min(info.width-1, t.x1+grow);
    tw = t.x1-t.x0;
    console.log('   (widened to hold a ' + MIN_RATIO + ':1 minimum)');
  }
  th = t.y1-t.y0;

  // 2) callout boxes, expressed against the TRIMMED frame
  positions[name] = cfg.items.map(([num, fx0, fx1, fy0, fy1, side]) => {
    const b = inkBox(Math.round(fx0*info.width), Math.round(fx1*info.width),
                     Math.round(fy0*info.height), Math.round(fy1*info.height));
    const anchor = side === 'left'
      ? `left:${(((b.x0-t.x0)/tw)*100).toFixed(2)}%`
      : `right:${(((t.x1-b.x1)/tw)*100).toFixed(2)}%`;
    return { num, side, anchor, top: `top:${(((b.y1-t.y0)/th)*100).toFixed(2)}%` };
  });

  // 3) write the trimmed image at full resolution
  const meta = await sharp(src).metadata();
  const s = meta.width / info.width;
  const buf = await sharp(src)
    .extract({ left: Math.round(t.x0*s), top: Math.round(t.y0*s),
               width: Math.round(tw*s), height: Math.round(th*s) })
    .flatten({ background:{r:255,g:255,b:255} })
    .resize({ width: 2400 })
    .jpeg({ quality: 88 })
    .toBuffer();
  const m = await sharp(buf).metadata();
  writeFileSync(`${OUT}/${name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
  console.log(`${name}: sheet ${info.width}x${info.height} -> trim ${tw}x${th} (${(tw/th).toFixed(2)}) -> ${m.width}x${m.height}, ${(buf.length/1024).toFixed(0)}KB`);
  for (const p of positions[name]) console.log(`   ${p.num} ${p.side.padEnd(5)} ${p.anchor}; ${p.top}`);
}
writeFileSync(`${OUT}/positions.json`, JSON.stringify(positions, null, 2));
