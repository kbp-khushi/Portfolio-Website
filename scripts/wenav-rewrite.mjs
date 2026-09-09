import { readFileSync, writeFileSync } from 'fs';

// weNav had grown by patching a single dense line, and the last patch left a
// real bug: every jump registered listeners that were only removed on user
// input, so an earlier jump's correction could pull the page back to its old
// target when an image loaded. Clicking two categories in a row would do it.
//
// Rewritten whole. It does four things, each for a reason found by testing:
//   - measures the target every frame, because lazy images above it resolve
//     mid scroll and move it
//   - corrects again the moment any image inside the page loads, which is the
//     actual event that moves the target
//   - keeps correcting for a short window afterwards, as an outer bound
//   - a new jump, or any real input, cancels the previous one completely

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// find the whole existing function by brace matching, since its body has
// changed several times today
const start = html.indexOf('function weNav(id){');
if (start === -1) throw new Error('weNav not found');
let i = html.indexOf('{', start), depth = 0, end = -1;
for (; i < html.length; i++) {
  if (html[i] === '{') depth++;
  else if (html[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end === -1) throw new Error('could not brace match weNav');
console.log(`[ok] found weNav, ${end - start} chars`);

const NEW = [
  'function weNav(id){',
  'var el=document.getElementById(id);if(!el)return;',
  'var page=el.closest(".project-page");if(!page)return;',
  'var head=el.classList.contains("ds-title")?el:(el.querySelector(".ds-title,.stack-title")||el);',
  'var token=(window.__weNav=(window.__weNav||0)+1);',
  'function mine(){return token===window.__weNav;}',
  'function measure(){var t=0,n=head;while(n&&n!==page){t+=n.offsetTop;n=n.offsetParent;}return Math.max(0,t-80);}',
  'var evs=["wheel","touchstart","keydown","pointerdown"];',
  'function cleanup(){evs.forEach(function(t){page.removeEventListener(t,onUser);});page.removeEventListener("load",onLoad,true);}',
  'function onUser(){window.__weNav++;cleanup();}',
  'function snap(){var f=measure();if(Math.abs(page.scrollTop-f)>1)page.scrollTop=f;}',
  'function onLoad(){if(!mine()){cleanup();return;}snap();}',
  'evs.forEach(function(t){page.addEventListener(t,onUser,{passive:true});});',
  'page.addEventListener("load",onLoad,true);',
  'var startTop=page.scrollTop,i=0,steps=50;',
  '(function tick(){',
  'if(!mine()){cleanup();return;}',
  'i++;var p=i/steps,e=1-Math.pow(1-p,3);',
  'page.scrollTop=startTop+(measure()-startTop)*e;',
  'if(i<steps){setTimeout(tick,14);return;}',
  'snap();',
  'var until=Date.now()+4000;',
  '(function settle(){',
  'if(!mine()||Date.now()>until){cleanup();return;}',
  'snap();setTimeout(settle,120);',
  '})();})();}',
].join('');

html = html.slice(0, start) + NEW + html.slice(end);
writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('[ok] weNav rewritten');
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| weNav defs:', c('function weNav(id){'));
