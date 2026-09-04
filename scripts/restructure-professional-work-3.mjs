import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const RV='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/revit';
const CA='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
const pos=JSON.parse(readFileSync(`${RV}/positions.json`,'utf8'));
const b64=(dir,n)=>readFileSync(`${dir}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};

// --- A) Caesura: board crop for the daylight + ventilation diagram ----------
const dvTail='" alt="Daylight and Ventilation Diagram" style="width:100%;max-width:640px;display:block;margin:0 auto"><div class="img-caption" style="text-align:right;max-width:640px;margin-left:auto;margin-right:auto">Daylight and ventilation</div>';
once(dvTail,'daylight tail');
{
  const end=html.indexOf(dvTail);
  const srcOpen=html.lastIndexOf('src="',end);
  html = html.slice(0,srcOpen+5) + b64(CA,'daylight-ventilation-board')
       + '" alt="Daylight and Ventilation Diagram" style="width:100%;max-width:640px;display:block;margin:0 auto">'
       + html.slice(end+dvTail.length);
  console.log('[ok] daylight diagram recut from board (label baked in, HTML caption removed)');
}

// --- B) rv-num gets a ground so numbers never sit on a leader line ----------
const numCss='.rv-num{position:absolute;font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--text);margin-top:6px}';
once(numCss,'rv-num css');
html=html.replace(numCss,()=>'.rv-num{position:absolute;font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;color:var(--text);margin-top:6px;background:var(--bg);padding:1px 4px;line-height:1.2}');
console.log('[ok] rv-num background');

// --- C) rebuild the four figures on the trimmed drawings --------------------
const LABELS={
  king:   { room:'King Guestroom',       alt:'King guestroom axonometric with custom Revit families called out',
    names:{'01':'Sculptural Headboard &amp; Bed','02':'Rolled Arm Sofa','03':'Double Arm Wall Sconce','04':'Tiered Wall Sconce','05':'Ribbed Dome Flush Mount'} },
  queen:  { room:'Queen Guestroom',      alt:'Queen guestroom axonometric with custom Revit families called out',
    names:{'01':'Sculptural Headboard &amp; Bed','02':'Round Nightstand','03':'Bolster Daybed','04':'Oval Wall Sconce','05':'Tiered Pendant'} },
  library:{ room:'Library',              alt:'Library axonometric with the custom millwork wall unit called out',
    names:{'01':'Custom Millwork Wall Unit'} },
  pdr:    { room:'Private Dining Room',  alt:'Private dining room axonometric with the wine storage wall called out',
    names:{'01':'Wine Storage Wall'} },
};
const figures=Object.entries(LABELS).map(([key,d])=>{
  const nums=pos[key].map(p=>`      <span class="rv-num" style="${p.anchor};${p.top}">${p.num}</span>`).join('\n');
  const rows=pos[key].map(p=>`        <div><span class="rv-key-num">${p.num}</span>${d.names[p.num]}</div>`).join('\n');
  return `  <div class="edit-full" style="padding-top:48px;padding-bottom:48px">
    <div class="rv-figure">
      <img loading="lazy" src="${b64(RV,key)}" alt="${d.alt}">
${nums}
    </div>
    <div class="rv-key">
      <div class="rv-key-inner">
        <div class="rv-key-title">${d.room}</div>
${rows}
      </div>
    </div>
  </div>`;
}).join('\n');

const pageStart=html.indexOf('id="page-professional-work"');
const figStart=html.indexOf('<div class="edit-full" style="padding-top:48px;padding-bottom:48px">', pageStart);
const figEnd=html.indexOf('<footer class="footer"', figStart);
if (figStart===-1||figEnd===-1) throw new Error('figure block bounds not found');
const removed=html.slice(figStart,figEnd);
if ((removed.match(/class="rv-figure"/g)||[]).length!==4) throw new Error('expected 4 figures');
html=html.slice(0,figStart)+figures+'\n  '+html.slice(figEnd);
console.log('[ok] four figures rebuilt on trimmed drawings');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
