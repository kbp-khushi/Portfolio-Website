import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
const swap=(o,n,l)=>{once(o,l); html=html.replace(o,()=>n); console.log('[ok]',l);};

// ---- 1) drop the ARE line --------------------------------------------------
swap(`\n      <div class="about-lic-item">ARE Exams: 0 / 6 divisions passed</div>`, '', 'ARE line removed');

// ---- 2) generative tools: a capability sentence, not a tool list ------------
{
  const start=html.indexOf('<div class="group-label">generative tools</div>');
  if(start===-1) throw new Error('generative tools block not found');
  const end=html.indexOf('</div>', html.indexOf('about-ai-note', start))+6;
  const block=html.slice(start,end);
  if(!block.includes('ComfyUI')) throw new Error('unexpected generative tools block');
  html = html.slice(0,start)
    + `<div class="group-label">generative tools</div>
          <div class="about-ai-note" style="margin-top:10px">I use ComfyUI in a controlled workflow over my own modelled views for atmosphere studies, and Claude Code to build and maintain this site and Rose Architects&rsquo;. ChatGPT, Gemini and DALL&middot;E sit alongside those for research, writing and quick visual tests.</div>`
    + html.slice(end);
  console.log('[ok] generative tools reframed as a sentence');
}

// ---- 3) project type on the two graduate project pages ---------------------
function addType(pageId, value, label){
  const i=html.indexOf(`id="${pageId}"`);
  const nextPage=html.indexOf('id="page-', i+10);
  const anchor='<div class="pp-meta-row"><div class="pp-meta-label">Location</div>';
  const at=html.indexOf(anchor, i);
  if(at===-1 || (nextPage>-1 && at>nextPage)) throw new Error(label+': location row not inside this page');
  html = html.slice(0,at)
    + `<div class="pp-meta-row"><div class="pp-meta-label">Project Type</div><div class="pp-meta-value">${value}</div></div>
      `
    + html.slice(at);
  console.log('[ok]', label);
}
addType('page-the-pause','Mass Timber','Caesura project type');
addType('page-woven-edge','Urban Design','Woven Edge project type');

// ---- 4) Professional Work joins Selected Work on the landing page ----------
{
  const stackEnd=html.indexOf('</div>\n  </div>', html.indexOf('class="work-stack"'));
  const marker='<div class="stack-item" onclick="openProject(\'woven-edge\')">';
  once(marker,'woven edge stack item');
  const wovenStart=html.indexOf(marker);
  const wovenEnd=html.indexOf('\n    </div>', html.indexOf('stack-facts', wovenStart));
  const closeAt=html.indexOf('</div>', wovenEnd)+6;
  const item=`
    <div class="stack-item" onclick="openProject('professional-work')">
      <img class="stack-img" data-slug="professional-work" alt="Axonometric of a king guestroom with the custom Revit families called out">
      <div class="stack-info">
        <div class="stack-title">Custom Revit Families</div>
        <div class="stack-facts">
          <div class="stack-fact"><span class="fact-label">Project Type</span><span class="fact-value">Hospitality, Professional</span></div>
          <div class="stack-fact"><span class="fact-label">Year</span><span class="fact-value">2026</span></div>
          <div class="stack-fact"><span class="fact-label">Office</span><span class="fact-value">The Johnson Studio at Cooper Carry</span></div>
        </div>
      </div>
    </div>`;
  html = html.slice(0, closeAt) + item + html.slice(closeAt);
  console.log('[ok] professional work added to the selected work stack');
}

// ---- 5) contact section at the end of About --------------------------------
swap(`      <div class="group-label" style="margin-top:48px">licensure</div>`,
     `      <div class="group-label" style="margin-top:48px">licensure</div>`,
     'licensure anchor intact');
{
  const anchor='<div class="about-lic-item">AXP Hours: 1,336.25 / 3,740 (35.7% complete)</div>';
  once(anchor,'AXP line');
  const at=html.indexOf(anchor)+anchor.length;
  const contact=`

      <div class="contact-block" id="contact">
        <div class="group-label">contact</div>
        <a class="contact-email" href="mailto:kbp.khushi@gmail.com">kbp.khushi@gmail.com</a>
        <div class="contact-row">
          <a href="https://www.linkedin.com/in/kbp-khushi" target="_blank" rel="noopener">linkedin.com/in/kbp-khushi</a>
          <span>Savannah, GA / Atlanta, GA</span>
          <a href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">resume (PDF)</a>
        </div>
      </div>`;
  html = html.slice(0,at) + contact + html.slice(at);
  console.log('[ok] contact block added to About');
}
{
  const cssAnchor='.dg-label{';
  once(cssAnchor,'css anchor');
  html=html.replace(cssAnchor,()=>`.contact-block{margin-top:64px;padding-top:32px;border-top:1px solid var(--line)}
.contact-email{display:inline-block;margin-top:14px;font-family:var(--title);font-size:clamp(24px,3vw,36px);font-weight:700;color:var(--text);text-decoration:none;position:relative}
.contact-email::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--text);transition:width .3s}
.contact-email:hover::after{width:100%}
.contact-row{display:flex;flex-wrap:wrap;gap:8px 32px;margin-top:20px;font-size:14px;color:var(--text-light)}
.contact-row a{color:var(--text-light);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:2px;transition:color .3s,border-color .3s}
.contact-row a:hover{color:var(--text);border-color:var(--accent)}
`+cssAnchor);
  console.log('[ok] contact styles added');
}

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
