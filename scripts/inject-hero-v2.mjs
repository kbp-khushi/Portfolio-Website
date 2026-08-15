import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const INDEX = join(BASE, 'index.html');
const MONET_TXT = join(BASE, 'base64/hero/monet.txt');

async function run() {
  const html = await readFile(INDEX, 'utf8');
  const startMarker = '<section class="hero" id="home">';
  const endMarker = '</section>';
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error('hero section start marker not found');
  const end = html.indexOf(endMarker, start) + endMarker.length;
  if (end === -1) throw new Error('hero section end marker not found');

  const dataUri = (await readFile(MONET_TXT, 'utf8')).trim();

  const NEW = `<section class="hero" id="home">
  <div class="hero-row">
    <div class="hero-headline">
      <div class="hero-eyebrow">welcome to my</div>
      <h1 class="hero-title">architecture portfolio</h1>
    </div>
    <div class="hero-scroll-note">scroll to explore</div>
    <div class="hero-since">Since 2026</div>
  </div>
  <img class="hero-img" loading="eager" src="${dataUri}" alt="Detail of a personal photograph of Monet's Japanese footbridge and water lily painting, taken at the Met">
</section>`;

  const updated = html.slice(0, start) + NEW + html.slice(end);
  await writeFile(INDEX, updated, 'utf8');
  console.log('Hero v2 section updated. New file size:', (updated.length / 1024 / 1024).toFixed(1), 'MB');
}

run().catch(e => { console.error(e); process.exit(1); });
