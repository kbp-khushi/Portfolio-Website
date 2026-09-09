import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync, renameSync } from 'fs';

// New About portrait: the full Forsyth Park fountain with her in front of it,
// rather than the tighter crop. A new filename rather than overwriting
// 009-image.jpg, because replacing an image in place leaves browsers serving
// the old one.

sharp.cache(false);

const SRC = 'C:/Users/Khushi Patel/.claude/uploads/43edcba0-8c58-4063-b469-530e02c0eb4f/b9200d45-image.jpg';
const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const OUT = `${ROOT}/site/images/about-portrait.jpg`;
const P = `${ROOT}/site/index.html`;

// it renders 520px wide on desktop and 327 on mobile, so 1100 is already
// generous for a 2x screen
const W = 1100;
const buf = await sharp(SRC).rotate().resize({ width: W }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
writeFileSync(OUT + '.tmp', buf);
renameSync(OUT + '.tmp', OUT);
const meta = await sharp(OUT).metadata();
console.log(`[ok] wrote about-portrait.jpg ${meta.width}x${meta.height}, ${(statSync(OUT).size / 1024).toFixed(0)}KB`);

let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = '<img width="1100" height="1375" class="about-portrait-placeholder" id="about-portrait-img" src="images/009-image.jpg" alt="Khushi Patel at the Forsyth Park fountain in Savannah, in graduation dress">';
const c = html.split(OLD).length - 1;
if (c !== 1) throw new Error(`about portrait img: ${c} matches`);

const NEW = `<img width="${meta.width}" height="${meta.height}" class="about-portrait-placeholder" id="about-portrait-img" src="images/about-portrait.jpg" alt="Khushi Patel in front of the Forsyth Park fountain in Savannah, in graduation dress holding her cap">`;
html = html.replace(OLD, () => NEW);
console.log('[ok] markup points at the new file, with its real dimensions');

writeFileSync(P, html);
const n = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| old 009 refs:', n('009-image.jpg'),
  '| new refs:', n('about-portrait.jpg'),
  '| img tags:', n('<img'));
