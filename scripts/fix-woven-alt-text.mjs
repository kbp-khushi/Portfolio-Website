import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// Every unlabelled image on Woven Edge already has a visible caption directly
// after it. Use that caption as the alt text rather than inventing one.
let filled = 0, skipped = 0;
let guard = 0;
while (guard++ < 40) {
  const at = html.indexOf('alt=""');
  if (at === -1) break;
  const after = html.slice(at, at + 420);
  const caption = after.match(/margin-top:8px">([^<]{2,80})</);
  if (!caption) { skipped++; break; }
  const text = caption[1].trim();
  html = html.slice(0, at) + `alt="${text}"` + html.slice(at + 'alt=""'.length);
  console.log('[ok]', text);
  filled++;
}

console.log('filled:', filled, '| remaining empty alt:', (html.match(/alt=""/g) || []).length);
writeFileSync(P, html);
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
