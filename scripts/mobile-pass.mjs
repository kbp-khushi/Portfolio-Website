import { readFileSync, writeFileSync } from 'fs';

// Mobile pass. Three things:
//
// A. One gutter. On a project page the content sat at 16px, the site analysis
//    link at 60px, the previous/next rule at 60px and the footer at 24px, so a
//    single screen had four different left edges. Everything goes to 24px,
//    which is what the landing sections, the nav and the footer already used.
//
// B. The centred buttons kept their spacing on desktop but lost it on mobile:
//    the inline padding was caught by [style*="padding:8px 60px"], which
//    rewrote it to 8px and dropped the 60px that holds the button clear of the
//    nav rule. They become a real class instead of relying on that override.
//
// C. The hero buttons broke every label onto two lines. They stack full width.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (oldStr, newStr, label) => {
  const hits = html.split(oldStr).length - 1;
  if (hits !== 1) throw new Error(`${label}: ${hits} matches`);
  html = html.replace(oldStr, () => newStr);
  console.log('[ok]', label);
};

// ---------------------------------------------------------------------------
// A. one 24px gutter on mobile
// ---------------------------------------------------------------------------
const GUTTER = [
  ['.img-row-sm,.img-row-lg,.img-row-mixed,.img-row-mixed-r{grid-template-columns:1fr;padding-left:16px;padding-right:16px}',
   '.img-row-sm,.img-row-lg,.img-row-mixed,.img-row-mixed-r{grid-template-columns:1fr;padding-left:24px;padding-right:24px}'],
  ['.img-hero-full,.img-large,.img-medium,.img-small,.img-block{padding-left:16px;padding-right:16px}',
   '.img-hero-full,.img-large,.img-medium,.img-small,.img-block{padding-left:24px;padding-right:24px}'],
  ['.pp-header,.pp-description{padding-left:16px!important;padding-right:16px!important}',
   '.pp-header,.pp-description{padding-left:24px!important;padding-right:24px!important}'],
  ['.ds-section{padding-left:16px!important;padding-right:16px!important}',
   '.ds-section{padding-left:24px!important;padding-right:24px!important}'],
  ['.tag-row,.board-scroll{padding-left:16px!important;padding-right:16px!important}',
   '.tag-row,.board-scroll{padding-left:24px!important;padding-right:24px!important}'],
  ['.ds-row{grid-template-columns:1fr 1fr;gap:16px;padding-left:16px!important;padding-right:16px!important}',
   '.ds-row{grid-template-columns:1fr 1fr;gap:16px;padding-left:24px!important;padding-right:24px!important}'],
  ['.edit-row{grid-template-columns:1fr!important;gap:24px;padding:32px 16px!important}',
   '.edit-row{grid-template-columns:1fr!important;gap:24px;padding:32px 24px!important}'],
  ['.edit-full,.edit-full-narrow{padding:24px 16px!important}',
   '.edit-full,.edit-full-narrow{padding:24px 24px!important}'],
  ['.massing-labels{padding-left:16px!important;padding-right:16px!important}',
   '.massing-labels{padding-left:24px!important;padding-right:24px!important}'],
  ['.drawing-set{padding:8px 16px 32px}', '.drawing-set{padding:8px 24px 32px}'],
  ['.model-links{padding:20px 16px 0}', '.model-links{padding:20px 24px 0}'],
  ['.fm-finals{grid-template-columns:1fr;gap:14px;padding:0 16px}',
   '.fm-finals{grid-template-columns:1fr;gap:14px;padding:0 24px}'],
  // the rule above previous/next was inset 60px on mobile while the text beside
  // it sat at 16px; margin and padding now add up to the same 24px
  ['.project-nav{padding:24px 16px 0!important}',
   '.project-nav{margin:0 24px!important;padding:24px 0 0!important}'],
  // inline-padding overrides
  ['[style*="padding:24px 180px"]{padding:16px 16px!important}', '[style*="padding:24px 180px"]{padding:16px 24px!important}'],
  ['[style*="padding:8px 180px"]{padding:8px 16px!important}', '[style*="padding:8px 180px"]{padding:8px 24px!important}'],
  ['[style*="padding:20px 60px"]{padding:16px 16px!important}', '[style*="padding:20px 60px"]{padding:16px 24px!important}'],
  ['[style*="padding:48px 60px"]{padding:24px 16px!important}', '[style*="padding:48px 60px"]{padding:24px 24px!important}'],
  ['[style*="padding:32px 60px"]{padding:24px 16px!important}', '[style*="padding:32px 60px"]{padding:24px 24px!important}'],
  ['[style*="padding:40px 60px"]{padding:24px 16px!important}', '[style*="padding:40px 60px"]{padding:24px 24px!important}'],
  ['[style*="padding:12px 60px"]{padding:12px 16px!important}', '[style*="padding:12px 60px"]{padding:12px 24px!important}'],
  ['[style*="padding:8px 60px"]{padding:8px 16px!important}', '[style*="padding:8px 60px"]{padding:8px 24px!important}'],
];
for (const [o, n] of GUTTER) swap(o, n, 'gutter: ' + o.slice(0, 42));

