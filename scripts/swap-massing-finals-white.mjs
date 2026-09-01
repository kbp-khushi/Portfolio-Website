import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const HTML = join(BASE, 'index.html');
const B64 = join(BASE, 'base64/massing-model/finals');

// Slot 4 (front view, IMG_8088) is intentionally left untouched — its
// backdrop is a brick wall, not the blue screen the others used, and
// the automated key can't clean it reliably. See conversation notes.
const images = {
  1: readFileSync(join(B64, 'pick-1.txt'), 'utf8').trim(),
  2: readFileSync(join(B64, 'pick-2.txt'), 'utf8').trim(),
  3: readFileSync(join(B64, 'pick-3.txt'), 'utf8').trim(),
};

const lines = readFileSync(HTML, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('id="page-massing-model"'));
const processIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="boards-massing-model-process"'));

console.log(`Massing model: starts at ${startIdx + 1}, process popup at ${processIdx + 1}`);

let imgCount = 0;
for (let i = startIdx; i < processIdx; i++) {
  const line = lines[i];
  if (line.includes('<img src="data:image/jpeg;base64,')) {
    imgCount++;
    if (images[imgCount]) {
      const prefix = line.substring(0, line.indexOf('src="') + 5);
      const srcEnd = line.indexOf('"', line.indexOf('src="') + 5);
      const afterSrc = line.substring(srcEnd);
      lines[i] = prefix + images[imgCount] + afterSrc;
      console.log(`Line ${i + 1}: replaced final image ${imgCount}`);
    } else {
      console.log(`Line ${i + 1}: left final image ${imgCount} untouched`);
    }
  }
}

console.log(`Replaced ${Object.keys(images).length} of ${imgCount} final images`);
writeFileSync(HTML, lines.join('\n'));
console.log('Done — massing model finals updated (1-3 white, 4 unchanged)');
