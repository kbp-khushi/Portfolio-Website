import fs from 'fs';
// Adds a built in PDF viewer (modelled on the one Khushi designed for mann.rodeo,
// restyled to this site) and points the resume and Caesura drawing set links at it.
const FILE = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(FILE, 'utf8');
const count = (s) => html.split(s).length - 1;
function swap(from, to, expected) {
  const n = count(from);
  if (n !== expected) throw new Error(`expected ${expected} of: ${from.slice(0, 80)} found ${n}`);
  html = html.split(from).join(to);
}

const CSS = `/* PDF VIEWER: resume and drawing set open in place instead of a new tab.
   PDF.js loads from cdnjs the first time a PDF is opened. */
.pdfv{position:fixed;inset:0;z-index:400;visibility:hidden;pointer-events:none;transition:visibility 0s .45s}
.pdfv.open{visibility:visible;pointer-events:auto;transition:visibility 0s 0s}
.pdfv-scrim{position:absolute;inset:0;background:rgba(42,42,42,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;transition:opacity .35s cubic-bezier(.33,1,.68,1)}
.pdfv.open .pdfv-scrim{opacity:1}
.pdfv-win{position:absolute;inset:26px 34px;display:grid;grid-template-rows:auto 2px 1fr;background:var(--white);border:1px solid var(--line);box-shadow:0 40px 90px -30px rgba(0,0,0,.45);opacity:0;transform:translateY(16px) scale(.985);transition:opacity .35s cubic-bezier(.33,1,.68,1),transform .45s cubic-bezier(.33,1,.68,1)}
.pdfv.open .pdfv-win{opacity:1;transform:none}
.pdfv-bar{display:flex;align-items:center;gap:16px;padding:12px 14px 12px 20px;border-bottom:1px solid var(--line);min-width:0}
.pdfv-title{min-width:0;margin-right:auto}
.pdfv-title small{display:block;font-family:var(--title);font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--text-light);margin-bottom:2px}
.pdfv-title strong{display:block;font-family:var(--title);font-size:17px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pdfv-pager{display:flex;align-items:center;gap:8px}
.pdfv-pager output{font-family:var(--title);font-size:12px;font-weight:500;color:var(--text-light);font-variant-numeric:tabular-nums;min-width:84px;text-align:center;white-space:nowrap}
.pdfv-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:var(--white);border:1px solid var(--line);color:var(--text);cursor:pointer;transition:border-color .2s,background .2s,color .2s,opacity .2s}
.pdfv-icon svg{width:14px;height:14px;display:block}
.pdfv-icon:hover{border-color:var(--accent)}
.pdfv-icon:disabled{opacity:.3;cursor:default;border-color:var(--line)}
.pdfv-sep{width:1px;height:22px;background:var(--line)}
.pdfv-zoom{display:flex;border:1px solid var(--line)}
.pdfv-zoom button{font-family:var(--title);font-size:10.5px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-light);background:none;border:none;padding:8px 11px;cursor:pointer;transition:background .2s,color .2s}
.pdfv-zoom button[aria-pressed="true"]{background:var(--accent);color:var(--white)}
.pdfv-dl{position:static!important;padding:9px 16px!important;font-size:11px!important}
.pdfv-progress{background:var(--line)}
.pdfv-progress i{display:block;height:100%;width:0;background:var(--accent);transition:width .15s linear}
.pdfv-body{display:grid;grid-template-columns:112px 1fr;min-height:0}
.pdfv.no-rail .pdfv-body{grid-template-columns:1fr}
.pdfv.no-rail .pdfv-rail{display:none}
.pdfv-rail{overflow-y:auto;border-right:1px solid var(--line);padding:18px 12px;display:flex;flex-direction:column;gap:16px;align-items:center;overscroll-behavior:contain}
.pdfv-thumb{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%}
.pdfv-thumb canvas,.pdfv-thumb .pdfv-ph{width:80px;display:block;background:#fff;box-shadow:0 0 0 1px var(--line);outline:2px solid transparent;outline-offset:3px;transition:outline-color .2s}
.pdfv-thumb span{font-family:var(--title);font-size:10px;font-weight:600;color:var(--text-light)}
.pdfv-thumb:hover canvas{outline-color:var(--line)}
.pdfv-thumb.on canvas,.pdfv-thumb:focus-visible canvas{outline-color:var(--accent)}
.pdfv-thumb.on span{color:var(--text)}
.pdfv-pages{position:relative;overflow:auto;background:#F2F2F2;padding:28px 28px 40px;display:flex;flex-direction:column;align-items:center;gap:26px;overscroll-behavior:contain}
.pdfv-sheet{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto}
.pdfv-page{position:relative;background:#fff;box-shadow:0 20px 50px -24px rgba(0,0,0,.35)}
.pdfv-page canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.pdfv-page:not(.drawn){background:linear-gradient(100deg,#fff 40%,#F7F7F7 50%,#fff 60%) 0 0/300% 100%;animation:pdfvShimmer 1.4s linear infinite}
@keyframes pdfvShimmer{to{background-position:-150% 0}}
.pdfv-sheet span{font-family:var(--title);font-size:10px;font-weight:600;letter-spacing:.1em;color:var(--text-light)}
.pdfv-msg{margin:auto;max-width:360px;text-align:center;font-size:14px;line-height:1.7;color:var(--text-light)}
.pdfv-msg a{color:var(--text)}
.pdfv-rail,.pdfv-pages{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.22) transparent}
.pdfv-rail::-webkit-scrollbar,.pdfv-pages::-webkit-scrollbar{width:8px;height:8px}
.pdfv-rail::-webkit-scrollbar-thumb,.pdfv-pages::-webkit-scrollbar-thumb{background:rgba(0,0,0,.22)}
.pdfv-rail::-webkit-scrollbar-track,.pdfv-pages::-webkit-scrollbar-track{background:transparent}
@media(max-width:820px){
  .pdfv-win{inset:0;border:none}
  .pdfv-body{grid-template-columns:1fr}.pdfv-rail{display:none}
  .pdfv-zoom,.pdfv-sep{display:none}
  .pdfv-bar{gap:8px;padding:10px 10px 10px 16px}
  .pdfv-title strong{font-size:15px}
  .pdfv-pager{gap:4px}.pdfv-pager output{min-width:52px;font-size:11px}
  .pdfv-dl{padding:0!important;width:34px;height:34px;justify-content:center;gap:0!important;font-size:0!important;letter-spacing:0!important}
  .pdfv-pages{padding:16px 12px calc(28px + env(safe-area-inset-bottom));gap:16px}
}
@media(prefers-reduced-motion:reduce){.pdfv-page:not(.drawn){animation:none}}
`;

