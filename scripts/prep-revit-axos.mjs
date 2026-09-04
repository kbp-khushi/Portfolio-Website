import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
const D = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Professional Work';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/revit';
mkdirSync(OUT, { recursive: true });
const files = {
  'library': 'Revit Modeling_Library.jpg',
  'pdr': 'Revit Modeling_PDR.jpg',
  'king': 'Revit Modeling_King.jpg',
  'queen': 'Revit Modeling_Queen.jpg',
};
for (const [name, file] of Object.entries(files)) {
  const buf = await sharp(`${D}/${file}`)
    .flatten({ background: { r:255,g:255,b:255 } })
    .resize({ width: 2400 })
    .jpeg({ quality: 88 })
    .toBuffer();
  const m = await sharp(buf).metadata();
  writeFileSync(`${OUT}/${name}.txt`, `data:image/jpeg;base64,${buf.toString('base64')}`);
  console.log(`${name}: ${m.width}x${m.height}, ${(buf.length/1024).toFixed(0)}KB`);
}
