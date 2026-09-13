import fs from 'fs';
const f = 'site/index.html';
let s = fs.readFileSync(f, 'utf8');
const swaps = [
  ["water lily painting, taken at the Met\">", "water lily painting, taken at MoMA\">"],
  ["photographed by me at the Met</p>", "photographed by me at MoMA</p>"],
];
for (const [a, b] of swaps) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, got ${n}: ${a}`);
  s = s.replace(a, b);
}
if (!s.trimEnd().endsWith('</html>')) throw new Error('file truncated');
fs.writeFileSync(f, s);
console.log('ok');
