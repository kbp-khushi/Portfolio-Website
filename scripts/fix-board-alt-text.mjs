import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// The five undergraduate projects keep their boards in a hidden flipbook
// container, and every one of those images shipped with alt="". That makes
// those projects invisible to a screen reader. Number them instead.
const TITLES = {
  beacon: 'Beacon',
  fluke: 'Fluke',
  dreamscape: 'Dreamscape',
  laker: 'Lak\u00ebr',
  drodel: 'Drodel',
  'virtuous-book': 'Virtuous Book',
  'beaufort-cookbook': 'From Elsewhere'
};

let fixed = 0;
for (const [slug, title] of Object.entries(TITLES)) {
  const open = `<div id="boards-${slug}"`;
  const at = html.indexOf(open);
  if (at === -1) continue;
  const end = html.indexOf('</div>', html.lastIndexOf('>', html.indexOf('<div', at + open.length)) === -1 ? at : at);
  // work within this container only: from its opening tag to its closing div
  const closeAt = html.indexOf('\n  </div>', at);
  const stop = closeAt === -1 ? html.indexOf('</div>', at) : closeAt;
  let segment = html.slice(at, stop);
  const total = (segment.match(/alt=""/g) || []).length;
  if (!total) continue;
  let n = 0;
  segment = segment.replace(/alt=""/g, () => {
    n += 1;
    return `alt="${title}, board ${n} of ${total}"`;
  });
  html = html.slice(0, at) + segment + html.slice(stop);
  fixed += total;
  console.log(`[ok] ${title}: ${total} boards described`);
}

console.log('total alt attributes filled:', fixed);
const remaining = (html.match(/alt=""/g) || []).length;
console.log('empty alt attributes remaining:', remaining);

writeFileSync(P, html);
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
