import sharp from 'sharp';
import { readFile } from 'fs/promises';

// Crops for the contact band, taken from the lower part of the Monet so it reads
// differently from the hero. Boxes are written against a 1600px wide view of the photo.
const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const { default: convert } = await import('heic-convert');
const jpeg = await convert({ buffer: await readFile(`${BASE}/monet painting/IMG_7057.HEIC`), format: 'JPEG', quality: 0.95 });
const full = await sharp(jpeg).rotate().toBuffer();
const { width } = await sharp(full).metadata();
const k = width / 1600;
const box = (x, y, w, h) => ({ left: Math.round(x * k), top: Math.round(y * k), width: Math.round(w * k), height: Math.round(h * k) });
const out = process.argv[2] || `${BASE}/site/images`;
const jobs = {
  // reflections and deep water under the lilies, stopping above the baseboard
  'monet-contact.jpg': box(575, 648, 1000, 246),
};
for (const [name, b] of Object.entries(jobs)) {
  await sharp(full).extract(b).resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 84 }).toFile(`${out}/${name}`);
  console.log(name, b);
}
