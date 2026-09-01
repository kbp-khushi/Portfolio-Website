import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'C:/KHUSHI/Claude/Portfolio-Website/index.html';
const thumbDir = 'C:/KHUSHI/Claude/Portfolio-Website/base64/thumbnails';

let html = readFileSync(htmlPath, 'utf-8');

const replacements = [
  {
    old: `onclick="openProject('virtuous-book')">
      <div class="card-img" style="height:280px;background:#2A2A2A;display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:24px;font-weight:700;color:#FFF;letter-spacing:2px">VIRTUOUS BOOK</span></div>`,
    thumbFile: 'virtuous-book.txt',
    alt: 'Virtuous Book'
  },
  {
    old: `onclick="openProject('beaufort-cookbook')">
      <div class="card-img" style="height:280px;background:#8B7355;display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:20px;font-weight:300;color:#FFF;letter-spacing:4px;text-transform:uppercase">From Elsewhere</span></div>`,
    thumbFile: 'cookbook.txt',
    alt: 'From Elsewhere Cookbook'
  },
  {
    old: `onclick="openProject('massing-model')">
      <div class="card-img" style="height:280px;background:var(--bg);display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:14px;font-weight:600;color:var(--accent);letter-spacing:3px;text-transform:uppercase">Massing Model</span></div>`,
    thumbFile: 'massing-model.txt',
    alt: 'Massing Model'
  },
  {
    old: `onclick="openProject('section-model')">
      <div class="card-img" style="height:280px;background:var(--bg);display:flex;align-items:center;justify-content:center"><span style="font-family:var(--title);font-size:14px;font-weight:600;color:var(--accent);letter-spacing:3px;text-transform:uppercase">Section Model</span></div>`,
    thumbFile: 'section-model.txt',
    alt: 'Section Model'
  }
];

for (const r of replacements) {
  const thumb = readFileSync(`${thumbDir}/${r.thumbFile}`, 'utf-8').trim();
  const newStr = r.old.split('\n')[0] + `\n      <img class="card-img" loading="lazy" src="${thumb}" alt="${r.alt}" style="background:none !important">`;
  if (html.includes(r.old)) {
    html = html.replace(r.old, newStr);
    console.log(`Replaced: ${r.alt}`);
  } else {
    console.log(`NOT FOUND: ${r.alt}`);
  }
}

writeFileSync(htmlPath, html);
console.log(`Done. File size: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
