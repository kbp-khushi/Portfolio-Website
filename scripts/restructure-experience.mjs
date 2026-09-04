import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
const swap=(o,n,l)=>{once(o,l); html=html.replace(o,()=>n); console.log('[ok]',l);};

// ---- markup: header row becomes a left meta column -------------------------
const re=/<div class="exp-header"><div><div class="exp-role">([\s\S]*?)<\/div><div class="exp-company">([\s\S]*?)<\/div><\/div><div class="exp-year">([\s\S]*?)<\/div><\/div>/g;
const found=[...html.matchAll(re)];
if (found.length!==4) throw new Error(`expected 4 experience entries, found ${found.length}`);
html=html.replace(re,(_,role,company,year)=>
  `<div class="exp-meta"><div class="exp-role">${role}</div><div class="exp-company">${company}</div><div class="exp-year">${year}</div></div>`);
console.log('[ok] restructured', found.length, 'entries into a meta column');

// ---- css: two columns, capped measure, rule separated entries --------------
swap('.resume-grid{display:grid;grid-template-columns:1fr;gap:56px}',
     '.resume-grid{display:grid;grid-template-columns:1fr;gap:56px;max-width:1120px}',
     'resume grid measure capped');
swap('.exp-item{margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid var(--line)}',
     '.exp-item{display:grid;grid-template-columns:260px 1fr;gap:56px;align-items:start;padding:36px 0;border-bottom:1px solid var(--line)}',
     'exp-item two columns');
swap('.exp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}',
     '.exp-meta{display:flex;flex-direction:column;gap:4px}',
     'exp-meta column');
swap('.exp-role{font-family:var(--title);font-size:20px;font-weight:700}',
     '.exp-role{font-family:var(--title);font-size:19px;font-weight:700;line-height:1.3}',
     'exp-role');
swap('.exp-company{font-size:14px;color:var(--accent);margin-top:2px}',
     '.exp-company{font-size:14px;color:var(--accent)}',
     'exp-company');
swap('.exp-year{font-family:var(--title);font-size:13px;font-weight:500;color:var(--text-light);flex-shrink:0}',
     '.exp-year{font-family:var(--title);font-size:13px;font-weight:500;color:var(--text-light)}',
     'exp-year');
swap('.exp-points{list-style:none;display:flex;flex-direction:column;gap:8px}',
     '.exp-points{list-style:none;display:flex;flex-direction:column}',
     'exp-points');
swap('.exp-points li{font-size:14px;line-height:1.6;color:var(--text-light);padding-left:16px;position:relative}',
     '.exp-points li{font-size:15px;line-height:1.65;color:var(--text);padding:16px 0;border-top:1px solid var(--line)}\n.exp-points li:first-child{border-top:none;padding-top:0}',
     'exp-points entries rule separated');
swap('.exp-points li::before{content:\'\';position:absolute;left:0;top:10px;width:6px;height:1px;background:var(--accent)}',
     '',
     'dash markers removed');

// ---- mobile: stack ---------------------------------------------------------
swap('  .resume-grid{grid-template-columns:1fr}',
     '  .resume-grid{grid-template-columns:1fr}\n  .exp-item{grid-template-columns:1fr;gap:16px;padding:28px 0}',
     'mobile stack');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
