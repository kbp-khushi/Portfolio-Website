import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;

// place it directly after Caesura's intro, where a reviewer looking for
// technical depth will find it early rather than at the bottom of the page
const anchor='<!-- INTEGRATION (no text labels, already baked into image) -->';
if (html.split(anchor).length-1 !== 1) throw new Error('integration anchor not unique');

const block = `<div class="drawing-set">
    <div class="ds-set-note">
      <div class="dg-label">Technical Drawing Set</div>
      <p>A complete nineteen sheet set drawn at graduate level: life safety plan with occupancy and exit calculations, site and floor plans, elevations, building sections, wall sections and details, and a full structural package with foundation, framing and roof framing plans, structural sections and calculations.</p>
      <a class="dl-link" href="Caesura_Technical_Drawing_Set.pdf" target="_blank" rel="noopener" style="text-transform:none">View the drawing set (PDF, 19 sheets)</a>
    </div>
  </div>

  ${anchor}`;

html = html.replace(anchor, () => block);
console.log('[ok] drawing set block added to Caesura');

const cssAnchor='.contact-block{';
if (html.split(cssAnchor).length-1 !== 1) throw new Error('css anchor not unique');
html = html.replace(cssAnchor, () => `.drawing-set{padding:8px 60px 40px}
.ds-set-note{max-width:760px;border-left:2px solid var(--accent);padding-left:22px}
.ds-set-note p{font-size:15px;line-height:1.7;color:var(--text-light);margin:10px 0 14px}
@media(max-width:768px){.drawing-set{padding:8px 16px 32px}}
`+cssAnchor);
console.log('[ok] drawing set styles added');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
