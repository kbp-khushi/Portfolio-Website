import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const RV='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/revit';
const pos=JSON.parse(readFileSync(`${RV}/positions.json`,'utf8'));
const b64=n=>readFileSync(`${RV}/${n}.txt`,'utf8').trim();
let html=readFileSync(P,'utf8');
const before=html.length;

// room label above each drawing, styled like the section titles on Caesura
const anchorCss='.rv-figure{position:relative;max-width:1400px;margin:0 auto}';
if (html.split(anchorCss).length-1!==1) throw new Error('rv-figure css not unique');
html=html.replace(anchorCss, () =>
  '.rv-room{font-family:var(--title);font-size:14px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--accent);max-width:1400px;margin:0 auto 18px}\n'+anchorCss);
console.log('[ok] rv-room style added');

const LABELS={
  king:   { room:'King Guestroom',      alt:'King guestroom axonometric with custom Revit families called out',
    names:{'01':'Sculptural Headboard &amp; Bed','02':'Rolled Arm Sofa','03':'Double Arm Wall Sconce','04':'Tiered Wall Sconce','05':'Ribbed Dome Flush Mount'} },
  queen:  { room:'Queen Guestroom',     alt:'Queen guestroom axonometric with custom Revit families called out',
    names:{'01':'Sculptural Headboard &amp; Bed','02':'Round Nightstand','03':'Bolster Daybed','04':'Oval Wall Sconce','05':'Tiered Pendant'} },
  library:{ room:'Library',             alt:'Library axonometric with the custom millwork wall unit called out',
    names:{'01':'Custom Millwork Wall Unit'} },
  pdr:    { room:'Private Dining Room', alt:'Private dining room axonometric with the wine storage wall called out',
    names:{'01':'Wine Storage Wall'} },
};
const figures=Object.entries(LABELS).map(([key,d])=>{
  const nums=pos[key].map(p=>`      <span class="rv-num" style="${p.anchor};${p.top}">${p.num}</span>`).join('\n');
  const rows=pos[key].map(p=>`        <div><span class="rv-key-num">${p.num}</span>${d.names[p.num]}</div>`).join('\n');
  return `  <div class="edit-full" style="padding-top:48px;padding-bottom:48px">
    <div class="rv-room">${d.room}</div>
    <div class="rv-figure">
      <img loading="lazy" src="${b64(key)}" alt="${d.alt}">
${nums}
    </div>
    <div class="rv-key">
      <div class="rv-key-inner">
        <div class="rv-key-title">Legend</div>
${rows}
      </div>
    </div>
  </div>`;
}).join('\n');

const pageStart=html.indexOf('id="page-professional-work"');
const figStart=html.indexOf('<div class="edit-full" style="padding-top:48px;padding-bottom:48px">', pageStart);
const figEnd=html.indexOf('<footer class="footer"', figStart);
const removed=html.slice(figStart,figEnd);
if ((removed.match(/class="rv-figure"/g)||[]).length!==4) throw new Error('expected 4 figures');
html=html.slice(0,figStart)+figures+'\n  '+html.slice(figEnd);
writeFileSync(P,html);
console.log('[ok] room labels added, key headers -> Legend');
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
