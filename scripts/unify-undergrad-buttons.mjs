import { readFileSync, writeFileSync } from 'fs';

// The five undergraduate project pages opened their boards from a small
// centred "View Project" text link at the very bottom of the page, while
// Caesura and The Woven Edge use a bordered button with an icon at the top
// right. Same action, two different levels of emphasis. This gives the
// undergraduate pages the Caesura treatment: same .pp-aside slot, same
// .we-boards-btn, same icon, and drops the bottom link.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// the same four-square icon Caesura's "View Final Boards" button carries
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>' +
  '<rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';

const SLUGS = ['beacon', 'fluke', 'dreamscape', 'laker', 'drodel'];

for (const slug of SLUGS) {
  // work inside this page only, so a match can never wander into a neighbour
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

  // 1) header becomes the positioning context, and gains the aside + button
  swap('<div class="pp-header"><h2 class="pp-title">',
    '<div class="pp-header" style="position:relative;max-width:none">\r\n' +
    `    <div class="pp-aside"><a class="we-boards-btn" style="position:static" onclick="openFlipbook('${slug}')">${ICON}View Project</a></div>\r\n` +
    '    <div style="max-width:900px"><h2 class="pp-title">',
    'header + aside button');

  // 2) close the max-width wrapper before the header closes
  swap('    </div>\r\n  </div>\r\n  <div class="pp-description">',
    '    </div>\r\n    </div>\r\n  </div>\r\n  <div class="pp-description">',
    'wrapper close');

  // 3) the bottom text link is now redundant
  swap('  <div style="padding:20px 60px;text-align:center">\r\n' +
    `    <a class="dl-link" onclick="openFlipbook('${slug}')" style="cursor:pointer">View Project</a>\r\n` +
    '  </div>\r\n',
    '', 'bottom text link removed');

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
console.log('remaining bottom View Project links:', c('style="cursor:pointer">View Project</a>'));
