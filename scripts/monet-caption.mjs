import { readFileSync, writeFileSync } from 'fs';

// The hero keeps a photograph of a Monet, which both reviewers flagged: the
// largest image on the site is someone else's painting with no attribution.
// Khushi kept the painting, so the caption is what answers the objection.
// It never got built. Two pieces:
//
//   hero    a quiet credit saying it is her photograph and whose painting
//   about   the reason it is there, which is the half that is actually hers
//
// Desktop puts the credit bottom right, baseline aligned with the button row,
// where nothing else sits. Mobile has no room beside the buttons, so it falls
// back to flowing under them.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// --- hero credit -----------------------------------------------------------
swap('.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}',
     '.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}\n' +
     '.hero-credit{position:absolute;right:60px;bottom:56px;max-width:30ch;margin:0;text-align:right;' +
     'font-family:var(--title);font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;' +
     'color:rgba(255,255,255,.6);text-shadow:0 1px 10px rgba(0,0,0,.4)}',
     'hero credit style');

// mobile: no room beside the buttons, so let it flow under them
swap('  .hero-img{height:100%}',
     '  .hero-img{height:100%}\n' +
     '  .hero-credit{position:static;margin-top:14px;text-align:left;max-width:none;font-size:9px;letter-spacing:.08em}',
     'hero credit falls back to flow on mobile');

swap('      </div>\n    </div>\n  </div>\n</section>\n\n<!-- SELECTED WORK (landing teaser) -->',
     '      </div>\n' +
     '      <p class="hero-credit">Claude Monet&rsquo;s water lilies, photographed by me at the Met</p>\n' +
     '    </div>\n  </div>\n</section>\n\n<!-- SELECTED WORK (landing teaser) -->',
     'hero credit markup');

// --- about note ------------------------------------------------------------
swap('.about-intro-row{display:grid;grid-template-columns:520px 1fr;gap:48px;align-items:end;margin-bottom:56px}',
     '.about-intro-row{display:grid;grid-template-columns:520px 1fr;gap:48px;align-items:end;margin-bottom:56px}\n' +
     '.about-note{font-family:var(--body);font-size:13px;line-height:1.6;color:var(--text-light);' +
     'margin:20px 0 0;padding-top:16px;border-top:1px solid var(--line)}',
     'about note style');

swap('deeper into this beautiful profession.</p>',
     'deeper into this beautiful profession.</p>\n' +
     '      <p class="about-note">The painting at the top of this page is one I photographed at the Met. ' +
     'Monet&rsquo;s water lilies have been my favorite since I was a kid, and that palette found its way ' +
     'into Caesura.</p>',
     'about note markup');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'),
  '| credit:', c('hero-credit'), '| note:', c('about-note'));
