// Reverie (ARCH 747, Fall 2026): render her A8 Illustrator drawings (saved PDF
// compatible) straight from the .ai files, read only. Usage:
//   node reverie-render-ai.mjs <outDir> <targetLongSidePx> [fileFilter]
// Writes one JPG per artboard, named after the file and page.
import * as mupdf from 'mupdf';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const R = 'C:/KHUSHI/SCAD/M.Arch/ARCH 747/A8 - Final/';
const files = [
  'SAVANNAH/SAV - EXPLODED AXO.ai',
  'SAVANNAH/SAV - AXO SITEPLAN.ai',
  'SAVANNAH/SAV - MASSING.ai',
  'SAVANNAH/FLOORPLAN.ai',
  'ATLANTA/ATL - EXPLODED AXO.ai',
  'ATLANTA/ATL - AXO SITEPLAN.ai',
  'ATLANTA/ATL - MASSING.ai',
  'LIGHT SECTIONAL DIAGRAMS.ai',
  'CONCEPT DIAGRAMS.ai',
  'PARTI DIAGRAMS.ai',
];
const [out, longSide = '600', filter] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

for (const f of files) {
  if (filter && !f.includes(filter)) continue;
  const doc = mupdf.Document.openDocument(fs.readFileSync(R + f), 'application/pdf');
  for (let i = 0; i < doc.countPages(); i++) {
    const page = doc.loadPage(i);
    const b = page.getBounds();
    const s = Number(longSide) / Math.max(b[2] - b[0], b[3] - b[1]);
    const pm = page.toPixmap(mupdf.Matrix.scale(s, s), mupdf.ColorSpace.DeviceRGB, false, true);
    const name = path.basename(f, '.ai') + (doc.countPages() > 1 ? ` p${i + 1}` : '') + '.jpg';
    await sharp(Buffer.from(pm.asPNG())).flatten({ background: '#ffffff' }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(out, name));
    console.log(name, pm.getWidth() + 'x' + pm.getHeight());
  }
}