const MARKUP = `<!-- PDF VIEWER -->
<div class="pdfv" id="pdfv" aria-hidden="true">
  <div class="pdfv-scrim" data-pdfv-close></div>
  <div class="pdfv-win" role="dialog" aria-modal="true" aria-labelledby="pdfv-name">
    <div class="pdfv-bar">
      <div class="pdfv-title"><small id="pdfv-label"></small><strong id="pdfv-name"></strong></div>
      <div class="pdfv-pager">
        <button class="pdfv-icon" id="pdfv-prev" type="button" aria-label="Previous page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>
        <output id="pdfv-count" aria-live="polite"></output>
        <button class="pdfv-icon" id="pdfv-next" type="button" aria-label="Next page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>
      </div>
      <div class="pdfv-sep"></div>
      <div class="pdfv-zoom" role="group" aria-label="Page size"><button type="button" data-fit="width" aria-pressed="true">Fit width</button><button type="button" data-fit="page" aria-pressed="false">Fit page</button></div>
      <a class="we-boards-btn pdfv-dl" id="pdfv-dl" download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>Download</a>
      <button class="pdfv-icon" type="button" data-pdfv-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="pdfv-progress"><i id="pdfv-bar"></i></div>
    <div class="pdfv-body">
      <div class="pdfv-rail" id="pdfv-rail" aria-label="Pages"></div>
      <div class="pdfv-pages" id="pdfv-pages" tabindex="-1"></div>
    </div>
  </div>
</div>
<script>
(function(){
  var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var v=document.getElementById('pdfv'),pagesEl=document.getElementById('pdfv-pages'),rail=document.getElementById('pdfv-rail');
  var countEl=document.getElementById('pdfv-count'),barEl=document.getElementById('pdfv-bar');
  var prev=document.getElementById('pdfv-prev'),next=document.getElementById('pdfv-next');
  var libPromise=null,doc=null,task=null,sheets=[],thumbs=[],cur=1,fit='width',maxW=0,opener=null,token=0,io=null,tio=null;
  function loadLib(){
    if(!libPromise)libPromise=new Promise(function(res,rej){var s=document.createElement('script');s.src=PDFJS+'pdf.min.js';s.onload=function(){pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';res(pdfjsLib);};s.onerror=function(){libPromise=null;rej();};document.head.appendChild(s);});
    return libPromise;
  }
  function setPage(n){cur=n;countEl.textContent=(window.innerWidth<=820?'':'Page ')+n+(window.innerWidth<=820?' / ':' of ')+sheets.length;prev.disabled=n<=1;next.disabled=n>=sheets.length;thumbs.forEach(function(t,i){t.classList.toggle('on',i===n-1);});var t=thumbs[n-1];if(t&&!v.classList.contains('no-rail')){var r=t.getBoundingClientRect(),rr=rail.getBoundingClientRect();if(r.top<rr.top||r.bottom>rr.bottom)rail.scrollTop+=r.top-rr.top-rr.height/2+r.height/2;}}
  function size(s){
    var cs=getComputedStyle(pagesEl),availW=pagesEl.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),availH=pagesEl.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-22;
    var w=availW;if(maxW)w=Math.min(w,maxW);
    if(fit==='page')w=Math.min(availW,availH*s.ratio);
    w=Math.max(120,Math.floor(w));
    s.box.style.width=w+'px';s.box.style.height=Math.round(w/s.ratio)+'px';
  }
  function layout(){sheets.forEach(size);sheets.forEach(function(s){if(s.drawnW&&Math.abs(s.drawnW-s.box.clientWidth)>2)draw(s,true);});}
  function draw(s,force){
    if(!doc||s.busy||(s.drawnW&&!force))return;
    var my=token;s.busy=true;
    doc.getPage(s.n).then(function(p){
      if(my!==token){s.busy=false;return;}
      var base=p.getViewport({scale:1});
      if(Math.abs(base.width/base.height-s.ratio)>.01){s.ratio=base.width/base.height;size(s);}
      var w=s.box.clientWidth,dpr=Math.min(window.devicePixelRatio||1,2),scale=w*dpr/base.width;
      var px=base.width*scale*base.height*scale,cap=window.innerWidth<=820?6e6:1.2e7;if(px>cap)scale*=Math.sqrt(cap/px);
      var vp=p.getViewport({scale:scale}),c=document.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
      return p.render({canvasContext:c.getContext('2d'),viewport:vp}).promise.then(function(){
        s.busy=false;if(my!==token)return;
        var old=s.box.querySelector('canvas');if(old){old.width=0;old.remove();}
        s.box.appendChild(c);s.box.classList.add('drawn');s.drawnW=w;
      });
    }).catch(function(){s.busy=false;});
  }
  function release(s){var c=s.box.querySelector('canvas');if(c){c.width=0;c.remove();}s.box.classList.remove('drawn');s.drawnW=0;}
  function drawThumb(t){
    if(t.done||!doc)return;t.done=true;var my=token,n=+t.dataset.n;
    doc.getPage(n).then(function(p){if(my!==token)return;var b=p.getViewport({scale:1}),sc=160/b.width,vp=p.getViewport({scale:sc}),c=document.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);return p.render({canvasContext:c.getContext('2d'),viewport:vp}).promise.then(function(){if(my!==token)return;var ph=t.querySelector('.pdfv-ph');if(ph)ph.replaceWith(c);});}).catch(function(){t.done=false;});
  }
  function build(n,ratio){
    pagesEl.innerHTML='';rail.innerHTML='';sheets=[];thumbs=[];
    if(io)io.disconnect();if(tio)tio.disconnect();
    io=new IntersectionObserver(function(es){es.forEach(function(e){var s=sheets[+e.target.dataset.n-1];if(e.isIntersecting)draw(s);else release(s);});},{root:pagesEl,rootMargin:'120% 0px'});
    tio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)drawThumb(e.target);});},{root:rail,rootMargin:'200px 0px'});
    for(var i=1;i<=n;i++){
      var sh=document.createElement('div');sh.className='pdfv-sheet';
      var box=document.createElement('div');box.className='pdfv-page';box.dataset.n=i;
      var lab=document.createElement('span');lab.textContent=i;
      sh.appendChild(box);sh.appendChild(lab);pagesEl.appendChild(sh);
      var s={n:i,box:box,ratio:ratio,drawnW:0};sheets.push(s);size(s);io.observe(box);
      var t=document.createElement('button');t.type='button';t.className='pdfv-thumb';t.dataset.n=i;t.setAttribute('aria-label','Page '+i);
      t.innerHTML='<div class="pdfv-ph" style="aspect-ratio:'+ratio+'"></div><span>'+i+'</span>';
      t.onclick=function(){go(+this.dataset.n);};rail.appendChild(t);thumbs.push(t);tio.observe(t);
    }
    v.classList.toggle('no-rail',n<=2);setPage(1);
  }
  function go(n){var s=sheets[n-1];if(!s)return;pagesEl.scrollTo({top:s.box.parentNode.offsetTop-parseFloat(getComputedStyle(pagesEl).paddingTop),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});setPage(n);}
  function onScroll(){
    var max=pagesEl.scrollHeight-pagesEl.clientHeight;barEl.style.width=(max>0?pagesEl.scrollTop/max*100:100)+'%';
    var mid=pagesEl.scrollTop+pagesEl.clientHeight*.4,n=1;
    for(var i=0;i<sheets.length;i++){if(sheets[i].box.parentNode.offsetTop<=mid)n=i+1;else break;}
    if(n!==cur)setPage(n);
  }
  pagesEl.addEventListener('scroll',onScroll,{passive:true});
  prev.onclick=function(){go(cur-1);};next.onclick=function(){go(cur+1);};
  v.querySelectorAll('[data-fit]').forEach(function(b){b.onclick=function(){fit=b.dataset.fit;v.querySelectorAll('[data-fit]').forEach(function(x){x.setAttribute('aria-pressed',x===b);});var n=cur;layout();go(n);};});
  var rt;window.addEventListener('resize',function(){if(!v.classList.contains('open'))return;clearTimeout(rt);rt=setTimeout(function(){var n=cur;layout();go(n);},150);});
  // keep the page behind from scrolling while the viewer is up
  v.querySelector('.pdfv-scrim').addEventListener('wheel',function(e){e.preventDefault();},{passive:false});
  v.querySelector('.pdfv-scrim').addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
  v.querySelectorAll('[data-pdfv-close]').forEach(function(b){b.addEventListener('click',close);});
  document.addEventListener('keydown',function(e){
    if(!v.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return;}
    if(e.key==='ArrowRight'){go(cur+1);e.preventDefault();}
    if(e.key==='ArrowLeft'){go(cur-1);e.preventDefault();}
    if(e.key==='Tab'){var f=[].filter.call(v.querySelectorAll('button,a[href]'),function(x){return !x.disabled&&x.offsetParent!==null;});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault();}}
  },true);
  function open(url,title,label,opts){
    opts=opts||{};opener=document.activeElement;token++;
    if(task){try{task.destroy();}catch(e){}task=null;}doc=null;
    document.getElementById('pdfv-name').textContent=title;document.getElementById('pdfv-label').textContent=label||'PDF';
    var dl=document.getElementById('pdfv-dl');dl.href=url;dl.setAttribute('download',url.split('/').pop());
    maxW=opts.maxWidth||0;fit='width';v.querySelectorAll('[data-fit]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.fit==='width');});
    v.classList.add('open');v.setAttribute('aria-hidden','false');
    build(1,opts.ratio||.7727);barEl.style.width='0';pagesEl.scrollTop=0;
    setTimeout(function(){v.querySelector('[data-pdfv-close].pdfv-icon').focus({preventScroll:true});},50);
    var my=token;
    loadLib().then(function(lib){
      if(my!==token)return;
      task=lib.getDocument({url:url,disableAutoFetch:true,disableStream:true});
      return task.promise.then(function(d){
        if(my!==token)return;doc=d;
        return d.getPage(1).then(function(p){
          if(my!==token)return;var b=p.getViewport({scale:1});build(d.numPages,b.width/b.height);
          // pages in a set can differ, so correct each placeholder as its size arrives
          (function fix(i){if(i>d.numPages||my!==token)return;d.getPage(i).then(function(pg){if(my!==token)return;var vb=pg.getViewport({scale:1}),r=vb.width/vb.height,s=sheets[i-1];if(Math.abs(r-s.ratio)>.01){s.ratio=r;size(s);}fix(i+1);});})(2);
        });
      });
    }).catch(function(){
      if(my!==token)return;
      pagesEl.innerHTML='<p class="pdfv-msg">This PDF could not be shown here. <a href="'+url+'" target="_blank" rel="noopener">Open it in a new tab</a> instead.</p>';rail.innerHTML='';v.classList.add('no-rail');countEl.textContent='';
    });
  }
  function close(){
    if(!v.classList.contains('open'))return;
    v.classList.remove('open');v.setAttribute('aria-hidden','true');token++;
    setTimeout(function(){if(v.classList.contains('open'))return;if(task){try{task.destroy();}catch(e){}task=null;}doc=null;if(io)io.disconnect();if(tio)tio.disconnect();pagesEl.innerHTML='';rail.innerHTML='';sheets=[];thumbs=[];},450);
    if(opener&&opener.focus)opener.focus({preventScroll:true});
  }
  // links keep their href, so a ctrl or middle click still opens a new tab
  window.openPdf=function(a,e){
    if(e&&(e.ctrlKey||e.metaKey||e.shiftKey||e.button===1))return true;
    open(a.getAttribute('href'),a.dataset.pdfTitle||'Document',a.dataset.pdfLabel,{maxWidth:+(a.dataset.pdfMax||0)||0});
    return false;
  };
})();
</script>
`;

