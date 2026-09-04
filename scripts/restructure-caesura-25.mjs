import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const CA='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
const b64=n=>readFileSync(`${CA}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
function replaceSrc(tail, blob, label, newTail) {
  once(tail,label);
  const end=html.indexOf(tail);
  const srcOpen=html.lastIndexOf('src="',end);
  html = html.slice(0,srcOpen+5) + b64(blob) + (newTail ?? tail) + html.slice(end+tail.length);
  console.log('[ok]',label);
}

// section recut flush to the ground band, no notched corner
replaceSrc('" alt="Building Section"><div class="dg-label-b">Building Section</div>',
           'building-section-nolabel', 'building section reflowed');

// site ecology: the erase box had clipped the pool
replaceSrc('" alt="Site Ecology Diagram" style="width:100%;display:block">',
           'site-ecology-nolabel', 'site ecology pool restored');

// exploded axo: baked label painted out, set in type instead
replaceSrc('" alt="Exploded Axonometric" style="width:100%">',
           'exploded-axo-nolabel', 'exploded axo relabelled',
           '" alt="Exploded Axonometric" style="width:100%;display:block"><div class="dg-label-b">Exploded Assembly Axonometric</div>');

// room between the axo and the timber lifecycle diagram
once('<div style="width:100%;margin-top:16px">','axo/timber gap');
html=html.replace('<div style="width:100%;margin-top:16px">',()=>'<div style="width:100%;margin-top:56px">');
console.log('[ok] gap 16 -> 56');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
