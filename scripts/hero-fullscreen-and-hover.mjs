import { readFileSync, writeFileSync } from 'fs';

// 1. The hero buttons were unreadable on hover. A rule left over from the old
//    white hero sits later in the stylesheet and won on source order:
//    color:var(--text) is black, over a barely tinted overlay, on a dark
//    painting. It now fills white with black text.
// 2. The painting fills the viewport on both desktop and phone, so the work
//    starts below the fold instead of the hero being a band of odd proportion.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// the stale hover, rewritten rather than removed so one rule owns the state
swap('.hero-btn:hover{border-color:var(--accent);color:var(--text);background:rgba(0,0,0,0.05);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}',
     '.hero-btn:hover{background:#fff;color:#000;border-color:#fff;transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.28)}',
     'hover fills white with black text');

// drop the now duplicate rule I added earlier, with whatever newline follows
{
  const dup = '.hero-btn:hover{background:#fff;color:#000;border-color:#fff}';
  const count = html.split(dup).length - 1;
  if (count !== 1) throw new Error(`duplicate hover rule: ${count} matches`);
  const at = html.indexOf(dup);
  let end = at + dup.length;
  if (html[end] === '\r') end += 1;
  if (html[end] === '\n') end += 1;
  html = html.slice(0, at) + html.slice(end);
  console.log('[ok] duplicate hover rule removed');
}

// full viewport on desktop. svh follows vh so browsers that know it use it.
swap('.hero-canvas{position:relative;width:100%;height:clamp(520px,76vh,820px);overflow:hidden}',
     '.hero-canvas{position:relative;width:100%;height:100vh;height:100svh;overflow:hidden}',
     'desktop canvas fills the viewport');

// same on the phone, where svh matters: it is the height with browser chrome
// showing, so the hero never overflows on load
swap('.hero-canvas{height:clamp(430px,64vh,580px)}',
     '.hero-canvas{height:100vh;height:100svh}',
     'mobile canvas fills the viewport');

// the fixed bottom tab bar is 51px, so the hero text has to sit above it
swap('.hero-inner{padding:0 24px 30px}',
     '.hero-inner{padding:0 24px 88px}',
     'mobile hero text clears the bottom tab bar');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| hover rules:', c('.hero-btn:hover'),
  '| img tags:', c('<img'));
