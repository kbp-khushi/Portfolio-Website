// Reverie: two renders side by side at the same height (.rv-pair), each one's width set by its
// aspect ratio so the tops and bottoms line up. Her ask 2026-11-18: the threshold and the dark walk.
// Usage: node reverie-pairs.mjs <first image file> <second image file>
import fs from 'node:fs';

const [, , A, B] = process.argv;
if (!A || !B) throw new Error('usage: reverie-pairs.mjs <img a> <img b>');
const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');

const item = (file) => {
  const re = new RegExp(`<div(?: style="[^"]*")?>(<img width="(\\d+)" height="(\\d+)"[^>]*src="images/${file.replace(/\./g, '\\.')}"[^>]*>)(<div class="img-caption">[^<]*</div>)</div>`);
  const m = html.match(re);
  if (!m) throw new Error('not found: ' + file);
  return { whole: m[0], img: m[1], a: (+m[2] / +m[3]).toFixed(4), cap: m[4] };
};
const a = item(A), b = item(B);
const start = html.indexOf(a.whole), end = html.indexOf(b.whole);
if (start < 0 || end < start) throw new Error('expected ' + A + ' before ' + B);
const between = html.slice(start + a.whole.length, end);
if (between.trim() !== '') throw new Error('the two renders are not next to each other in the markup');
const pair = `<div class="rv-pair"><div style="--a:${a.a}">${a.img}${a.cap}</div><div style="--a:${b.a}">${b.img}${b.cap}</div></div>`;
html = html.slice(0, start) + pair + html.slice(end + b.whole.length);

const CSS = '/* two renders side by side at one height: each flexes by its aspect ratio */\r\n' +
  '.rv-pair{display:flex;gap:20px;width:100%;align-items:flex-start}\r\n' +
  '.rv-pair>div{flex:var(--a) 1 0;min-width:0}\r\n' +
  '.rv-pair img{width:100%;height:auto;display:block}\r\n' +
  '@media(max-width:600px){.rv-pair{flex-direction:column;gap:20px}}\r\n';
if (!html.includes('.rv-pair{display:flex')) {
  const anchor = '/* full bleed render mid page';
  if (!html.includes(anchor)) throw new Error('css anchor missing');
  html = html.replace(anchor, CSS + anchor);
}
fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'pairs', n('class="rv-pair"'));
