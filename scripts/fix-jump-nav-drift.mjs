import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

// The category buttons under Caesura and Woven Edge landed in the wrong place
// until you had clicked them a few times. Two causes, compounding:
//
// 1. No image on the site carries width/height attributes, so a lazy image
//    occupies zero height until it loads. Making 76 overlay images lazy this
//    morning turned that latent fragility into a visible bug: images above the
//    target load mid scroll, expand, and push the target away.
// 2. weNav measured the target once and then animated to that number for
//    700ms, so any shift during the animation was baked in.
//
// Fix 1 reserves the right box before load. Fix 2 makes the animation
// self correcting, and settles once more after it finishes.

sharp.cache(false);

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = `${ROOT}/site/index.html`;
let html = readFileSync(P, 'utf8');
const before = html.length;

// ---------------------------------------------------------------------------
// 1) intrinsic dimensions on every img that has a real src
// ---------------------------------------------------------------------------
const dims = new Map();
const IMG = /<img\b[^>]*>/g;
const tags = html.match(IMG) || [];
const needed = new Set();
for (const t of tags) {
  const m = t.match(/src="images\/([^"]+)"/);
  if (m && !/\bwidth=/.test(t)) needed.add(m[1]);
}
for (const name of needed) {
  try {
    const meta = await sharp(`${ROOT}/site/images/${name}`).metadata();
    dims.set(name, [meta.width, meta.height]);
  } catch (e) {
    console.log('[skip] could not read', name, e.message);
  }
}
console.log(`[ok] measured ${dims.size} of ${needed.size} referenced images`);

let added = 0;
html = html.replace(IMG, (tag) => {
  if (/\bwidth=/.test(tag)) return tag;
  const m = tag.match(/src="images\/([^"]+)"/);
  if (!m || !dims.has(m[1])) return tag;
  const [w, h] = dims.get(m[1]);
  added += 1;
  return tag.replace('<img', `<img width="${w}" height="${h}"`);
});
console.log(`[ok] width/height added to ${added} images`);

// ---------------------------------------------------------------------------
// 2) weNav recomputes its target while it scrolls
// ---------------------------------------------------------------------------
const OLD = "function weNav(id){var el=document.getElementById(id);if(!el)return;var page=el.closest('.project-page');if(!page)return;var head=el.classList.contains('ds-title')?el:(el.querySelector('.ds-title,.stack-title')||el);var top=0,n=head;while(n&&n!==page){top+=n.offsetTop;n=n.offsetParent;}var target=Math.max(0,top-80),start=page.scrollTop,dist=target-start,i=0,steps=50;function tick(){i++;var p=i/steps;var e=1-Math.pow(1-p,3);page.scrollTop=start+dist*e;if(i<steps)setTimeout(tick,14);}tick();}";

const NEW = "function weNav(id){var el=document.getElementById(id);if(!el)return;var page=el.closest('.project-page');if(!page)return;" +
  "var head=el.classList.contains('ds-title')?el:(el.querySelector('.ds-title,.stack-title')||el);" +
  // measured fresh every frame: images above the target can still be loading
  "function measure(){var top=0,n=head;while(n&&n!==page){top+=n.offsetTop;n=n.offsetParent;}return Math.max(0,top-80);}" +
  "var start=page.scrollTop,i=0,steps=50;" +
  "function tick(){i++;var p=i/steps;var e=1-Math.pow(1-p,3);var target=measure();page.scrollTop=start+(target-start)*e;" +
  "if(i<steps){setTimeout(tick,14);return;}" +
  // land exactly, then correct once more in case an image resolved on the way
  "var fix=measure();if(Math.abs(page.scrollTop-fix)>1)page.scrollTop=fix;" +
  "setTimeout(function(){var f2=measure();if(Math.abs(page.scrollTop-f2)>2)page.scrollTop=f2;},320);}" +
  "tick();}";

if (html.split(OLD).length - 1 !== 1) throw new Error('weNav not matched');
html = html.replace(OLD, () => NEW);
console.log('[ok] weNav recomputes its target and settles afterwards');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| imgs with width:', (html.match(/<img[^>]*\bwidth=/g) || []).length);
