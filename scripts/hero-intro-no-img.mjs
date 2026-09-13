import fs from 'fs';
const f = 'site/index.html';
let s = fs.readFileSync(f, 'utf8');
const nl = s.includes('</title>\r\n') ? '\r\n' : '\n';
const lines = [
  '@keyframes introImg{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}' + nl,
  'html.intro .hero-img{animation:introImg 1.6s cubic-bezier(.22,1,.36,1) both}' + nl,
];
for (const a of lines) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, got ${n}: ${JSON.stringify(a)}`);
  s = s.replace(a, '');
}
if (!s.trimEnd().endsWith('</html>')) throw new Error('file truncated');
fs.writeFileSync(f, s);
console.log('ok');
