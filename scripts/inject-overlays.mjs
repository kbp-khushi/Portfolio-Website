import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
const overlaysPath = 'C:/KHUSHI/Claude/Portfolio-Website/scripts/overlays.html';

const html = readFileSync(htmlPath, 'utf-8');
const overlays = readFileSync(overlaysPath, 'utf-8');

// Insert after the Drodel project page closing div (before flipbook popup)
const marker = '</div>\n\n\n<div id="flipbook-popup"';
const idx = html.indexOf(marker);

if (idx === -1) {
  // Try alternate marker
  const alt = '<div id="flipbook-popup"';
  const idx2 = html.indexOf(alt);
  if (idx2 === -1) {
    console.error('Could not find insertion point!');
    process.exit(1);
  }
  const newHtml = html.slice(0, idx2) + overlays + '\n\n' + html.slice(idx2);
  writeFileSync(htmlPath, newHtml);
  console.log(`Inserted overlays before flipbook popup (alt marker). New size: ${(newHtml.length / 1024 / 1024).toFixed(1)} MB`);
} else {
  const insertAt = idx + '</div>\n\n\n'.length;
  const newHtml = html.slice(0, insertAt) + overlays + '\n\n' + html.slice(insertAt);
  writeFileSync(htmlPath, newHtml);
  console.log(`Inserted overlays after Drodel. New size: ${(newHtml.length / 1024 / 1024).toFixed(1)} MB`);
}
