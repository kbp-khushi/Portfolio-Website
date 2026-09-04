import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const B64='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/base64/caesura';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,label)=>{ const c=html.split(s).length-1; if(c!==1) throw new Error(`${label}: expected 1 match, got ${c}`); return s; };
const swap=(o,n,label)=>{ once(o,label); html=html.replace(o,()=>n); console.log('[ok]',label); };

// 1) Flood Resilience — board crop, scaled up, baked label replaces the HTML caption
const floodTail='" alt="Flood Resilience diagram"><div class="img-caption" style="text-align:center;margin-top:6px">Flood Resilience</div>';
once(floodTail,'flood tail');
{
  const end=html.indexOf(floodTail);
  const srcOpen=html.lastIndexOf('src="',end);
  html = html.slice(0,srcOpen+5)
       + readFileSync(`${B64}/flood-resilience-board.txt`,'utf8').trim()
       + '" alt="Flood Resilience diagram" style="width:100%;display:block">'
       + html.slice(end+floodTail.length);
  console.log('[ok] flood image swapped, caption removed (label is baked into the board crop)');
}
swap('width:100%;margin-top:24px;max-width:360px;margin-left:auto;margin-right:auto',
     'width:100%;margin-top:24px;max-width:760px;margin-left:auto;margin-right:auto',
     'flood container 360 -> 760');

// 2) caption the Well-Being daylight + ventilation diagram
swap('alt="Daylight and Ventilation Diagram" style="width:100%;max-width:640px;display:block;margin:0 auto"></div>',
     'alt="Daylight and Ventilation Diagram" style="width:100%;max-width:640px;display:block;margin:0 auto"><div class="img-caption" style="text-align:right;max-width:640px;margin-left:auto;margin-right:auto">Daylight and ventilation</div></div>',
     'daylight and ventilation caption');

// 3) caption the Resources timber lifecycle diagram
swap('alt="Timber lifecycle carbon diagram" style="width:100%"></div>',
     'alt="Timber lifecycle carbon diagram" style="width:100%"><div class="img-caption" style="text-align:right">Timber lifecycle</div></div>',
     'timber lifecycle caption');

// 4) match the two interior render captions to the library pavilion one
swap('<div class="img-caption">Library and lounge interior</div>',
     '<div class="img-caption" style="text-align:right">Library and lounge interior</div>',
     'library interior caption right aligned');
swap('<div class="img-caption">Studio and gallery interior</div>',
     '<div class="img-caption" style="text-align:right">Studio and gallery interior</div>',
     'studio interior caption right aligned');

// 5) breathing room before Design for Ecosystems
swap('<div class="edit-row" id="pause-ecosystems">',
     '<div class="edit-row" id="pause-ecosystems" style="padding-top:88px">',
     'whitespace before ecosystems');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
