import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// ---- 1) a stacked pair of model cards, between Caesura and Woven Edge ------
const anchor=`    <div class="project-card" onclick="openProject('woven-edge')">`;
once(anchor,'woven edge card');
const pair=`    <div class="model-stack">
      <div class="model-card" onclick="openProject('massing-model')">
        <img class="model-img" data-slug="massing-model" loading="lazy" alt="Massing model for Caesura">
        <div class="model-body"><span class="model-title">Massing Model</span><span class="model-sub">Caesura &middot; site &amp; form study</span></div>
      </div>
      <div class="model-card" onclick="openProject('section-model')">
        <img class="model-img" data-slug="section-model" loading="lazy" alt="Section model for Caesura">
        <div class="model-body"><span class="model-title">Section Model</span><span class="model-sub">Caesura &middot; structure &amp; envelope</span></div>
      </div>
    </div>
`;
html=html.replace(anchor,()=>pair+anchor);
console.log('[ok] model cards placed with Caesura');

// ---- 2) let the image populator fill any data-slug image -------------------
once(`document.querySelectorAll('.stack-img[data-slug]')`,'populator selector');
html=html.replace(`document.querySelectorAll('.stack-img[data-slug]')`,
                  `document.querySelectorAll('img[data-slug]')`);
console.log('[ok] populator now fills the model thumbnails too');

// ---- 3) styles -------------------------------------------------------------
once('.contact-block{','css anchor');
html=html.replace('.contact-block{',`.model-stack{display:flex;flex-direction:column;gap:24px}
.model-card{cursor:pointer}
.model-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--line);transition:transform .6s cubic-bezier(.22,1,.36,1)}
.model-card:hover .model-img{transform:scale(1.03)}
.model-body{padding:10px 0 0;display:flex;flex-direction:column;gap:2px}
.model-title{font-family:var(--title);font-size:15px;font-weight:700;position:relative;display:inline-block;width:fit-content}
.model-title::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--text);transition:width .3s}
.model-card:hover .model-title::after{width:100%}
.model-sub{font-size:12px;color:var(--text-light)}
.contact-block{`);
console.log('[ok] model card styles');

// ---- 4) link to both models from Caesura, under the massing studies --------
{
  const i=html.indexOf('id="page-the-pause"');
  const massing=html.indexOf('pause-massing', i);
  if(massing===-1) throw new Error('massing row not found');
  const close=html.indexOf('\n  </div>', massing);
  if(close===-1) throw new Error('massing row close not found');
  const links=`
    <div class="model-links">
      <a onclick="closeProject();setTimeout(function(){openProject('massing-model');},80)">View the massing model</a>
      <a onclick="closeProject();setTimeout(function(){openProject('section-model');},80)">View the section model</a>
    </div>`;
  html = html.slice(0, close) + links + html.slice(close);
  console.log('[ok] model links added under the massing studies');
}
once('.model-stack{','model css');
html=html.replace('.model-stack{',`.model-links{display:flex;flex-wrap:wrap;gap:12px 28px;padding:24px 60px 0}
.model-links a{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);cursor:pointer;text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:3px;transition:border-color .3s,color .3s}
.model-links a:hover{color:var(--text);border-color:var(--accent)}
@media(max-width:768px){.model-links{padding:20px 16px 0}}
.model-stack{`);
console.log('[ok] model link styles');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
