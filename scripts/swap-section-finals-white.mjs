import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const HTML = join(BASE, 'index.html');
const B64 = join(BASE, 'base64/section-model/finals');

const images = [
  readFileSync(join(B64, 'IMG_8477.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8479.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8480.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8481.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8482.txt'), 'utf8').trim(),
];

const lines = readFileSync(HTML, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('id="page-section-model"'));
const processIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="boards-section-model-process"'));

console.log(`Section model: starts at ${startIdx + 1}, process popup at ${processIdx + 1}`);

let imgCount = 0;
for (let i = startIdx; i < processIdx; i++) {
  const line = lines[i];
  if (line.includes('<img src="data:image/jpeg;base64,')) {
    const prefix = line.substring(0, line.indexOf('src="') + 5);
    const srcEnd = line.indexOf('"', line.indexOf('src="') + 5);
    const afterSrc = line.substring(srcEnd);

    lines[i] = prefix + images[imgCount] + afterSrc;
    console.log(`Line ${i + 1}: replaced final image ${imgCount + 1}`);
    imgCount++;
  }
}

console.log(`Replaced ${imgCount} images`);
writeFileSync(HTML, lines.join('\n'));
console.log('Done — section model finals updated to white background');
