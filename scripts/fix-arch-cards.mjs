import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
let html = readFileSync(htmlPath, 'utf-8');

// Get the original file from git
const original = execFileSync('git', ['show', 'HEAD:index.html'], {
  cwd: 'C:/KHUSHI/Claude/Portfolio-Website',
  maxBuffer: 100 * 1024 * 1024,
  encoding: 'utf-8'
});

// Projects that got corrupted: the-pause, woven-edge, beacon, fluke
const corrupted = ['the-pause', 'woven-edge', 'beacon', 'fluke'];

for (const slug of corrupted) {
  const cardMarker = `<div class="project-card" onclick="openProject('${slug}')">`;

  // Find the card-img in original
  const origCardIdx = original.indexOf(cardMarker);
  if (origCardIdx === -1) { console.log(`Original not found: ${slug}`); continue; }
  const origImgStart = original.indexOf('<img class="card-img"', origCardIdx);
  const origImgEnd = original.indexOf('>', origImgStart + 20);
  const origImg = original.substring(origImgStart, origImgEnd + 1);

  // Find the corrupted placeholder in current HTML
  const currCardIdx = html.indexOf(cardMarker);
  if (currCardIdx === -1) { console.log(`Current not found: ${slug}`); continue; }
  const currDivStart = html.indexOf('<div class="card-img"', currCardIdx);
  if (currDivStart === -1 || currDivStart - currCardIdx > 300) {
    console.log(`${slug}: no corrupted card-img found`);
    continue;
  }

  // Placeholder is: <div class="card-img" ...><span ...>TEXT</span></div>
  const spanEnd = html.indexOf('</span></div>', currDivStart);
  if (spanEnd === -1) { console.log(`${slug}: can't find end of placeholder`); continue; }
  const currDivEnd = spanEnd + '</span></div>'.length;

  html = html.substring(0, currDivStart) + origImg + html.substring(currDivEnd);
  console.log(`Restored: ${slug} (replaced ${currDivEnd - currDivStart} chars with ${origImg.length} chars)`);
}

writeFileSync(htmlPath, html);
console.log(`Done. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