// ---------------------------------------------------------------------------
// B. the centred call-to-action becomes a class, so mobile keeps its spacing
// ---------------------------------------------------------------------------
swap('.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:20px 60px 0;justify-content:center}',
  '.pp-cta{padding:8px 60px 60px;text-align:center}\r\n' +
  '.pp-cta.has-sub{padding-bottom:0}\r\n' +
  '.model-links.pp-cta-sub{justify-content:center;padding:18px 60px 60px}\r\n' +
  '@media(max-width:768px){.pp-cta{padding:8px 24px 48px}.pp-cta.has-sub{padding-bottom:0}.model-links.pp-cta-sub{padding:14px 24px 48px}}\r\n' +
  '.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:20px 60px 0;justify-content:center}',
  'pp-cta styles added');

// the four pages whose button carries the bottom spacing itself
for (const slug of ['fluke', 'dreamscape', 'laker', 'drodel']) {
  const start = html.indexOf(`id="page-${slug}"`);
  let end = html.indexOf('<div class="project-page"', start + 10);
  if (end === -1) end = html.length;
  let seg = html.slice(start, end);
  const o = '<div style="padding:8px 60px 60px;text-align:center">';
  if (seg.split(o).length - 1 !== 1) throw new Error(`${slug}: cta wrapper not unique`);
  seg = seg.replace(o, () => '<div class="pp-cta">');
  html = html.slice(0, start) + seg + html.slice(end);
  console.log('[ok]', slug, 'cta wrapper -> class');
}

// Beacon: button has the site analysis link under it, so the spacing lives there
swap('<div style="padding:8px 60px 0;text-align:center">', '<div class="pp-cta has-sub">', 'Beacon cta wrapper -> class');
swap('<div class="model-links" style="justify-content:center;padding:18px 60px 60px">',
     '<div class="model-links pp-cta-sub">', 'Beacon site analysis link -> class');

// ---------------------------------------------------------------------------
// C. hero buttons stacked full width instead of wrapping each label in half
// ---------------------------------------------------------------------------
swap('.hero-actions{margin-top:16px}',
     '.hero-actions{margin-top:16px;flex-direction:column;align-items:stretch;width:100%;gap:10px}',
     'hero actions stack on mobile');
swap('.hero-btn{padding:9px 16px}',
     '.hero-btn{padding:12px 16px;text-align:center;white-space:nowrap}',
     'hero buttons full width, labels on one line');

// ---------------------------------------------------------------------------
// D. the About fade reaches the AXP rings and the honors list
// ---------------------------------------------------------------------------
swap('<div class="group-label">honors</div>\r\n          <ul class="exp-points" style="margin-top:8px">',
     '<div class="group-label">honors</div>\r\n          <ul class="exp-points honors-list" style="margin-top:8px">',
     'honors list gets a hook');
swap("document.querySelectorAll('#about .exp-item,#about .education-item,#about .ai-tag,#about .about-ai-note,#about .about-lic-item')",
     "document.querySelectorAll('#about .exp-item,#about .education-item,#about .ai-tag,#about .about-ai-note,#about .about-lic-item,#about .axp-item,#about .honors-list li')",
     'AXP rings and honors items join the fade');

writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length);
console.log('ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| inline data URIs:', c('data:image/'));
console.log('pp-cta wrappers:', c('class="pp-cta"') + c('class="pp-cta has-sub"'));
console.log('we-boards-btn:', c('class="we-boards-btn"'));
