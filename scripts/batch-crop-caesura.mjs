import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CAESURA = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Caesura';
const OUT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
mkdirSync(OUT, { recursive: true });

async function cropOne(srcFile, box, pad, targetHeight, name) {
  const left = Math.max(0, box.x0 - pad);
  const top = Math.max(0, box.y0 - pad);
  const width = (box.x1 - box.x0) + pad * 2;
  const height = (box.y1 - box.y0) + pad * 2;

  const buf = await sharp(join(CAESURA, srcFile))
    .extract({ left, top, width, height })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize({ height: targetHeight })
    .jpeg({ quality: 88 })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
  writeFileSync(join(OUT, `${name}.txt`), b64);
  const meta = await sharp(buf).metadata();
  console.log(`${name}: ${meta.width}x${meta.height}, ${(b64.length / 1024).toFixed(0)} KB`);
}

// Massing Studies — shared height so captions align
const massingPad = 40, massingH = 420;
await cropOne('Massing.jpg', { x0: 347, y0: 1284, x1: 1323, y1: 1845 }, massingPad, massingH, 'massing-carve');
await cropOne('Massing.jpg', { x0: 1379, y0: 1279, x1: 2387, y1: 1886 }, massingPad, massingH, 'massing-frame');
await cropOne('Massing.jpg', { x0: 2452, y0: 1173, x1: 3602, y1: 1854 }, massingPad, massingH, 'massing-raise');
await cropOne('Massing.jpg', { x0: 3686, y0: 1160, x1: 4709, y1: 1886 }, massingPad, massingH, 'massing-hold');

// Louver / Light Studies — shared height
const louverPad = 40, louverH = 460;
await cropOne('Light Studies.jpg', { x0: 1242, y0: 1795, x1: 2004, y1: 2435 }, louverPad, louverH, 'louver-solid');
await cropOne('Light Studies.jpg', { x0: 2184, y0: 1795, x1: 2919, y1: 2420 }, louverPad, louverH, 'louver-straight');
await cropOne('Light Studies.jpg', { x0: 3093, y0: 1793, x1: 3848, y1: 2447 }, louverPad, louverH, 'louver-angled');

// Water + Energy metrics
await cropOne('Water and Energy Metrics.jpg', { x0: 295, y0: 995, x1: 2137, y1: 2050 }, 50, 520, 'water-metric');
await cropOne('Water and Energy Metrics.jpg', { x0: 2458, y0: 1002, x1: 4344, y1: 2043 }, 50, 520, 'energy-metric');
await cropOne('Water and Energy Metrics_Water_EUI.jpg', { x0: 1316, y0: 808, x1: 2768, y1: 2362 }, 60, 560, 'energy-eui');

console.log('Batch crop done.');
