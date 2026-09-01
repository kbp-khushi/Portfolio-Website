import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/Portfolio-Website';
const HTML = join(BASE, 'index.html');
const B64 = join(BASE, 'base64/section-model/finals');

// New base64 data (order: hero, then 4 grid images)
const hero = readFileSync(join(B64, 'IMG_8477.txt'), 'utf8').trim();
const grid = [
  readFileSync(join(B64, 'IMG_8479.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8480.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8481.txt'), 'utf8').trim(),
  readFileSync(join(B64, 'IMG_8482.txt'), 'utf8').trim(),
];

const lines = readFileSync(HTML, 'utf8').split('\n');

// Find the section model page
const startIdx = lines.findIndex(l => l.includes('id="page-section-model"'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="page-virtuous-book"'));

console.log(`Section model: lines ${startIdx + 1} to ${endIdx + 1}`);

// Within the section model, find image lines
let imgCount = 0;
for (let i = startIdx; i < endIdx; i++) {
  const line = lines[i];
  if (line.includes('<img src="data:image/jpeg;base64,')) {
    // Check if this is before the process photos section
    const processIdx = lines.findIndex((l, j) => j > startIdx && l.includes('id="boards-section-model-process"'));
    if (i >= processIdx) break; // Don't touch process photos

    const prefix = line.substring(0, line.indexOf('src="') + 5);
    const afterSrc = line.substring(line.indexOf('" ', line.indexOf('src="') + 5));

    let newB64;
    if (imgCount === 0) {
      newB64 = hero;
      console.log(`Line ${i + 1}: replacing hero image`);
    } else {
      newB64 = grid[imgCount - 1];
      console.log(`Line ${i + 1}: replacing grid image ${imgCount}`);
    }

    lines[i] = prefix + newB64 + afterSrc;
    imgCount++;
  }
}

console.log(`Replaced ${imgCount} images`);
writeFileSync(HTML, lines.join('\n'));
console.log('Done — HTML updated with new section model images');