// 1. CSS goes just before the load intro block at the end of the main stylesheet
swap('/* LOAD INTRO: runs once', CSS + '/* LOAD INTRO: runs once', 1);
// 2. markup and script at the end of body
swap('</body>', MARKUP + '</body>', 1);
// 3. links
const resume = ' data-pdf-title="Khushi Patel" data-pdf-label="Resume" data-pdf-max="860" onclick="return openPdf(this,event)"';
swap('<a class="hero-btn" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">', '<a class="hero-btn" href="Khushi_Patel_Resume.pdf"' + resume + '>', 2);
swap('<a class="we-boards-btn" style="position:static" href="Khushi_Patel_Resume.pdf" target="_blank" rel="noopener">', '<a class="we-boards-btn" style="position:static" href="Khushi_Patel_Resume.pdf"' + resume + '>', 1);
swap('<a class="we-boards-btn" style="position:static" href="Caesura_Technical_Drawing_Set.pdf" target="_blank" rel="noopener">', '<a class="we-boards-btn" style="position:static" href="Caesura_Technical_Drawing_Set.pdf" data-pdf-title="Technical Drawing Set" data-pdf-label="Caesura" onclick="return openPdf(this,event)">', 1);

html = html.replace(/\r?\n/g, '\r\n');
fs.writeFileSync(FILE, html);
console.log('ok', html.trimEnd().endsWith('</html>'), count('boards-popup'), count('flipbook-popup'), count('openPdf('));
