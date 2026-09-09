import { readFileSync, writeFileSync } from 'fs';

// Hero option 2: the type sits inside the Monet.
//
// Out: "welcome to my", "ARCHITECTURE PORTFOLIO", "Since 2026".
// In:  her name, her credential and her own sentence from About, laid over the
//      painting and held legible by a scrim weighted to the bottom left.
//
// Both reviewers said the first screen tells a visitor nothing. This puts her
// name, her discipline, her location and her position in it, and keeps the
// painting she wants to keep.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// ---------------------------------------------------------------------------
// markup
// ---------------------------------------------------------------------------
const oldStart = html.indexOf('<section class="hero" id="home">');
const oldEnd = html.indexOf('</section>', oldStart);
if (oldStart === -1 || oldEnd === -1) throw new Error('hero section not found');
const oldHero = html.slice(oldStart, oldEnd + 10);
if (!oldHero.includes('Since 2026')) throw new Error('unexpected hero contents');

const newHero = `<section class="hero" id="home">
  <div class="hero-canvas">
    <img class="hero-img" loading="eager" fetchpriority="high" src="images/001-image.jpg" alt="Detail of a personal photograph of Monet's Japanese footbridge and water lily painting, taken at the Met">
    <div class="hero-scrim"></div>
    <div class="hero-inner">
      <div class="hero-eyebrow">M.Arch candidate &middot; Savannah / Atlanta</div>
      <h1 class="hero-title"><span class="w-light">khushi</span> <span class="w-bold">patel</span></h1>
      <p class="hero-lede">Architecture measured by how people move through it, gather in it, and feel while they are there.</p>
      <div class="hero-actions">
        <a class="hero-btn" href="#work" onclick="document.querySelector('.work-teaser').scrollIntoView({block:'start'});return false;">view work</a>
        <a class="hero-btn" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">view resume</a>
        <a class="hero-btn" href="#contact" onclick="showView('about');setTimeout(function(){document.getElementById('contact').scrollIntoView({block:'start'});},80);return false;">contact me</a>
      </div>
    </div>
  </div>
</section>`;

html = html.slice(0, oldStart) + newHero + html.slice(oldEnd + 10);
console.log('[ok] hero markup replaced');

// ---------------------------------------------------------------------------
// desktop styles
// ---------------------------------------------------------------------------
swap('.hero{padding:244px 0 0}',
  `.hero{padding:0}
.hero-canvas{position:relative;width:100%;height:clamp(520px,76vh,820px);overflow:hidden}
.hero-scrim{position:absolute;inset:0;pointer-events:none;background:
  linear-gradient(to top, rgba(0,0,0,.66) 0%, rgba(0,0,0,.34) 34%, rgba(0,0,0,0) 68%),
  linear-gradient(to right, rgba(0,0,0,.34) 0%, rgba(0,0,0,.06) 48%, rgba(0,0,0,0) 78%)}
.hero-inner{position:absolute;left:0;right:0;bottom:0;padding:0 60px 56px;z-index:2}
.hero-lede{font-family:var(--body);font-size:clamp(15px,1.55vw,19px);line-height:1.55;
  color:rgba(255,255,255,.94);max-width:38ch;margin:18px 0 0;text-shadow:0 1px 14px rgba(0,0,0,.28)}`,
  'hero canvas, scrim and lede');

swap('.hero-img{width:100%;height:calc(65vh + 192px);object-fit:cover;display:block}',
     '.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}',
     'hero image fills the canvas');

swap('.hero-eyebrow{font-family:var(--body);font-weight:400;font-size:13px;color:var(--text-light);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px}',
     '.hero-eyebrow{font-family:var(--title);font-weight:600;font-size:12px;color:rgba(255,255,255,.86);margin-bottom:14px;text-transform:uppercase;letter-spacing:.18em;text-shadow:0 1px 12px rgba(0,0,0,.35)}',
     'eyebrow carries the credential, in white');

swap('.hero-title{font-family:var(--title);font-size:clamp(32px,4.5vw,56px);line-height:1.05;color:var(--text);text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}',
     '.hero-title{font-family:var(--title);font-size:clamp(44px,7vw,92px);line-height:.95;color:#fff;letter-spacing:-.02em;white-space:nowrap;margin:0;text-shadow:0 2px 26px rgba(0,0,0,.32)}',
     'name replaces the generic headline');

// buttons read on the painting rather than on white
swap('.hero-btn{font-family:var(--title);font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:10px 20px;border:1px solid var(--line);color:var(--text-light);text-decoration:none;transition:all .3s;cursor:pointer}',
     `.hero-btn{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:11px 20px;border:1px solid rgba(255,255,255,.75);color:#fff;text-decoration:none;transition:all .3s;cursor:pointer;backdrop-filter:blur(2px)}
.hero-btn:hover{background:#fff;color:#000;border-color:#fff}`,
     'hero buttons in white');

// ---------------------------------------------------------------------------
// mobile: the type stays inside the painting, the canvas just gets shorter
// ---------------------------------------------------------------------------
swap('.hero{padding:120px 0 0}',
     `.hero{padding:0}
  .hero-canvas{height:clamp(430px,64vh,580px)}
  .hero-inner{padding:0 24px 30px}
  .hero-lede{font-size:14px;max-width:none;margin-top:14px}
  .hero-eyebrow{font-size:10px;margin-bottom:10px}
  .hero-scrim{background:
    linear-gradient(to top, rgba(0,0,0,.74) 0%, rgba(0,0,0,.42) 42%, rgba(0,0,0,.06) 78%),
    linear-gradient(to right, rgba(0,0,0,.30) 0%, rgba(0,0,0,0) 70%)}`,
     'mobile canvas and scrim');

swap('.hero-img{height:26vh}', '.hero-img{height:100%}', 'mobile image fills its canvas');
swap('.hero-title{white-space:normal}', '.hero-title{white-space:nowrap;font-size:clamp(38px,11.5vw,54px)}', 'mobile name');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'));
console.log('"welcome to my" gone:', !html.includes('welcome to my'),
  '| "Since 2026" gone:', !html.includes('Since 2026'),
  '| hero-lede present:', c('hero-lede') > 0);
