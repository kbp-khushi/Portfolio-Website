import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// the working copy has CRLF endings, so match line breaks tolerantly
const NL = '(?:\\r\\n|\\n)';
const linkFor = (slug, word) =>
  `<div class="model-links"><a onclick="closeProject();setTimeout(function(){openProject('${slug}');},80)">View the ${word} model</a></div>`;

// 1) remove the combined pair
const combined = new RegExp(
  `${NL}\\s*<div class="model-links">${NL}\\s*<a onclick="closeProject\\(\\);setTimeout\\(function\\(\\)\\{openProject\\('massing-model'\\);\\},80\\)">View the massing model</a>${NL}\\s*<a onclick="closeProject\\(\\);setTimeout\\(function\\(\\)\\{openProject\\('section-model'\\);\\},80\\)">View the section model</a>${NL}\\s*</div>`
);
const hits = html.match(new RegExp(combined.source, 'g'));
if (!hits || hits.length !== 1) throw new Error(`combined block matches: ${hits ? hits.length : 0}`);
html = html.replace(combined, '');
console.log('[ok] combined links removed');

// 2) massing link under the massing strip — anchored to the markup, not the
//    stylesheet rule that shares the name
const styleEnd = html.indexOf('</style>');
const massingAt = html.indexOf('class="pause-massing"', styleEnd);
if (massingAt === -1) throw new Error('massing markup not found');
const massingClose = html.search(new RegExp(`${NL}  </div>`, 'g')) === -1 ? -1 : (() => {
  const re = new RegExp(`${NL}  </div>`, 'g');
  re.lastIndex = massingAt;
  const m = re.exec(html);
  return m ? m.index : -1;
})();
if (massingClose === -1) throw new Error('massing block close not found');
html = html.slice(0, massingClose) + '\r\n    ' + linkFor('massing-model', 'massing') + html.slice(massingClose);
console.log('[ok] massing link placed under the massing studies');

// 3) section link under the building section
const SECTION_TAIL = '" alt="Building Section"><div class="dg-label-b">Building Section</div>';
if (html.split(SECTION_TAIL).length - 1 !== 1) throw new Error('building section tail not unique');
html = html.replace(SECTION_TAIL, () => SECTION_TAIL + linkFor('section-model', 'section'));
console.log('[ok] section link placed under the building section');

// 4) each link now sits alone under its drawing
const OLD_CSS = '.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:24px 60px 0}';
if (html.split(OLD_CSS).length - 1 !== 1) throw new Error('model links css not found');
html = html.replace(OLD_CSS, () => '.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:18px 60px 0;justify-content:flex-end}');
console.log('[ok] link alignment');

writeFileSync(P, html);
const count = s => (html.split(s).length - 1);
console.log('bytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'), '| popups:', count('boards-popup'), count('flipbook-popup'));
console.log('contact button intact:', html.includes('},80);return false;">contact me</a>'));
console.log('model-links blocks:', count('<div class="model-links">'));
