import { readFileSync, writeFileSync } from 'fs';

// Recomputing the target during the scroll fixed most of the drift, but
// sections far down the page still landed about 20px high: the images around
// the landing point only begin loading once you arrive, and they finished
// after the single 320ms correction.
//
// The correction becomes a short window instead, rechecking every 150ms for
// 1.6s. It gives up immediately if the scroll position is not where it left
// it, so it never fights the reader.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = "var fix=measure();if(Math.abs(page.scrollTop-fix)>1)page.scrollTop=fix;" +
  "setTimeout(function(){var f2=measure();if(Math.abs(page.scrollTop-f2)>2)page.scrollTop=f2;},320);}";

const NEW = "var fix=measure();if(Math.abs(page.scrollTop-fix)>1)page.scrollTop=fix;" +
  "var lastSet=page.scrollTop,until=Date.now()+1600;" +
  "(function settle(){" +
  "if(Date.now()>until)return;" +
  "if(Math.abs(page.scrollTop-lastSet)>2)return;" +   // reader took over, stop
  "var f=measure();" +
  "if(Math.abs(page.scrollTop-f)>2){page.scrollTop=f;lastSet=page.scrollTop;}" +
  "setTimeout(settle,150);})();}";

if (html.split(OLD).length - 1 !== 1) throw new Error('weNav tail not matched');
html = html.replace(OLD, () => NEW);
console.log('[ok] weNav settles over a 1.6s window and yields to the reader');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
