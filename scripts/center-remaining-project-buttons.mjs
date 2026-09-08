import { readFileSync, writeFileSync } from 'fs';

// Fluke, Dreamscape, Laker and Drodel follow Beacon: the View Project button
// leaves the top-right aside and sits centred under the write-up, keeping the
// button treatment. Same spacing as Beacon, so the four read identically.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>' +
  '<rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';

const PAGES = [
  ['fluke', 'Fluke'],
  ['dreamscape', 'Dreamscape'],
  ['laker', 'Lak&euml;r'],
  ['drodel', 'Drodel'],
];

for (const [slug, title] of PAGES) {
  const start = html.indexOf(`id="page-${slug}"`);
  if (start === -1) throw new Error(`${slug}: page not found`);
  let end = html.indexOf('<div class="project-page"', start + 10);
  if (end === -1) end = html.length;
  let seg = html.slice(start, end);

  const swap = (oldStr, newStr, label) => {
    const hits = seg.split(oldStr).length - 1;
    if (hits !== 1) throw new Error(`${slug}/${label}: ${hits} matches`);
    seg = seg.replace(oldStr, () => newStr);
  };

  // 1) header goes back to plain, aside and its button removed
  swap('<div class="pp-header" style="position:relative;max-width:none">\r\n' +
    `    <div class="pp-aside"><a class="we-boards-btn" style="position:static" onclick="openFlipbook('${slug}')">${GRID}View Project</a></div>\r\n` +
    `    <div style="max-width:900px"><h2 class="pp-title">${title}</h2>`,
    `<div class="pp-header"><h2 class="pp-title">${title}</h2>`,
    'aside removed');

  // 2) drop the max-width wrapper close that went with it
  swap('    </div>\r\n    </div>\r\n  </div>\r\n  <div class="pp-description">',
    '    </div>\r\n  </div>\r\n  <div class="pp-description">',
    'wrapper close removed');

  // 3) centred button before the nav, with Beacon's 60px clear of the rule
  swap('  <div class="project-nav"',
    '  <div style="padding:8px 60px 60px;text-align:center">\r\n' +
    `    <a class="we-boards-btn" style="position:static" onclick="openFlipbook('${slug}')">${GRID}View Project</a>\r\n` +
    '  </div>\r\n' +
    '  <div class="project-nav"',
    'button centred under the write-up');

  html = html.slice(0, start) + seg + html.slice(end);
  console.log('[ok]', slug);
}

writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| inline data URIs:', c('data:image/'));
console.log('we-boards-btn buttons:', c('class="we-boards-btn"'));
console.log('asides left (Caesura only expected):', c('<div class="pp-aside">'));
console.log('dl-link flipbook triggers:', c('class="dl-link" onclick="openFlipbook'));
