import fs from 'fs';
const f = 'site/index.html';
let s = fs.readFileSync(f, 'utf8');
const edits = [
  ['html.intro .hero-eyebrow{animation:introRise .8s cubic-bezier(.22,1,.36,1) .35s both}', 'html.intro .hero-eyebrow{animation:introRise .8s cubic-bezier(.22,1,.36,1) .05s both}'],
  ['html.intro .hero-title .w-light{animation-delay:.5s}', 'html.intro .hero-title .w-light{animation-delay:.15s}'],
  ['html.intro .hero-title .w-bold{animation-delay:.64s}', 'html.intro .hero-title .w-bold{animation-delay:.29s}'],
  ['html.intro .hero-lede{animation:introRise .9s cubic-bezier(.22,1,.36,1) .95s both}', 'html.intro .hero-lede{animation:introRise .9s cubic-bezier(.22,1,.36,1) .6s both}'],
  ['html.intro .hero-actions{animation:introRise .9s cubic-bezier(.22,1,.36,1) 1.1s both}', 'html.intro .hero-actions{animation:introRise .9s cubic-bezier(.22,1,.36,1) .75s both}'],
  ['html.intro .hero-credit{animation:introFade 1s ease 1.35s both}', 'html.intro .hero-credit{animation:introFade 1s ease 1s both}'],
  ["h.classList.remove('intro');},2600);", "h.classList.remove('intro');},2300);"],
];
for (const [a, b] of edits) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, got ${n}: ${a}`);
  s = s.replace(a, b);
}
if (!s.trimEnd().endsWith('</html>')) throw new Error('file truncated');
fs.writeFileSync(f, s);
console.log('ok');
