import { readFileSync, writeFileSync } from 'fs';

// The bottom button on a project page sat against the rule above the previous
// and next links. .project-nav puts its 40px of padding below its border, so
// whatever precedes it has to supply the space above the line itself.
//
// Five pages using .pp-cta already stand 60px clear and read correctly. Seven
// others were short, worst of them Pinned at 8px. This brings them all to 60.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// measured button bottom to rule, in the browser, before this change
const TARGET = 60;
const PAGES = {
  'the-pause':         { padding: 'padding:48px 60px 0',   bottom: 0,  measured: 24 },
  'woven-edge':        { padding: 'padding:48px 60px 0',   bottom: 0,  measured: 24 },
  'virtuous-book':     { padding: 'padding:20px 60px',     bottom: 20, measured: 20 },
  'beaufort-cookbook': { padding: 'padding:20px 60px',     bottom: 20, measured: 20 },
  'massing-model':     { padding: 'padding:40px 60px',     bottom: 40, measured: 40 },
  'section-model':     { padding: 'padding:40px 60px',     bottom: 40, measured: 40 },
  'site-analysis':     { padding: 'padding:44px 0 8px',    bottom: 8,  measured: 8  },
};

for (const [slug, cfg] of Object.entries(PAGES)) {
  const s = html.indexOf(`id="page-${slug}"`);
  if (s === -1) throw new Error(`${slug}: page not found`);
  let e = html.indexOf('<div class="project-page"', s + 10);
  if (e === -1) e = html.length;

  // the wrapper is the last padded div before the previous/next nav
  const navAt = html.lastIndexOf('class="project-nav"', e);
  if (navAt < s) throw new Error(`${slug}: no project-nav`);
  const at = html.lastIndexOf(`<div style="${cfg.padding};text-align:center"`, navAt);
  if (at < s) throw new Error(`${slug}: wrapper not found before the nav`);

  // top and sides stay as they are; only the space above the rule changes
  const parts = cfg.padding.replace('padding:', '').split(' ');
  const top = parts[0], sides = parts[1];
  const grown = cfg.bottom + (TARGET - cfg.measured);
  const next = `padding:${top} ${sides} ${grown}px`;

  html = html.slice(0, at) + `<div style="${next};text-align:center"` +
         html.slice(at + `<div style="${cfg.padding};text-align:center"`.length);
  console.log(`[ok] ${slug.padEnd(19)} ${cfg.measured}px -> 60px above the rule`);
}

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
