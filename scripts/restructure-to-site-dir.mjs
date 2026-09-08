import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const run = cmd => execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();

// ---------------------------------------------------------------------------
// 1) move the deployable files into site/, keeping git history via git mv
// ---------------------------------------------------------------------------
mkdirSync(join(ROOT, 'site'), { recursive: true });
const MOVE = ['index.html', 'images', 'Khushi_Patel_Resume.pdf', 'Caesura_Technical_Drawing_Set.pdf', 'og-image.jpg'];
for (const item of MOVE) {
  if (existsSync(join(ROOT, 'site', item))) { console.log('[skip] already moved:', item); continue; }
  if (!existsSync(join(ROOT, item))) throw new Error(`missing: ${item}`);
  run(`git mv "${item}" "site/${item}"`);
  console.log('[ok] moved', item);
}

// ---------------------------------------------------------------------------
// 2) repoint every script at the new location
// ---------------------------------------------------------------------------
const scriptsDir = join(ROOT, 'scripts');
let touched = 0;
for (const f of readdirSync(scriptsDir)) {
  if (!f.endsWith('.mjs')) continue;
  const p = join(scriptsDir, f);
  const src = readFileSync(p, 'utf8');
  let out = src
    .split('Portfolio-Website/site/index.html').join('Portfolio-Website/site/index.html')
    .split("join(BASE, 'site/index.html')").join("join(BASE, 'site/index.html')");
  if (out !== src) { writeFileSync(p, out); touched += 1; }
}
console.log('[ok] repointed', touched, 'scripts at site/index.html');

// ---------------------------------------------------------------------------
// 3) the local preview server serves from site/ now
// ---------------------------------------------------------------------------
const serve = join(ROOT, '.claude/serve.js');
let s = readFileSync(serve, 'utf8');
const OLD_ROOT = "const root = path.join(__dirname, '..');";
if (!s.includes(OLD_ROOT)) throw new Error('serve.js root line not found');
s = s.replace(OLD_ROOT, "const root = path.join(__dirname, '..', 'site');");
writeFileSync(serve, s);
console.log('[ok] preview server now serves site/');

// ---------------------------------------------------------------------------
// 4) the staging folder is obsolete once Cloudflare builds from the repo
// ---------------------------------------------------------------------------
if (existsSync(join(ROOT, '_deploy'))) rmSync(join(ROOT, '_deploy'), { recursive: true });
let ignore = readFileSync(join(ROOT, '.gitignore'), 'utf8');
ignore = ignore.split('\n').filter(l => l.trim() !== '_deploy/' && !l.includes('deploy staging')).join('\n');
writeFileSync(join(ROOT, '.gitignore'), ignore);
console.log('[ok] _deploy removed');

// ---------------------------------------------------------------------------
// 5) verify the moved document is intact
// ---------------------------------------------------------------------------
const html = readFileSync(join(ROOT, 'site/index.html'), 'utf8');
const count = t => html.split(t).length - 1;
console.log('index.html:', (html.length / 1024).toFixed(0) + 'KB',
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', count('boards-popup'), count('flipbook-popup'),
  '| img tags:', count('<img'),
  '| inline data URIs:', count('data:image/'));
const imgs = readdirSync(join(ROOT, 'site/images')).length;
console.log('images in site/images:', imgs);
