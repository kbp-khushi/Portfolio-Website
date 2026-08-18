import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const b64 = readFileSync('base64/woven-edge/program-icons.txt', 'utf8').trim();
const buf = Buffer.from(b64.split(',')[1], 'base64');
const meta = await sharp(buf).metadata();
console.log('source:', meta.width, meta.height);

const iconColWidth = Math.round(meta.width * 0.52); // exclude User Groups sidebar on the right
const bandHeight = Math.round(meta.height / 6);
const names = ['playground', 'green-flex', 'dog-park', 'boat-dock', 'marketspace', 'waterfront-stepping'];

for (let i = 0; i < 6; i++) {
  const top = i * bandHeight;
  const cropped = await sharp(buf)
    .extract({ left: 0, top, width: iconColWidth, height: bandHeight })
    .trim({ background: '#ffffff', threshold: 8 })
    .resize({ width: 500, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  const outB64 = `data:image/jpeg;base64,${cropped.toString('base64')}`;
  writeFileSync(`base64/woven-edge/icon-${names[i]}.txt`, outB64);
  console.log(names[i], (outB64.length/1024).toFixed(0), 'KB');
}
