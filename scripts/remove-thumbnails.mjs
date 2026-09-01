import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
let html = readFileSync(htmlPath, 'utf-8');

const cardProjects = [
  { slug: 'virtuous-book', label: 'VIRTUOUS BOOK', bg: '#2A2A2A', color: '#FFF', size: '20px', weight: '700', spacing: '2px' },
  { slug: 'beaufort-cookbook', label: 'FROM ELSEWHERE', bg: '#8B7355', color: '#FFF', size: '18px', weight: '300', spacing: '4px' },
  { slug: 'massing-model', label: 'MASSING MODEL', bg: 'var(--bg)', color: 'var(--accent)', size: '14px', weight: '600', spacing: '3px' },
  { slug: 'section-model', label: 'SECTION MODEL', bg: 'var(--bg)', color: 'var(--accent)', size: '14px', weight: '600', spacing: '3px' },
];

for (const card of cardProjects) {
  // Find the card div
  const cardMarker = `onclick="openProject('${card.slug}')">`;
  // Find this in the project-grid context (not nav dropdown)
  let searchFrom = html.indexOf('id="additional-work"');
  const cardIdx = html.indexOf(cardMarker, searchFrom);
  if (cardIdx === -1) {
    console.log(`NOT FOUND card: ${card.slug}`);
    continue;
  }

  // Find <img class="card-img" after this card marker
  const imgStart = html.indexOf('<img class="card-img"', cardIdx);
  if (imgStart === -1 || imgStart - cardIdx > 200) {
    // Also check if already a div placeholder
    const divStart = html.indexOf('<div class="card-img"', cardIdx);
    if (divStart !== -1 && divStart - cardIdx < 200) {
      console.log(`Already placeholder: ${card.slug}`);
      continue;
    }
    console.log(`NOT FOUND img for: ${card.slug}`);
    continue;
  }

  // Find the closing > of the img tag
  const imgEnd = html.indexOf('>', imgStart + 20);
  if (imgEnd === -1) {
    console.log(`Cannot find img end for: ${card.slug}`);
    continue;
  }

  const placeholder = `<div class="card-img" style="height:280px;background:${card.bg};display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:${card.size};font-weight:${card.weight};color:${card.color};letter-spacing:${card.spacing};text-transform:uppercase">${card.label}</span></div>`;

  html = html.substring(0, imgStart) + placeholder + html.substring(imgEnd + 1);
  console.log(`Replaced: ${card.slug} (removed ${(imgEnd + 1 - imgStart)} chars of img tag)`);
}

writeFileSync(htmlPath, html);
console.log(`Done. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
