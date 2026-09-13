import fs from 'fs';
const f = 'site/index.html';
let s = fs.readFileSync(f, 'utf8');
const nl = s.includes('</title>\r\n') ? '\r\n' : '\n';
const css = [
  '/* LOAD INTRO: runs once on first page load. html.intro is set in <head> and removed when the sequence ends, so returning to home never replays it. */',
  '@keyframes introImg{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}',
  '@keyframes introRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}',
  '@keyframes introName{from{opacity:0;transform:translateY(105%)}to{opacity:1;transform:none}}',
  '@keyframes introFade{from{opacity:0}to{opacity:1}}',
  'html.intro .hero-img{animation:introImg 1.6s cubic-bezier(.22,1,.36,1) both}',
  'html.intro .hero-title{clip-path:inset(-.35em -1em -.3em -1em)}',
  'html.intro .hero-title span{display:inline-block;animation:introName 1s cubic-bezier(.22,1,.36,1) both}',
  'html.intro .hero-eyebrow{animation:introRise .8s cubic-bezier(.22,1,.36,1) .35s both}',
  'html.intro .hero-title .w-light{animation-delay:.5s}',
  'html.intro .hero-title .w-bold{animation-delay:.64s}',
  'html.intro .hero-lede{animation:introRise .9s cubic-bezier(.22,1,.36,1) .95s both}',
  'html.intro .hero-actions{animation:introRise .9s cubic-bezier(.22,1,.36,1) 1.1s both}',
  'html.intro .hero-credit{animation:introFade 1s ease 1.35s both}',
].join(nl) + nl;
const js = '<script>(function(){try{if(matchMedia(\'(prefers-reduced-motion: reduce)\').matches)return;var h=document.documentElement;h.classList.add(\'intro\');setTimeout(function(){h.classList.remove(\'intro\');},2600);}catch(e){}})();</script>' + nl;
const edits = [
  ['</style>' + nl + '<!-- v', css + '</style>' + nl + '<!-- v'],
  ['</title>' + nl, '</title>' + nl + js],
];
for (const [a, b] of edits) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, got ${n}: ${JSON.stringify(a)}`);
  s = s.replace(a, b);
}
if (!s.trimEnd().endsWith('</html>')) throw new Error('file truncated');
fs.writeFileSync(f, s);
console.log('ok');
