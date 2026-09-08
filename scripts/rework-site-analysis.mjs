import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
const B = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/site-analysis';
const b64 = n => readFileSync(`${B}/${n}.txt`, 'utf8').trim();
let html = readFileSync(P, 'utf8');
const before = html.length;

// ---------------------------------------------------------------------------
// 1) rebuild the site analysis body: one of each photo, equal radius maps,
//    research moved behind a flipbook
// ---------------------------------------------------------------------------
const pageStart = html.indexOf('id="page-site-analysis"');
if (pageStart === -1) throw new Error('site analysis page missing');
const bodyOpen = html.indexOf('<div style="padding:0 60px">', pageStart);
const navAt = html.indexOf('<div class="project-nav"', pageStart);
if (bodyOpen === -1 || navAt === -1) throw new Error('site analysis body bounds not found');

const body = `<div style="padding:0 60px">
    <div class="pp-reveal" style="margin:0 auto 20px;max-width:1000px">
      <img loading="lazy" src="${b64('model-full')}" alt="Physical site model of North Charleston" style="width:100%;display:block">
      <div class="dg-label-b" style="text-align:center">Physical Site Model</div>
    </div>
    <div class="sa-row">
      <img loading="lazy" src="${b64('detail-1')}" alt="Intensity mapping at a civic anchor">
      <img loading="lazy" src="${b64('detail-2')}" alt="Threads tracing movement across the marsh edge">
      <img loading="lazy" src="${b64('detail-3')}" alt="Pinned density against the street grid">
      <img loading="lazy" src="${b64('detail-4')}" alt="Connections between anchors along the water">
    </div>
    <div class="dg-label-b" style="text-align:center;margin-bottom:56px">Mapping Movement Between Civic Anchors</div>
    <div class="sa-pair">
      <div><img loading="lazy" src="${b64('radius-2mile')}" alt="Two mile radius analysis" class="sa-radius"><div class="dg-label-b" style="text-align:center">Two Mile Radius</div></div>
      <div><img loading="lazy" src="${b64('radius-threequarter')}" alt="Three quarter mile radius analysis" class="sa-radius"><div class="dg-label-b" style="text-align:center">Three Quarter Mile Radius</div></div>
    </div>
    <div style="padding:44px 0 8px;text-align:center">
      <a class="dl-link" onclick="openFlipbook('site-analysis-research')" style="cursor:pointer">View Research</a>
    </div>
    <div id="boards-site-analysis-research" style="display:none">
      <img src="${b64('research-1')}" alt="Population density, zoning and flood extent research">
      <img src="${b64('research-2')}" alt="Crime grades, land use and district mapping">
    </div>
  </div>
  `;

html = html.slice(0, bodyOpen) + body + html.slice(navAt);
console.log('[ok] site analysis body rebuilt');

// ---------------------------------------------------------------------------
// 2) Camber drawings centred
// ---------------------------------------------------------------------------
{
  const camberStart = html.indexOf('id="page-camber"');
  const camberEnd = html.indexOf('</div>\n</div>', camberStart);
  let seg = html.slice(camberStart, camberEnd === -1 ? camberStart + 400000 : camberEnd);
  const count = (seg.match(/style="margin-bottom:44px;max-width:/g) || []).length;
  if (count !== 4) throw new Error(`expected 4 Camber drawings, found ${count}`);
  seg = seg.split('style="margin-bottom:44px;max-width:').join('style="margin:0 auto 44px;max-width:');
  html = html.slice(0, camberStart) + seg + html.slice(camberStart + seg.length);
  console.log('[ok] Camber drawings centred');
}

// ---------------------------------------------------------------------------
// 3) model thumbnails: 33px shorter each, so the Section Model label lines up
//    with the Caesura title beside it
// ---------------------------------------------------------------------------
const OLD_IMG = '.model-img{height:170px;';
if (html.split(OLD_IMG).length - 1 !== 1) throw new Error('model img rule not found');
html = html.replace(OLD_IMG, () => '.model-img{height:137px;');
console.log('[ok] model thumbnails reduced to 137px');

// ---------------------------------------------------------------------------
// 4) styles for the new rows
// ---------------------------------------------------------------------------
const CSS_ANCHOR = '.sa-pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:12px}';
if (html.split(CSS_ANCHOR).length - 1 !== 1) throw new Error('sa-pair css not found');
html = html.replace(CSS_ANCHOR, () => `.sa-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:0 auto 14px;max-width:1200px}
.sa-row img{width:100%;display:block}
.sa-radius{width:100%;height:420px;object-fit:contain;display:block}
@media(max-width:768px){.sa-row{grid-template-columns:1fr 1fr}.sa-radius{height:auto}}
${CSS_ANCHOR}`);
console.log('[ok] styles added');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
