import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const WV='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/woven';
const b64=n=>readFileSync(`${WV}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// three habitat blocks, each labelled the way Khushi's own copy names them
const BLOCKS=[
  ['oyster-reef','Oyster Reef and Tidal Flat'],
  ['marsh','Marsh'],
  ['maritime-forest','Maritime Forest'],
];
const figures = BLOCKS.map(([blob,label],i)=>
`        <div style="max-width:340px;margin:${i? '32px auto 0':'0 auto'}">
          <img loading="lazy" src="${b64(blob)}" alt="${label}" style="width:100%;display:block">
          <div class="dg-label-b">${label}</div>
        </div>`).join('\n');

{
  const tail='" alt="Ecosystems and Integration">';
  once(tail,'woven ecosystems tail');
  const end=html.indexOf(tail);
  const imgStart=html.lastIndexOf('<img',end);
  html = html.slice(0,imgStart) + figures.trimStart() + html.slice(end+tail.length);
  console.log('[ok] habitat stack split into three labelled blocks');
}

// economy sourcing map, a touch smaller
for (const s of ['max-width:660px;display:block;margin:0 auto','max-width:660px;margin:0 auto 10px','max-width:660px;display:block;margin:28px auto 0']) {
  once(s,`map width ${s.slice(0,28)}`);
  html=html.replace(s,()=>s.replace('660px','560px'));
}
console.log('[ok] sourcing map and legend 660 -> 560');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
