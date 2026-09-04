import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const CA='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
const swap=(o,n,l)=>{once(o,l); html=html.replace(o,()=>n); console.log('[ok]',l);};

// 1) label above a centred diagram, aligned to the image's own left edge
function labelAbove(alt, width, text) {
  const tail = `" alt="${alt}" style="width:100%;max-width:${width}px;display:block;margin:0 auto">`;
  once(tail, `${alt} tail`);
  const end = html.indexOf(tail);
  const imgStart = html.lastIndexOf('<img', end);
  html = html.slice(0, imgStart)
       + `<div style="max-width:${width}px;margin:0 auto"><div class="dg-label">${text}</div>`
       + html.slice(imgStart, end)
       + `" alt="${alt}" style="width:100%;display:block"></div>`
       + html.slice(end + tail.length);
  console.log('[ok] label above', alt);
}

// diagram label style
const cssAnchor='.rv-room{';
once(cssAnchor,'css anchor');
html=html.replace(cssAnchor,()=>'.dg-label{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:10px}\n'+cssAnchor);
console.log('[ok] dg-label style');

// 2) swap the EUI chart for the version without its baked title, then label it
{
  const tail='" alt="Energy use intensity chart" style="width:100%;max-width:560px;display:block;margin:0 auto">';
  once(tail,'eui tail');
  const end=html.indexOf(tail);
  const srcOpen=html.lastIndexOf('src="',end);
  html = html.slice(0,srcOpen+5) + readFileSync(`${CA}/energy-eui-notitle.txt`,'utf8').trim() + html.slice(end);
  console.log('[ok] EUI chart recut without its baked title');
}

labelAbove('Water Metric', 560, 'Water Collection and Use');
labelAbove('Energy Budget', 560, 'Energy Generation and Demand');
labelAbove('Energy use intensity chart', 560, 'Energy Use Intensity (kBtu/sf/yr)');

// 3) flood resilience down to read at the site ecology diagram's scale
swap('width:100%;margin-top:24px;max-width:760px;margin-left:auto;margin-right:auto',
     'width:100%;margin-top:24px;max-width:560px;margin-left:auto;margin-right:auto',
     'flood 760 -> 560');

// 4) centre the timber lifecycle caption under its diagram
swap('<div class="img-caption" style="text-align:right">Timber lifecycle</div>',
     '<div class="img-caption" style="text-align:center">Timber lifecycle</div>',
     'timber caption centred');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
