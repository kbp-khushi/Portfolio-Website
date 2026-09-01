import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const HTML = join(BASE, 'index.html');
const B64 = join(BASE, 'base64/massing-model/finals');

// Order: hero (bird-eye overview), grid left (library closeup), grid right (visitor's pavilion), bottom full (front view)
const images = [
  readFileSync(join(B64, 'Bird-Eye.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'Library.txt'), 'utf8').trim(),
  readFileSync(join(B64, "Visitor's-Pavilion.txt"), 'utf8').trim(),
  readFileSync(join(B64, 'Front-View.txt'), 'utf8').trim(),
];

const lines = readFileSync(HTML, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('id="page-massing-model"'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="page-section-model"'));
const processIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="boards-massing-model-process"'));

console.log(`Massing model: lines ${startIdx + 1} to ${endIdx + 1}, process at ${processIdx + 1}`);

let imgCount = 0;
for (let i = startIdx; i < processIdx; i++) {
  const line = lines[i];
  if (line.includes('<img src="data:image/jpeg;base64,')) {
    const prefix = line.substring(0, line.indexOf('src="') + 5);
    const srcEnd = line.indexOf('"', line.indexOf('src="') + 5);
    const afterSrc = line.substring(srcEnd);

    lines[i] = prefix + images[imgCount] + afterSrc;
    console.log(`Line ${i + 1}: replacing image ${imgCount + 1} (${['bird-eye', 'library', "visitor's pavilion", 'front view'][imgCount]})`);
    imgCount++;
  }
}

console.log(`Replaced ${imgCount} images`);
writeFileSync(HTML, lines.join('\n'));
console.log('Done — massing model images updated');
