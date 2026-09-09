import { readFileSync, writeFileSync } from 'fs';

// Chasing this with longer timers was the wrong shape. The thing that moves
// the target is an image finishing, so the correction now listens for that
// directly: a capture phase load listener on the page re-measures the moment
// any image inside it resolves. The timer stays only as an outer bound.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const OLD = "var stop=false,until=Date.now()+3200,evs=['wheel','touchstart','keydown','pointerdown'];" +
  "function halt(){stop=true;evs.forEach(function(t){page.removeEventListener(t,halt);});}" +
  "evs.forEach(function(t){page.addEventListener(t,halt,{passive:true});});";

const NEW = "var stop=false,until=Date.now()+6000,evs=['wheel','touchstart','keydown','pointerdown'];" +
  "function nudge(){if(stop)return;var f=measure();if(Math.abs(page.scrollTop-f)>1)page.scrollTop=f;}" +
  "function halt(){stop=true;evs.forEach(function(t){page.removeEventListener(t,halt);});page.removeEventListener('load',nudge,true);}" +
  "evs.forEach(function(t){page.addEventListener(t,halt,{passive:true});});" +
  // an image resolving is what moves the target, so correct exactly then
  "page.addEventListener('load',nudge,true);";

if (html.split(OLD).length - 1 !== 1) throw new Error('settle setup not matched');
html = html.replace(OLD, () => NEW);
console.log('[ok] correction fires on image load, timer is only an outer bound');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
