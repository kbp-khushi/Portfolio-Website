import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const OUT = 'C:/Users/KHUSHI~1/AppData/Local/Temp/claude/C--KHUSHI-Claude/438823d3-718f-4f87-9193-a371d2dd36fc/scratchpad/model-check';
const buf = readFileSync('Caesura/Final Boards.pdf');
const doc = mupdf.Document.openDocument(buf, 'application/pdf');
console.log('pages:', doc.countPages());
for (let i = 0; i < doc.countPages(); i++) {
  const page = doc.loadPage(i);
  const bounds = page.getBounds();
  console.log(`page ${i}: ${bounds[2]-bounds[0]}x${bounds[3]-bounds[1]}pt`);
  const pixmap = page.toPixmap(mupdf.Matrix.scale(100/72, 100/72), mupdf.ColorSpace.DeviceRGB, false, true);
  const pngBuf = Buffer.from(pixmap.asPNG());
  const jpegBuf = await sharp(pngBuf).jpeg({ quality: 88 }).toBuffer();
  writeFileSync(`${OUT}/final-boards-page${i+1}.jpg`, jpegBuf);
  console.log(`  saved, ${(jpegBuf.length/1024).toFixed(0)} KB`);
}
