import * as mupdf from 'mupdf';
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const buf = readFileSync('The Woven Edge/Stepping Render.pdf');
const doc = mupdf.Document.openDocument(buf, 'application/pdf');
const page = doc.loadPage(0);
const pixmap = page.toPixmap(mupdf.Matrix.scale(100/72, 100/72), mupdf.ColorSpace.DeviceRGB, false, true);
const pngBuf = Buffer.from(pixmap.asPNG());
const jpegBuf = await sharp(pngBuf)
  .trim({ background: '#ffffff', threshold: 10 })
  .resize({ width: 2000, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 95 })
  .toBuffer();
const b64 = `data:image/jpeg;base64,${jpegBuf.toString('base64')}`;
writeFileSync('base64/woven-edge/stepping-render.txt', b64);
console.log('stepping-render:', (b64.length/1024).toFixed(0), 'KB');
