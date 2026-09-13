import { readFileSync, writeFileSync } from 'fs';

// Contact becomes a short Monet band that closes the About page the way the hero
// opens the site: eyebrow, email as the headline in the light/bold name pairing,
// the hero's outlined buttons, and the Monet credit bottom right. Everything is left
// aligned on the 60px gutter. The image is the lower part of the painting
// (scripts/monet-contact-crop.mjs) so it doesn't repeat the hero.
// Chosen 2026-09-13 from rendered options (round two, option a).
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const nl = html.includes('\r\n') ? '\r\n' : '\n';
const L = s => s.split('\n').join(nl);

function swap(re, to, label) {
  if (!re.test(html)) throw new Error('not found: ' + label);
  html = html.replace(re, to);
}

// 1. CSS: retire the white contact block rules, add the band
swap(/\/\* Contact is a section in its own right[\s\S]*?\.contact-row a:hover\{[^}]*\}/, L(
`/* Contact closes About the way the hero opens the site: a short band of the Monet
   (a lower crop, so it doesn't repeat the hero), text left on the 60px gutter.
   It reuses the hero's eyebrow, title pairing, buttons, scrim and credit. */
.contact-band{position:relative;margin-top:100px;height:460px;overflow:hidden;scroll-margin-top:60px}
.contact-band .hero-img{object-position:center 40%}
.contact-band-inner{position:absolute;left:0;right:0;bottom:0;padding:0 60px 48px;z-index:2}
.contact-band .hero-title{font-size:clamp(36px,4.6vw,66px);text-decoration:none;display:inline-block;position:relative}
.contact-band .hero-title::after{content:'';position:absolute;left:0;bottom:-6px;height:2px;width:0;background:#fff;transition:width .4s cubic-bezier(.22,1,.36,1)}
.contact-band .hero-title:hover::after{width:100%}
.contact-band .hero-credit{bottom:48px}
/* the band already carries email, LinkedIn and location, so About's footer drops its repeat */
#view-about.active ~ #site-footer .footer-backtotop-wrap,
#view-about.active ~ #site-footer .footer-divider,
#view-about.active ~ #site-footer .footer-contact-row{display:none}
#view-about.active ~ #site-footer{padding-top:28px}
@media(max-width:768px){
  .contact-band{margin-top:60px;height:420px}
  .contact-band-inner{padding:0 24px 30px}
  .contact-band .hero-title{font-size:clamp(24px,7.4vw,40px);white-space:nowrap}
  html{scrollbar-gutter:auto}}`), 'contact css');

// 2. markup
swap(/<section class="contact-section" id="contact">[\s\S]*?<\/section>/, L(
`<section class="contact-band" id="contact">
  <img width="2400" height="590" class="hero-img" loading="lazy" src="images/monet-contact.jpg" alt="Detail of the lower half of Monet's water lily painting, photographed at MoMA">
  <div class="hero-scrim"></div>
  <div class="contact-band-inner">
    <div class="hero-eyebrow">Contact &middot; Savannah / Atlanta</div>
    <a class="hero-title" href="mailto:kbp.khushi@gmail.com"><span class="w-light">kbp.khushi</span><span class="w-bold">@gmail.com</span></a>
    <div class="hero-actions">
      <a class="hero-btn" href="mailto:kbp.khushi@gmail.com">email me</a>
      <a class="hero-btn" href="https://www.linkedin.com/in/kbp-khushi" target="_blank" rel="noopener">linkedin</a>
      <a class="hero-btn" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">view resume</a>
    </div>
    <p class="hero-credit">Claude Monet&rsquo;s water lilies, photographed by me at MoMA</p>
  </div>
</section>`), 'contact markup');

// 3. reveal list: fade the band's text block in, instead of the retired pieces
swap(/#contact \.section-title,#contact \.section-divider,#contact \.contact-email,#contact \.contact-row/, '#contact .contact-band-inner', 'reveal list');

writeFileSync(P, html);
console.log('ok', html.trimEnd().endsWith('</html>'), (html.match(/boards-popup/g) || []).length, (html.match(/flipbook-popup/g) || []).length);
