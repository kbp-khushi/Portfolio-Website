import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
let html = readFileSync(htmlPath, 'utf-8');

// Remove the 4 additional work project page overlays
const overlayIds = ['page-virtuous-book', 'page-beaufort-cookbook', 'page-massing-model', 'page-section-model'];

for (const id of overlayIds) {
  const startMarker = `<div class="project-page" id="${id}">`;
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`NOT FOUND: ${id}`);
    continue;
  }

  // Find the closing </div> that ends this project-page
  // Count nested divs to find the right closing tag
  let depth = 0;
  let i = startIdx;
  let found = false;
  while (i < html.length) {
    if (html.substring(i, i + 4) === '<div') {
      depth++;
      i += 4;
    } else if (html.substring(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        // Found the closing tag
        const endIdx = i + 6;
        // Also strip trailing whitespace/newlines
        let trimEnd = endIdx;
        while (trimEnd < html.length && (html[trimEnd] === '\n' || html[trimEnd] === '\r')) {
          trimEnd++;
        }
        html = html.substring(0, startIdx) + html.substring(trimEnd);
        console.log(`Removed: ${id}`);
        found = true;
        break;
      }
      i += 6;
    } else {
      i++;
    }
  }
  if (!found) {
    console.log(`Could not find closing tag for: ${id}`);
  }
}

writeFileSync(htmlPath, html);
console.log(`Done stripping. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
