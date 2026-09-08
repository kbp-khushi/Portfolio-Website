import { readFileSync, writeFileSync } from 'fs';

// Two changes:
//
// 1) Beacon moves its View Project button back down under the write-up,
//    centred, but keeps the button format rather than the old text link. The
//    site analysis link then sits directly beneath it, centred too, with real
//    space before the rule that divides off the previous/next nav.
//
// 2) The remaining additional-work pages still triggered their flipbooks from
//    a .dl-link text link. They stay exactly where they are in the flow, but
//    get the same button treatment as everything else.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${inner}</svg>`;
const GRID = svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>');
const BOOK = svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>');
const CAMERA = svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>');
const SHEET = svg('<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8"/><path d="M8 17h5"/>');

const swap = (oldStr, newStr, label) => {
  const hits = html.split(oldStr).length - 1;
  if (hits !== 1) throw new Error(`${label}: ${hits} matches`);
  html = html.replace(oldStr, () => newStr);
  console.log('[ok]', label);
};

// ---------------------------------------------------------------------------
// 1) Beacon: undo the top-right aside, put the button under the description
// ---------------------------------------------------------------------------
swap(
  '<div class="pp-header" style="position:relative;max-width:none">\r\n' +
  `    <div class="pp-aside"><a class="we-boards-btn" style="position:static" onclick="openFlipbook('beacon')">${GRID}View Project</a></div>\r\n` +
  '    <div style="max-width:900px"><h2 class="pp-title">Beacon</h2>',
  '<div class="pp-header"><h2 class="pp-title">Beacon</h2>',
  'Beacon header returns to plain, aside removed');

// the wrapper that closed the max-width div goes with it
swap('    </div>\r\n    </div>\r\n  </div>\r\n  <div class="pp-description">A police station',
     '    </div>\r\n  </div>\r\n  <div class="pp-description">A police station',
     'Beacon wrapper close removed');

// the site analysis link currently sits above the hidden boards div; it needs
// to end up below the new button, so lift it out first
const SA_LINK = '  <div class="model-links"><a onclick="closeProject();setTimeout(function(){openProject(\'site-analysis\');},80)">View the site analysis that chose this program</a></div>\r\n';
swap(SA_LINK, '', 'site analysis link lifted from above the boards');

// then place button + link together, after the hidden boards div
swap('  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">\r\n' +
     '    <a onclick="closeProject();setTimeout(function(){openProject(\'woven-edge\');},100)"',
     '  <div style="padding:8px 60px 0;text-align:center">\r\n' +
     `    <a class="we-boards-btn" style="position:static" onclick="openFlipbook('beacon')">${GRID}View Project</a>\r\n` +
     '  </div>\r\n' +
     '  <div class="model-links" style="justify-content:center;padding:18px 60px 60px"><a onclick="closeProject();setTimeout(function(){openProject(\'site-analysis\');},80)">View the site analysis that chose this program</a></div>\r\n' +
     '  <div class="project-nav" style="display:flex;justify-content:space-between;padding:40px 60px 0">\r\n' +
     '    <a onclick="closeProject();setTimeout(function(){openProject(\'woven-edge\');},100)"',
     'Beacon button centred under the text, site analysis link beneath it');

// ---------------------------------------------------------------------------
// 2) the remaining additional-work text links become buttons in place
// ---------------------------------------------------------------------------
const CONVERT = [
  ['massing-model-process', 'View Process Photos', CAMERA],
  ['section-model-process', 'View Process Photos', CAMERA],
  ['virtuous-book', 'View Book', BOOK],
  ['beaufort-cookbook', 'View Cookbook', BOOK],
  ['site-analysis-research', 'View Research', SHEET],
];

for (const [id, label, icon] of CONVERT) {
  swap(`<a class="dl-link" onclick="openFlipbook('${id}')" style="cursor:pointer">${label}</a>`,
       `<a class="we-boards-btn" style="position:static" onclick="openFlipbook('${id}')">${icon}${label}</a>`,
       `${id} -> button`);
}

writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| inline data URIs:', c('data:image/'));
console.log('we-boards-btn buttons:', c('class="we-boards-btn"'));
console.log('dl-link flipbook triggers left:', c('class="dl-link" onclick="openFlipbook'));
console.log('Beacon asides left:', c(`<div class="pp-aside"><a class="we-boards-btn" style="position:static" onclick="openFlipbook('beacon')`));
console.log('site analysis links:', c('View the site analysis that chose this program'));
