import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const BASE = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const INDEX = join(BASE, 'index.html');
const MONET_TXT = join(BASE, 'base64/hero/monet.txt');

const OLD = `<section class="hero" id="home" style="background:#FFF">
  <div class="hero-tag">Architecture + Design</div>
  <h1 class="hero-name">Khushi<br>Patel</h1>
  <p class="hero-sub">Architecture graduate student at the Savannah College of Art and Design, exploring the intersection of community, ecology, and spatial experience through thoughtful design.</p>
  <div class="hero-meta">
    <div class="hero-meta-item"><span class="hero-meta-label">Education</span><span class="hero-meta-value">M.Arch &mdash; SCAD</span></div>
    <div class="hero-meta-item"><span class="hero-meta-label">Location</span><span class="hero-meta-value">Savannah, GA</span></div>
    <div class="hero-meta-item"><span class="hero-meta-label">Focus</span><span class="hero-meta-value">Civic + Ecological Design</span></div>
  </div>
  <div class="scroll-ind"><div class="scroll-line"></div>Scroll to explore</div>
</section>`;

async function run() {
  const html = await readFile(INDEX, 'utf8');
  if (!html.includes(OLD)) {
    throw new Error('OLD hero block not found verbatim in index.html - aborting to avoid corrupting the file.');
  }
  const dataUri = (await readFile(MONET_TXT, 'utf8')).trim();

  const NEW = `<section class="hero" id="home">
  <img class="hero-img" loading="eager" src="${dataUri}" alt="Detail of a personal photograph of Monet's Japanese footbridge and water lily painting, taken at the Met">
  <nav class="hero-nav">
    <a href="#home" class="hero-nav-logo">Khushi Patel</a>
    <ul class="hero-nav-links">
      <li><a href="#projects">Work</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</section>`;

  const updated = html.replace(OLD, NEW);
  await writeFile(INDEX, updated, 'utf8');
  console.log('Hero section updated. New file size:', (updated.length / 1024 / 1024).toFixed(1), 'MB');
}

run().catch(e => { console.error(e); process.exit(1); });
