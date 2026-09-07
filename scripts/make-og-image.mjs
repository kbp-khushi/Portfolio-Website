import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/og-image.jpg';

// pull the Caesura approach render straight out of the page
const html = readFileSync(P, 'utf8');
const at = html.indexOf('alt="Approach through cypress forest"');
if (at === -1) throw new Error('caesura hero not found');
const srcOpen = html.lastIndexOf('base64,', at) + 'base64,'.length;
const srcEnd = html.indexOf('"', srcOpen);
const buf = Buffer.from(html.slice(srcOpen, srcEnd), 'base64');
const meta = await sharp(buf).metadata();
console.log('source render:', meta.width + 'x' + meta.height);

// 1200x630 is the size link previews crop to
const out = await sharp(buf)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
  .jpeg({ quality: 84 })
  .toBuffer();
writeFileSync(OUT, out);
const m = await sharp(out).metadata();
console.log('og image:', m.width + 'x' + m.height, (out.length / 1024).toFixed(0) + 'KB ->', OUT);
