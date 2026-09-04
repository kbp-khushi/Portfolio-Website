import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const CA='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
const b64=n=>readFileSync(`${CA}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// under-label style: same type as the labels above the analytical charts
const cssAnchor='.dg-label{';
once(cssAnchor,'css anchor');
html=html.replace(cssAnchor,()=>'.dg-label-b{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-top:10px}\n'+cssAnchor);
console.log('[ok] dg-label-b style');

// swap an image and set its board label in type, in the same place
function relabel(alt, styleTail, width, text, blob) {
  const tail = `" alt="${alt}" style="${styleTail}">`;
  once(tail, `${alt} tail`);
  const end = html.indexOf(tail);
  const imgStart = html.lastIndexOf('<img', end);
  const srcOpen = html.indexOf('src="', imgStart);
  html = html.slice(0, imgStart)
       + `<div style="max-width:${width}px;margin:0 auto">`
       + html.slice(imgStart, srcOpen+5)
       + b64(blob)
       + `" alt="${alt}" style="width:100%;display:block"><div class="dg-label-b">${text}</div></div>`
       + html.slice(end + tail.length);
  console.log('[ok] relabelled', alt);
}

relabel('Site Ecology Diagram', 'width:100%;max-width:760px;display:block;margin:0 auto', 760,
        'Site Ecology Diagram', 'site-ecology-nolabel');
relabel('Daylight and Ventilation Diagram', 'width:100%;max-width:640px;display:block;margin:0 auto', 640,
        'Daylight and Ventilation Diagram', 'daylight-ventilation-nolabel');
relabel('Flood Resilience diagram', 'width:100%;display:block', 560,
        'Flood Resilience', 'flood-resilience-nolabel');

// timber lifecycle: tight crop, and its caption becomes a label in the same family
{
  const tail='" alt="Timber lifecycle carbon diagram" style="width:100%"><div class="img-caption" style="text-align:center">Timber lifecycle</div>';
  once(tail,'timber tail');
  const end=html.indexOf(tail);
  const imgStart=html.lastIndexOf('<img',end);
  const srcOpen=html.indexOf('src="',imgStart);
  html = html.slice(0,imgStart)
       + html.slice(imgStart,srcOpen+5) + b64('timber-lifecycle-tight')
       + '" alt="Timber lifecycle carbon diagram" style="width:100%;display:block"><div class="dg-label-b">Timber Lifecycle</div>'
       + html.slice(end+tail.length);
  console.log('[ok] timber lifecycle tightened and relabelled');
}

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
