import { readFileSync, writeFileSync, statSync } from 'fs';

// 76 images inside the project overlays had no loading="lazy", so the browser
// fetched 7.2MB on first visit for pages a visitor may never open. First load
// was 9.1MB. The landing and About images stay eager on purpose: those are
// visible immediately, and making them lazy is what produced the grey
// placeholder boxes Khushi flagged earlier.

const ROOT = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website';
const P = `${ROOT}/site/index.html`;
let html = readFileSync(P, 'utf8');
const before = html.length;

const firstPage = html.indexOf('<div class="project-page"');
if (firstPage === -1) throw new Error('no project pages found');

const head = html.slice(0, firstPage);
let tail = html.slice(firstPage);

const weigh = (tags) => tags.reduce((sum, t) => {
  const m = t.match(/src="images\/([^"]+)"/);
  if (!m) return sum;
  try { return sum + statSync(`${ROOT}/site/images/${m[1]}`).size; } catch { return sum; }
}, 0);

const EAGER = /<img(?![^>]*loading=)([^>]*src="images\/[^"]+")([^>]*)>/g;
const found = tail.match(EAGER) || [];
const savedBytes = weigh(found);

tail = tail.replace(EAGER, (_m, a, b) => `<img loading="lazy"${a}${b}>`);

html = head + tail;
writeFileSync(P, html);

const c = s => html.split(s).length - 1;
const mb = b => (b / 1048576).toFixed(1) + 'MB';
console.log(`[ok] ${found.length} overlay images made lazy, deferring ${mb(savedBytes)}`);
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| lazy:', c('loading="lazy"'));

// nothing in the landing or About should have been touched
const stillEagerHead = (head.match(/<img(?![^>]*loading=)[^>]*src="images\/[^"]+"/g) || []).length;
console.log('landing/About images left eager (expected 5):', stillEagerHead);
