import sharp from 'sharp';
import { writeFileSync } from 'fs';
const SP='C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/43edcba0-8c58-4063-b469-530e02c0eb4f/scratchpad';
const CAE='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura';
const OUTDIR='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
const save=async(buf,name,previewW=820)=>{
  const m=await sharp(buf).metadata();
  console.log(`${name}: ${m.width}x${m.height} (${(m.width/m.height).toFixed(2)}), ${(buf.length/1024).toFixed(0)}KB`);
  await sharp(buf).resize({width:previewW}).jpeg({quality:80}).toFile(`${SP}/pv/${name}.jpg`);
  writeFileSync(`${OUTDIR}/${name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
};

// A) Economy map, cropped in from the top and left as marked
await save(await sharp(`${CAE}/Resources.jpg`)
  .extract({ left:1626, top:965, width:1361, height:1677 })
  .flatten({background:{r:255,g:255,b:255}}).resize({width:1300}).jpeg({quality:90}).toBuffer(),
  'regional-map-tight');

// B) the board's floor plan block, room keys and daylight legend included
{
  const WIN={ left:3760, top:3950, width:2760, height:2900 };
  const { data, info } = await sharp(`${SP}/board-hi-0.jpg`).extract(WIN).greyscale().raw().toBuffer({resolveWithObject:true});
  let x0=info.width,x1=0,y0=info.height,y1=0;
  for (let y=0;y<info.height;y++) for (let x=0;x<info.width;x++)
    if (data[y*info.width+x]<247){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  const pad=22;
  const box={ left:WIN.left+Math.max(0,x0-pad), top:WIN.top+Math.max(0,y0-pad),
              width:(x1-x0)+pad*2, height:(y1-y0)+pad*2 };
  console.log('plans block', box, 'edges touched', {l:x0===0,r:x1===info.width-1,t:y0===0,b:y1===info.height-1});
  await save(await sharp(`${SP}/board-hi-0.jpg`).extract(box)
    .flatten({background:{r:255,g:255,b:255}}).resize({width:2000}).jpeg({quality:90}).toBuffer(),
    'floor-plans-board', 900);
}

// C) ecosystems icons with their serif captions cropped away
await save(await sharp(`${CAE}/Ecology_Ecology Metrics.jpg`)
  .extract({ left:631, top:1312, width:3750, height:690 })
  .flatten({background:{r:255,g:255,b:255}}).resize({width:1600}).jpeg({quality:90}).toBuffer(),
  'ecosystem-icons-notext');
