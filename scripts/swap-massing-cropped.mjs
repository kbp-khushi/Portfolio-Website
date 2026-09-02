import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const HTML = join(BASE, 'index.html');
const B64 = join(BASE, 'base64/massing-model/finals');

const images = {
  1: readFileSync(join(B64, 'pick-1.txt'), 'utf8').trim(),
  2: readFileSync(join(B64, 'pick-2.txt'), 'utf8').trim(),
};

const lines = readFileSync(HTML, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('id="page-massing-model"'));
const processIdx = lines.findIndex((l, i) => i > startIdx && l.includes('id="boards-massing-model-process"'));

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
      console.log(`Line ${i + 1}: replaced image ${imgCount}`);
    }
  }
}

writeFileSync(HTML, lines.join('\n'));
console.log('Done — pick-1 and pick-2 swapped to cropped versions');
