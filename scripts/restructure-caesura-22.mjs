import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const CA='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
const b64=n=>readFileSync(`${CA}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
const swap=(o,n,l)=>{once(o,l); html=html.replace(o,()=>n); console.log('[ok]',l);};
function replaceSrc(tail, blob, label, newTail) {
  once(tail, label);
  const end=html.indexOf(tail);
  const srcOpen=html.lastIndexOf('src="',end);
  html = html.slice(0,srcOpen+5) + b64(blob) + (newTail ?? tail) + html.slice(end+tail.length);
  console.log('[ok]', label);
}

// A) building section: baked label cloned out, set in type underneath
replaceSrc('" alt="Building Section"></div>', 'building-section-nolabel', 'building section swap',
  '" alt="Building Section"><div class="dg-label-b">Building Section</div></div>');

// B) label the pavilion render beside Design for Discovery
swap('alt="Pavilion" style="width:100%"></div>',
     'alt="Pavilion" style="width:100%"><div class="img-caption" style="text-align:right">Open air pavilion along the boardwalk</div></div>',
     'discovery render caption');

// C) jump nav: the section titles already say Design for
{
  const start=html.indexOf('id="page-the-pause"');
  const end=html.indexOf('</div>', html.indexOf('cote-links', start));
  let nav=html.slice(start,end);
  const n=(nav.match(/>Design for /g)||[]).length;
  if (n!==10) throw new Error(`expected 10 nav links, found ${n}`);
  html = html.slice(0,start) + nav.split('>Design for ').join('>') + html.slice(end);
  console.log('[ok] stripped "Design for" from', n, 'nav buttons');
}

// D) economy map cropped in, with the board's own heading above the pair
{
  const tail='" alt="Regional Sourcing" style="width:100%;max-width:660px;display:block;margin:0 auto">';
  once(tail,'economy map');
  const end=html.indexOf(tail);
  const imgStart=html.lastIndexOf('<img',end);
  const srcOpen=html.indexOf('src="',imgStart);
  html = html.slice(0,imgStart)
       + '<div class="dg-label" style="max-width:660px;margin:0 auto 10px">Resources Proximity Map</div>'
       + html.slice(imgStart,srcOpen+5) + b64('regional-map-tight')
       + tail + html.slice(end+tail.length);
  console.log('[ok] economy map cropped in and labelled');
}

// E) floor plans: the board block, room keys and pavilion titles included
replaceSrc('" alt="Floor Plan" style="width:100%;max-width:640px;display:block;margin:0 auto">', 'floor-plans-board', 'floor plans swap');

// F) ecosystems icons: serif captions cropped off, reset in type
{
  const tail='" alt="Ecosystem Diagram" style="width:100%;max-width:760px;display:block;margin:0 auto">';
  once(tail,'ecosystem icons tail');
  const end=html.indexOf(tail);
  const imgStart=html.lastIndexOf('<img',end);
  const srcOpen=html.indexOf('src="',imgStart);
  const labels=['100% Native Plantings','92% Tree Canopy Coverage','100% Permeable Surfaces']
    .map(t=>`<div>${t}</div>`).join('');
  html = html.slice(0,imgStart)
       + '<div style="max-width:760px;margin:0 auto">'
       + html.slice(imgStart,srcOpen+5) + b64('ecosystem-icons-notext')
       + '" alt="Ecosystem Diagram" style="width:100%;display:block">'
       + `<div class="eco-metrics">${labels}</div></div>`
       + html.slice(end+tail.length);
  console.log('[ok] ecosystem icons reset in type');
}
{
  const anchor='.dg-label-b{';
  once(anchor,'eco css anchor');
  html=html.replace(anchor,()=>'.eco-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px;font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);text-align:center}\n'+anchor);
  console.log('[ok] eco-metrics style');
}

// G) timber lifecycle: it did not need to grow, and its label belongs centred
swap('" alt="Timber lifecycle carbon diagram" style="width:100%;display:block"><div class="dg-label-b">Timber Lifecycle</div>',
     '" alt="Timber lifecycle carbon diagram" style="width:100%;max-width:620px;display:block;margin:0 auto"><div class="dg-label-b" style="text-align:center;max-width:620px;margin-left:auto;margin-right:auto">Timber Lifecycle</div>',
     'timber size and centred label');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
