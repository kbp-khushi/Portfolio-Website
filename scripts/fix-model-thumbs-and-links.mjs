import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;
const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// The model photographs are portrait (1600x1861 and 1600x2133). Forcing them
// into a landscape box left them floating in dead space; cropping to landscape
// cut the models. Let the box take the image's own proportion instead, with a
// shared height so the pair lines up.
swap('.model-img{width:100%;height:168px;object-fit:contain;display:block;background:var(--bg);transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     '.model-img{height:170px;width:auto;max-width:100%;object-fit:contain;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     'thumbnails take their own proportion');

swap('.model-stack{display:flex;flex-direction:column;gap:22px;max-width:250px;align-self:start}',
     '.model-stack{display:flex;flex-direction:column;gap:26px;max-width:250px;align-self:start}',
     'stack spacing');

// centre the links under their drawings rather than pinning them right
swap('.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:18px 60px 0;justify-content:flex-end}',
     '.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:20px 60px 0;justify-content:center}',
     'model links centred');

writeFileSync(P, html);
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
