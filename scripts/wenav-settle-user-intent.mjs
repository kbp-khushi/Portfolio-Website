import { readFileSync, writeFileSync } from 'fs';

// The settle window was giving up too early. Its guard asked "has scrollTop
// moved since I set it", which is true whenever the browser's own scroll
// anchoring nudges the position as images load, exactly the situation the
// settle exists to handle. So it aborted on the first nudge and left the
// section 20px high, every time, on every deep link.
//
// Confirmed the target itself is fine: setting scrollTop to the measured value
// by hand lands exactly and stays there.
//
// The guard now watches for real input instead, so anchoring no longer looks
// like the reader, and a genuine scroll or keypress still stops it at once.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = "var fix=measure();if(Math.abs(page.scrollTop-fix)>1)page.scrollTop=fix;" +
  "var lastSet=page.scrollTop,until=Date.now()+1600;" +
  "(function settle(){" +
  "if(Date.now()>until)return;" +
  "if(Math.abs(page.scrollTop-lastSet)>2)return;" +
  "var f=measure();" +
  "if(Math.abs(page.scrollTop-f)>2){page.scrollTop=f;lastSet=page.scrollTop;}" +
  "setTimeout(settle,150);})();}";

const NEW = "var fix=measure();if(Math.abs(page.scrollTop-fix)>1)page.scrollTop=fix;" +
  "var stop=false,until=Date.now()+1600,evs=['wheel','touchstart','keydown','pointerdown'];" +
  "function halt(){stop=true;evs.forEach(function(t){page.removeEventListener(t,halt);});}" +
  "evs.forEach(function(t){page.addEventListener(t,halt,{passive:true});});" +
  "(function settle(){" +
  "if(stop||Date.now()>until){halt();return;}" +
  "var f=measure();" +
  "if(Math.abs(page.scrollTop-f)>1)page.scrollTop=f;" +
  "setTimeout(settle,120);})();}";

if (html.split(OLD).length - 1 !== 1) throw new Error('weNav settle tail not matched');
html = html.replace(OLD, () => NEW);
console.log('[ok] settle now cancels on real input, not on scroll anchoring');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
