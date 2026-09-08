import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// buttons under the hero headline
const anchor='<h1 class="hero-title"><span class="w-light">architecture</span> <span class="w-bold">portfolio</span></h1>';
once(anchor,'hero title');
html=html.replace(anchor,()=>anchor+`
      <div class="hero-actions">
        <a class="hero-btn" href="#work" onclick="document.querySelector('.work-teaser').scrollIntoView({behavior:'smooth',block:'start'});return false;">view work</a>
        <a class="hero-btn" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">view resume</a>
      </div>`);
console.log('[ok] hero buttons added');

// styling borrows the pill vocabulary already used by the project jump nav
const cssAnchor='.hero-eyebrow{';
once(cssAnchor,'hero css anchor');
html=html.replace(cssAnchor,()=>`.hero-actions{display:flex;gap:12px;margin-top:22px}
.hero-btn{font-family:var(--title);font-size:11px;font-weight:500;letter-spacing:1px;text-transform:uppercase;padding:10px 20px;border:1px solid var(--line);color:var(--text-light);text-decoration:none;transition:all .3s;cursor:pointer}
.hero-btn:hover{border-color:var(--accent);color:var(--text);background:rgba(0,0,0,0.05);transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
`+cssAnchor);
console.log('[ok] hero button style added');

// on mobile the hero row already stacks; keep the buttons from stretching
const mob='  .hero-row{grid-template-columns:1fr;justify-items:start;gap:12px;padding:0 24px 20px}';
once(mob,'hero mobile rule');
html=html.replace(mob,()=>mob+'\n  .hero-actions{margin-top:16px}\n  .hero-btn{padding:9px 16px}');
console.log('[ok] mobile sizing');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
