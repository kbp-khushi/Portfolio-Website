import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// ---------------------------------------------------------------------------
// 1) the models now live with Caesura under graduate work, so drop their
//    duplicate entries from the Additional Work list
// ---------------------------------------------------------------------------
for (const slug of ['massing-model', 'section-model']) {
  const open = `<div class="additional-item" onclick="openProject('${slug}')">`;
  const at = html.indexOf(open);
  if (at === -1) throw new Error(`${slug} list entry not found`);
  const end = html.indexOf('</div>', html.indexOf('additional-sub', at)) + '</div>'.length;
  const close = html.indexOf('</div>', end) + '</div>'.length;
  html = html.slice(0, at) + html.slice(close);
  console.log('[ok] removed', slug, 'from Additional Work');
}

// ---------------------------------------------------------------------------
// 2) the landing thumbnails showed a grey box with alt text on first load,
//    because they had no src until DOMContentLoaded fired on a 39MB document.
//    Move the real image data onto them and let the work index cards, which
//    nobody sees until they navigate, be the ones filled in by script.
// ---------------------------------------------------------------------------
const slugs = ['the-pause', 'woven-edge', 'beacon'];
for (const slug of slugs) {
  const cardOpen = `<div class="project-card" onclick="openProject('${slug}')">`;
  const cardAt = html.indexOf(cardOpen);
  if (cardAt === -1) throw new Error(`${slug} card not found`);
  const imgAt = html.indexOf('<img class="card-img"', cardAt);
  const imgEnd = html.indexOf('>', imgAt) + 1;
  const tag = html.slice(imgAt, imgEnd);
  const srcMatch = tag.match(/src="(data:[^"]+)"/);
  if (!srcMatch) throw new Error(`${slug} card image has no src`);
  const data = srcMatch[1];

  // card keeps its attributes but hands over the payload
  const strippedCard = tag.replace(/ src="data:[^"]+"/, ` data-slug="${slug}"`);
  html = html.slice(0, imgAt) + strippedCard + html.slice(imgEnd);

  // stack image receives it
  const stackRe = new RegExp(`<img class="stack-img" data-slug="${slug}"`);
  if (!stackRe.test(html)) throw new Error(`${slug} stack image not found`);
  html = html.replace(stackRe, `<img class="stack-img" data-slug="${slug}" src="${data}"`);
  console.log('[ok]', slug, 'image moved onto the landing thumbnail');
}

// ---------------------------------------------------------------------------
// 3) the populator now fills anything still missing a src, from the landing
//    thumbnail first and the project page second
// ---------------------------------------------------------------------------
// matched line by line, since the file carries CRLF endings
const jsEdits = [
  ['    if(img.src)return;', "    if(img.getAttribute('src'))return;"],
  ['    let source=document.querySelector(`.project-card[onclick*="\'${slug}\'"] .card-img`);',
   '    let source=document.querySelector(`.stack-img[data-slug="${slug}"][src]`);'],
  ['    // projects that live in a list rather than a card fall back to their page\'s first image',
   '    // the landing thumbnails carry the real data; everything else borrows it']
];
for (const [o, n] of jsEdits) {
  if (html.split(o).length - 1 !== 1) throw new Error(`populator line not unique: ${o.trim().slice(0, 40)}`);
  html = html.replace(o, () => n);
}
console.log('[ok] populator reversed');

// ---------------------------------------------------------------------------
// 4) nothing should render as a grey box with alt text while it waits
// ---------------------------------------------------------------------------
const OLD_CSS = '.stack-img{width:100%;height:380px;object-fit:cover;display:block;background:var(--line)}';
if (html.split(OLD_CSS).length - 1 !== 1) throw new Error('stack-img css not found');
html = html.replace(OLD_CSS, () => '.stack-img{width:100%;height:380px;object-fit:cover;display:block}\nimg[data-slug]:not([src]){opacity:0}');
console.log('[ok] placeholder state hidden');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
