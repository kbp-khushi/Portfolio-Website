import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

// 1. Link previews were showing the Caesura approach render. They should show
//    the pavilion render, which is the image the landing page already leads
//    with for Caesura. Written to a new filename because messaging apps cache
//    og images hard and would otherwise keep serving the old one.
// 2. "view all work" becomes a real button, matching every other call to
//    action on the site.

sharp.cache(false);

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = `${ROOT}/site/index.html`;

// ---------------------------------------------------------------------------
// 1) the preview image
// ---------------------------------------------------------------------------
const SRC = `${ROOT}/site/images/002-image.jpg`;
const OUT = `${ROOT}/site/og-image-pavilion.jpg`;

const meta = await sharp(SRC).metadata();
// 1200x630 is what link previews crop to
const buf = await sharp(SRC)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
  .jpeg({ quality: 84 })
  .toBuffer();
writeFileSync(OUT, buf);
console.log(`[ok] og image from the pavilion render: ${meta.width}x${meta.height} -> 1200x630, ${(buf.length / 1024).toFixed(0)}KB`);

// ---------------------------------------------------------------------------
// 2) markup and meta
// ---------------------------------------------------------------------------
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

swap('<meta property="og:image" content="https://imkhushi.com/og-image.jpg">',
     '<meta property="og:image" content="https://imkhushi.com/og-image-pavilion.jpg">',
     'og:image points at the pavilion render');

const GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>' +
  '<rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';

swap(`<a href="#" class="teaser-viewall" onclick="showView('work');return false;">view all work</a>`,
     `<div class="teaser-viewall-wrap"><a class="we-boards-btn" style="position:static" href="#" onclick="showView('work');return false;">${GRID}View All Work</a></div>`,
     'view all work becomes a bordered button with the boards icon');

swap('.teaser-viewall{display:block;width:fit-content;margin:40px auto 0;font-family:var(--title);font-size:13px;color:var(--text);text-decoration:none;padding-bottom:4px;position:relative}',
     '.teaser-viewall-wrap{display:flex;justify-content:center;margin-top:44px}',
     'centring wrapper replaces the old text link rule');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| we-boards-btn:', c('class="we-boards-btn"'));
