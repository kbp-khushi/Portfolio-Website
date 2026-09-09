import { readFileSync, writeFileSync } from 'fs';

// Take two on the bottom button spacing. My first pass edited the inline
// padding, but this file drives mobile through selectors that match the inline
// padding *string* ([style*="padding:20px 60px"]), so changing the string
// changed which mobile rule applied and the gaps came out anywhere from 16 to
// 60 on a phone.
//
// So the inline padding goes back to what it was, and the bottom spacing moves
// to a class instead. The class is display:flex because these wrappers hold
// nothing but the button: that removes the line box, which is what made the
// same padding produce different gaps from page to page.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// slug -> [what my first pass wrote, what it was before that]
const PAGES = {
  'the-pause':         ['padding:48px 60px 36px', 'padding:48px 60px 0'],
  'woven-edge':        ['padding:48px 60px 36px', 'padding:48px 60px 0'],
  'virtuous-book':     ['padding:20px 60px 60px', 'padding:20px 60px'],
  'beaufort-cookbook': ['padding:20px 60px 60px', 'padding:20px 60px'],
  'massing-model':     ['padding:40px 60px 60px', 'padding:40px 60px'],
  'section-model':     ['padding:40px 60px 60px', 'padding:40px 60px'],
  'site-analysis':     ['padding:44px 0 60px',    'padding:44px 0 8px'],
};

for (const [slug, [now, original]] of Object.entries(PAGES)) {
  const s = html.indexOf(`id="page-${slug}"`);
  if (s === -1) throw new Error(`${slug}: page not found`);
  let e = html.indexOf('<div class="project-page"', s + 10);
  if (e === -1) e = html.length;
  const navAt = html.lastIndexOf('class="project-nav"', e);
  const open = `<div style="${now};text-align:center"`;
  const at = html.lastIndexOf(open, navAt);
  if (at < s) throw new Error(`${slug}: wrapper not found`);
  html = html.slice(0, at) +
         `<div class="cta-clear" style="${original};text-align:center"` +
         html.slice(at + open.length);
  console.log('[ok]', slug.padEnd(19), 'padding restored, class added');
}

// after every other rule, so it wins the [style*=...] mobile overrides, which
// are !important and carry the same specificity as a class
const CSS = '\n/* The bottom button holds the space above the previous/next rule itself,\n' +
  '   since .project-nav puts its own padding below the border. flex, because\n' +
  '   these wrappers contain only the button and the line box was adding a\n' +
  '   different amount of slack on different pages. */\n' +
  '.cta-clear{display:flex;justify-content:center;padding-bottom:60px!important}\n' +
  '@media(max-width:768px){.cta-clear{padding-bottom:48px!important}}\n';

const endAt = html.indexOf('</style>');
if (endAt === -1) throw new Error('stylesheet end not found');
html = html.slice(0, endAt) + CSS + html.slice(endAt);
console.log('[ok] .cta-clear added at the end of the stylesheet');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| cta-clear:', c('class="cta-clear"'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
