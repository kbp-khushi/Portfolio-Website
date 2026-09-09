import { readFileSync, writeFileSync } from 'fs';

// Reloading put you back at your previous scroll offset, which on the landing
// page reads as being dumped at the bottom. That is history.scrollRestoration
// at its default of "auto".
//
// It is wrong for this site specifically: Home, Work and About are navigated
// between rather than scrolled through, and a project page is a fixed overlay
// that scrolls inside itself. A restored window offset never corresponds to
// anything the visitor was actually looking at.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const ANCHOR = "window.addEventListener('popstate',function(e){";
const c = html.split(ANCHOR).length - 1;
if (c !== 1) throw new Error(`popstate anchor: ${c} matches`);

const ADD =
  "// A reload should open the page at the top. The browser's default is to\n" +
  "// restore the previous offset, which here means landing at the bottom of\n" +
  "// whichever view you were on.\n" +
  "if('scrollRestoration' in history){history.scrollRestoration='manual';}\n" +
  "window.addEventListener('load',function(){window.scrollTo(0,0);});\n";

html = html.replace(ANCHOR, () => ADD + ANCHOR);
console.log('[ok] scroll restoration set to manual, load starts at the top');

writeFileSync(P, html);
const n = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| scrollRestoration:', n('scrollRestoration'),
  '| popstate handlers:', n(ANCHOR));
