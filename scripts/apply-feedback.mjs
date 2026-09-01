import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
let html = readFileSync(htmlPath, 'utf-8');

// 1. Remove "Beyond Architecture" heading and section-divider
const oldHeading = `  <div class="section-label">Additional Work</div>
  <h2 class="section-title">Beyond Architecture</h2>
  <div class="section-divider"></div>`;
const newHeading = `  <div class="section-label">Additional Work</div>`;
if (html.includes(oldHeading)) {
  html = html.replace(oldHeading, newHeading);
  console.log('Removed "Beyond Architecture" heading');
} else {
  console.log('WARNING: Could not find "Beyond Architecture" heading');
}

// 2. Remove thumbnail images from the 4 additional work cards
// Replace <img class="card-img" ...> with a simple placeholder div for each card
const cardProjects = [
  { onclick: "openProject('virtuous-book')", label: 'VIRTUOUS BOOK', bg: '#2A2A2A' },
  { onclick: "openProject('beaufort-cookbook')", label: 'FROM ELSEWHERE', bg: '#8B7355' },
  { onclick: "openProject('massing-model')", label: 'MASSING MODEL', bg: 'var(--bg)' },
  { onclick: "openProject('section-model')", label: 'SECTION MODEL', bg: 'var(--bg)' },
];

for (const card of cardProjects) {
  // Find the img tag after the onclick
  const onclickIdx = html.indexOf(card.onclick);
  if (onclickIdx === -1) {
    console.log(`WARNING: Could not find card for ${card.label}`);
    continue;
  }
  // Find the img tag starting from onclick position
  const afterOnclick = html.substring(onclickIdx);
  const imgMatch = afterOnclick.match(/<img class="card-img"[^>]*>/);
  if (imgMatch) {
    const imgStart = onclickIdx + afterOnclick.indexOf(imgMatch[0]);
    const accentColor = card.bg === 'var(--bg)' ? 'var(--accent)' : '#FFF';
    const fontSize = card.label.length > 12 ? '14px' : '20px';
    const placeholder = `<div class="card-img" style="height:280px;background:${card.bg};display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:${fontSize};font-weight:600;color:${accentColor};letter-spacing:3px;text-transform:uppercase">${card.label}</span></div>`;
    html = html.substring(0, imgStart) + placeholder + html.substring(imgStart + imgMatch[0].length);
    console.log(`Replaced thumbnail for ${card.label}`);
  } else {
    console.log(`WARNING: No img found for ${card.label}`);
  }
}

writeFileSync(htmlPath, html);
console.log(`Done. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
