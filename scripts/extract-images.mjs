import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = join(ROOT, 'index.html');
const IMG_DIR = join(ROOT, 'images');
const DEPLOY = join(ROOT, '_deploy');

let html = readFileSync(P, 'utf8');
const before = html.length;

if (existsSync(IMG_DIR)) rmSync(IMG_DIR, { recursive: true });
mkdirSync(IMG_DIR, { recursive: true });

const EXT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };
const seen = new Map();          // hash -> filename, so repeated images share one file
let written = 0, reused = 0, bytes = 0, n = 0;

// name each file from the alt text where the markup gives us one
function nameFor(tagStart) {
  const window = html.slice(tagStart, tagStart + 40000);
  const alt = window.match(/alt="([^"]{2,60})"/);
  const slug = alt ? alt[1].toLowerCase().replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) : 'image';
  return slug || 'image';
}

const RE = /src="data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)"/g;
let out = '';
let last = 0;
let m;
while ((m = RE.exec(html)) !== null) {
  const [full, mime, b64] = m;
  const buf = Buffer.from(b64, 'base64');
  const hash = createHash('md5').update(buf).digest('hex');
  let file = seen.get(hash);
  if (!file) {
    n += 1;
    const ext = EXT[mime] || 'bin';
    file = `${String(n).padStart(3, '0')}-${nameFor(m.index)}.${ext}`;
    writeFileSync(join(IMG_DIR, file), buf);
    seen.set(hash, file);
    written += 1;
    bytes += buf.length;
  } else {
    reused += 1;
  }
  out += html.slice(last, m.index) + `src="images/${file}"`;
  last = m.index + full.length;
}
out += html.slice(last);
html = out;

console.log(`images written: ${written}  (duplicates pointed at an existing file: ${reused})`);
console.log(`image bytes on disk: ${(bytes / 1048576).toFixed(1)}MB`);
console.log(`index.html: ${(before / 1048576).toFixed(1)}MB -> ${(html.length / 1024).toFixed(0)}KB`);

// the hero should not wait for the lazy loader
html = html.replace('<img class="hero-img" loading="eager"', '<img class="hero-img" loading="eager" fetchpriority="high"');

// sanity
const remaining = (html.match(/data:image\//g) || []).length;
console.log('remaining inline images:', remaining);
if (!html.trimEnd().endsWith('</html>')) throw new Error('document truncated');
for (const marker of ['boards-popup', 'flipbook-popup']) {
  const c = html.split(marker).length - 1;
  if (c !== 8) throw new Error(`${marker} appears ${c} times, expected 8`);
}
const imgCount = (html.match(/<img/g) || []).length;
console.log('img tags:', imgCount);

writeFileSync(P, html);

// stage a deployable folder: the page, its images, the two PDFs, the preview image
if (existsSync(DEPLOY)) rmSync(DEPLOY, { recursive: true });
mkdirSync(join(DEPLOY, 'images'), { recursive: true });
copyFileSync(P, join(DEPLOY, 'index.html'));
for (const f of seen.values()) copyFileSync(join(IMG_DIR, f), join(DEPLOY, 'images', f));
for (const f of ['Khushi_Patel_Resume.pdf', 'Caesura_Technical_Drawing_Set.pdf', 'og-image.jpg']) {
  copyFileSync(join(ROOT, f), join(DEPLOY, f));
}
console.log('staged _deploy with', written + 3, 'files plus index.html');
