import { readFileSync, writeFileSync } from 'fs';

// The whole page reading as left leaning on mobile is structural, not
// perceptual. On desktop .exp-item is a 260px/1fr grid, so bullets fill the
// right half and every row spans the full width. On mobile it collapses to a
// single column and the metadata lines hang off the left: the role ends 161px
// short of the right gutter, the year 233px, the degree 160px. Only body text
// reaches the right edge, so the page has a hard left spine and an empty right
// third.
//
// The years move to the right edge of their first line, which is what the
// desktop layout was doing implicitly. Every entry then touches both gutters.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const ANCHOR = '  .exp-item{grid-template-columns:1fr;gap:16px;padding:28px 0}';
const c = html.split(ANCHOR).length - 1;
if (c !== 1) throw new Error(`exp-item mobile rule: ${c} matches`);

const ADD = ANCHOR + '\n' +
  '  /* Without the desktop two column grid, every line here hung off the left\n' +
  '     and the right third of the screen sat empty. The year takes the right\n' +
  '     edge of the first line so each entry spans both gutters. */\n' +
  '  .exp-meta{display:grid;grid-template-columns:1fr auto;column-gap:16px;align-items:baseline}\n' +
  '  .exp-meta>*{grid-column:1}\n' +
  '  .exp-year{grid-column:2;grid-row:1;text-align:right;white-space:nowrap}\n' +
  '  .education-item{display:grid;grid-template-columns:1fr auto;column-gap:16px;align-items:baseline}\n' +
  '  .education-item>*{grid-column:1}\n' +
  '  .edu-year{grid-column:2;grid-row:1;text-align:right;white-space:nowrap}';

html = html.replace(ANCHOR, () => ADD);
console.log('[ok] years anchor the right gutter on mobile');

writeFileSync(P, html);
const n = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| rules added:', n('.exp-year{grid-column:2'), n('.edu-year{grid-column:2'));
