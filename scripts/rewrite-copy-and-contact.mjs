import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// ---- 1) Custom Revit Families leaves the Selected Work stack ---------------
{
  const start=html.indexOf(`    <div class="stack-item" onclick="openProject('professional-work')">`);
  if(start===-1) throw new Error('professional work stack item not found');
  const end=html.indexOf('</div>\n    </div>', start);
  if(end===-1) throw new Error('stack item close not found');
  html = html.slice(0,start) + html.slice(end+'</div>\n    </div>'.length+1);
  console.log('[ok] removed Custom Revit Families from Selected Work');
}

// ---- 2) approved project rewrites -----------------------------------------
function rewrite(pageId, text, label){
  const i=html.indexOf(`id="${pageId}"`);
  const open='<div class="pp-description">';
  const at=html.indexOf(open, i);
  const nextPage=html.indexOf('id="page-', i+10);
  if(at===-1 || (nextPage>-1 && at>nextPage)) throw new Error(`${label}: description not found in page`);
  const close=html.indexOf('</div>', at);
  html = html.slice(0, at+open.length) + text + html.slice(close);
  console.log('[ok] rewrote', label);
}

rewrite('page-fluke',
`A research and observation center for the North Atlantic right whale, on the river outside Savannah. The building keeps a small footprint and sits low against the bank, so you arrive through the landscape rather than across a parking lot. Its form comes from the whale&rsquo;s fluke: sweeping curves read as one continuous surface, cut open where the building meets the water. Materials are locally sourced and include recycled metal.`,
'Fluke');

rewrite('page-laker',
`A school for young children in Pristina, drawing on Kosovar building culture and on what child development research says about how children use space. The plan began as a set of abstract blocks and became one curving form, turned so its long face runs east to west and the classrooms take the best daylight.`,
'Lak\u00ebr');

rewrite('page-drodel',
`A house for twins, designed from the sensations in Poe&rsquo;s <em>The Fall of the House of Usher</em> rather than from a program. The study breaks the building into separate layers, each a complete composition on its own, then sets them in register so that moving past them changes what lines up. What I was testing is whether several perspectives can occupy one composition without collapsing into a single reading. Chipboard, laser cut and hand cut.`,
'Drodel');

rewrite('page-dreamscape',
`An archive for dreams, designed in Lacoste during my study abroad in Provence. The program is deliberately impossible, which is what made it worth doing: a building to hold the one thing that does not survive being held. The curves of the wall and roof carry that idea. You enter through a compressed opening and come out into an open interior, so the sequence works the way a dream does, hard to get into and completely free once you are there.`,
'Dreamscape');

// ---- 3) contact button in the hero ----------------------------------------
swapHero();
function swapHero(){
  const o=`        <a class="hero-btn" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">view resume</a>`;
  once(o,'hero resume button');
  html=html.replace(o,()=>o+`
        <a class="hero-btn" href="#contact" onclick="showView('about');setTimeout(function(){document.getElementById('contact').scrollIntoView({block:'start'});},80);return false;">contact me</a>`);
  console.log('[ok] contact me button added to the hero');
}

// ---- 4) make the contact block read as its own area ------------------------
{
  const o=`      <div class="contact-block" id="contact">
        <div class="group-label">contact</div>`;
  once(o,'contact block head');
  html=html.replace(o,`      <div class="contact-block" id="contact">
        <h2 class="contact-title">contact</h2>`);
  console.log('[ok] contact heading promoted');
}
{
  const o=`.contact-block{margin-top:64px;padding-top:32px;border-top:1px solid var(--line)}`;
  once(o,'contact block css');
  html=html.replace(o,`.contact-block{margin-top:96px;padding:44px 0 8px;border-top:2px solid var(--text)}
.contact-title{font-family:var(--title);font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin:0}
.contact-block .contact-row{margin-top:24px;padding-top:20px;border-top:1px solid var(--line)}`);
  console.log('[ok] contact block reads as its own area');
}
{
  const o=`.contact-email{display:inline-block;margin-top:14px;`;
  once(o,'contact email css');
  html=html.replace(o,`.contact-email{display:inline-block;margin-top:18px;`);
  console.log('[ok] contact email spacing');
}

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
