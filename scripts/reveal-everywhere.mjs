import { readFileSync, writeFileSync } from 'fs';

// The fade was applied to a hand written list of selectors, so anything added
// since simply never got it. Audit found the gaps:
//
//   landing     .stack-item (the three Selected Work cards), .teaser-viewall-wrap
//   work index  .model-card
//   about       the contact block
//   projects    .edit-full (6 on Caesura, 8 on Woven Edge), .ds-section,
//               .pp-cta, .pp-cta-inline, .project-nav, .drawing-set, .fm-*
//
// .edit-full was the loudest: full width drawings sitting still while the
// .edit-row beside them faded.
//
// Everything now goes through one helper with a nesting guard. That guard
// matters: a reveal inside another reveal never fires, because the outer one
// holds opacity 0 so the inner never intersects and stays invisible forever.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

const OLD_PP = "// Project page reveals\n" +
  "document.querySelectorAll('.project-page').forEach(page=>{\n" +
  "  page.querySelectorAll('.pp-header,.pp-description,.edit-row,.pp-full-img,.dl-link,.pp-nav,.cote-link').forEach(el=>el.classList.add('pp-reveal'));\n" +
  "});";

const NEW_PP = "// One helper for both fade systems. The nesting guard is the important part:\n" +
  "// a reveal inside another reveal never fires, because the outer one sits at\n" +
  "// opacity 0 so the inner never intersects and stays hidden for good.\n" +
  "function addReveal(root,selector,cls,after){\n" +
  "  root.querySelectorAll(selector).forEach(function(el){\n" +
  "    if(el.classList.contains(cls))return;\n" +
  "    var n=el.parentElement,nested=false;\n" +
  "    while(n&&n!==root&&n!==document.body){\n" +
  "      if(n.classList.contains('reveal')||n.classList.contains('pp-reveal')){nested=true;break;}\n" +
  "      n=n.parentElement;\n" +
  "    }\n" +
  "    if(nested)return;\n" +
  "    el.classList.add(cls);\n" +
  "    if(after)after(el);\n" +
  "  });\n" +
  "}\n\n" +
  "// Project page reveals. setupPpReveal() re-queries .pp-reveal on every open,\n" +
  "// so anything marked here is observed automatically when the page is shown.\n" +
  "document.querySelectorAll('.project-page').forEach(page=>{\n" +
  "  addReveal(page,'.pp-header,.pp-description,.edit-row,.edit-full,.edit-full-narrow,.ds-section,.pp-full-img,.pp-cta,.pp-cta-inline,.drawing-set,.fm-finals,.fm-brief,.project-nav,.pp-nav,.cote-link','pp-reveal');\n" +
  "});";

swap(OLD_PP, NEW_PP, 'project pages: helper added, selector list widened');

// landing, work index and contact, which had no fade at all
const ANCHOR = "// Section reveals\n" +
  "document.querySelectorAll('.section-label,.section-title,.section-divider,.group-label,.about-intro-row').forEach(el=>{\n" +
  "  if(!el.classList.contains('reveal')){el.classList.add('reveal');revealObs.observe(el);}\n" +
  "});";

const ADDITION = ANCHOR + "\n\n" +
  "// the landing cards, the model thumbnails and the contact block, none of\n" +
  "// which were ever on the list. .resume-grid is deliberately left alone: its\n" +
  "// children fade individually further down, and revealing the parent too\n" +
  "// would trap them.\n" +
  "[['.stack-item',90],['.model-card',90]].forEach(function(pair){\n" +
  "  var i=0;\n" +
  "  addReveal(document,pair[0],'reveal',function(el){el.style.transitionDelay=(i++*pair[1])+'ms';revealObs.observe(el);});\n" +
  "});\n" +
  "addReveal(document,'.teaser-viewall-wrap,#contact .contact-title,#contact .contact-email,#contact .contact-row','reveal',function(el){revealObs.observe(el);});";

swap(ANCHOR, ADDITION, 'landing cards, model thumbnails and contact block join the fade');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
