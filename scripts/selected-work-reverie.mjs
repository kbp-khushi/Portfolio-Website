// Home page Selected Work (2026-11-18, her asks "add reverie to selected work" + "remove beacon"):
// Reverie goes first (newest, same order as the Work page), Beacon comes out. Reverie's card image is the
// overlook, her Work card pick, with the same In Progress chip; facts copied from its project page.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
if (html.includes(`class="stack-item" onclick="openProject('reverie')"`)) throw new Error('already in');
const N = html.includes('\r\n') ? '\r\n' : '\n';

// remove Beacon
const beacon = new RegExp(`\\s*<div class="stack-item" onclick="openProject\\('beacon'\\)">[\\s\\S]*?</div>\\r?\\n      </div>\\r?\\n    </div>(?=\\r?\\n  </div>\\r?\\n  <div class="teaser-viewall-wrap">)`);
if (!beacon.test(html)) throw new Error('beacon card not found');
html = html.replace(beacon, '');

// add Reverie first
const reverie = [
  `    <div class="stack-item" onclick="openProject('reverie')">`,
  `      <div style="position:relative"><span class="wip-badge">In Progress</span><img width="2400" height="1308" class="stack-img" data-slug="reverie" src="images/217-reverie-overlook.jpg" alt="Reverie, the overlook and release over the Downtown Connector at dusk"></div>`,
  `      <div class="stack-info">`,
  `        <div class="stack-title">Reverie</div>`,
  `        <div class="stack-facts">`,
  `          <div class="stack-fact"><span class="fact-label">Project Type</span><span class="fact-value">Artist Retreat</span></div>`,
  `          <div class="stack-fact"><span class="fact-label">Year</span><span class="fact-value">2026</span></div>`,
  `          <div class="stack-fact"><span class="fact-label">Location</span><span class="fact-value">Back40, Savannah, GA<br>Atlanta, GA</span></div>`,
  `          <div class="stack-fact"><span class="fact-label">Completion Time</span><span class="fact-value">10 weeks</span></div>`,
  `        </div>`,
  `      </div>`,
  `    </div>`,
].join(N);
const anchor = `<div class="work-stack">`;
if (!html.includes(anchor)) throw new Error('work-stack missing');
html = html.replace(anchor, anchor + N + reverie);

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
const stack = html.slice(html.indexOf(anchor), html.indexOf('teaser-viewall-wrap'));
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'),
  'stack order', (stack.match(/openProject\('([a-z-]+)'\)/g) || []).join(' '), 'beacon page still there', html.includes('id="page-beacon"'));
