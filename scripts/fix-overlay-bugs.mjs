import { readFileSync, writeFileSync } from 'fs';
const P='C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html=readFileSync(P,'utf8');
const before=html.length;
const once=(s,l)=>{const c=html.split(s).length-1; if(c!==1) throw new Error(`${l}: ${c} matches`); return s;};
const swap=(o,n,l)=>{once(o,l); html=html.replace(o,()=>n); console.log('[ok]',l);};

// ---- 1) the blank page bug -------------------------------------------------
// openProject schedules a 1.2s timer that hides the main page. Closing before
// it fires left the timer to hide the page after the overlay was already gone,
// with no way back except a reload.
swap(`    setTimeout(()=>{mc.style.display='none';mc.style.opacity='';mc.style.transition='';},1200);`,
     `    clearTimeout(window.__ppHideTimer);
    window.__ppHideTimer=setTimeout(()=>{mc.style.display='none';mc.style.opacity='';mc.style.transition='';},1200);`,
     'open: hide timer is now cancellable');

swap(`function closeProject(){
  document.querySelectorAll('.project-page').forEach(p=>p.classList.remove('open'));
  document.getElementById('main-content').style.display='';
  document.body.style.overflow='';
  document.querySelector('.nav').style.zIndex='';
}`,
     `function closeProject(){
  clearTimeout(window.__ppHideTimer);
  document.querySelectorAll('.project-page').forEach(p=>p.classList.remove('open'));
  const mc=document.getElementById('main-content');
  mc.style.display='';mc.style.opacity='';mc.style.transition='';
  document.body.style.overflow='';
  document.querySelector('.nav').style.zIndex='';
}
// Leaving via a Back button should also unwind history, so the address bar
// and the browser's own Back button stay truthful.
function exitProject(){
  if(location.hash){history.back();}
  else{closeProject();}
}`,
     'close: cancels the timer and fully resets the page');

// ---- 2) Back buttons unwind history ----------------------------------------
{
  const o='onclick="closeProject()"', n='onclick="exitProject()"';
  const c=html.split(o).length-1;
  if(c!==16) throw new Error(`expected 16 close buttons, found ${c}`);
  html=html.split(o).join(n);
  console.log('[ok] 16 Back and close buttons now unwind history');
}

// ---- 3) Back returns to the previous project, not straight to the index -----
swap(`window.addEventListener('popstate',function(e){
  if(document.querySelector('.project-page.open')){closeProject();}
  else if(e.state&&e.state.project){openProject(e.state.project);}
});`,
     `window.addEventListener('popstate',function(e){
  if(e.state&&e.state.project){openProject(e.state.project);}
  else if(document.querySelector('.project-page.open')){closeProject();}
});`,
     'popstate: prefers restoring the previous project');

// ---- 4) Escape stops at the flipbook ---------------------------------------
// Both listeners sit on document and the flipbook's runs first, so it has to
// stop the project handler from also firing on the same keypress.
swap(`  if(e.key==='Escape')closeFlipbook();`,
     `  if(e.key==='Escape'){closeFlipbook();e.stopImmediatePropagation();}`,
     'escape: closes the flipbook without ejecting the project');

// ---- 5) a closed overlay must not swallow clicks ---------------------------
swap(`.project-page{position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:var(--white);overflow-y:auto;opacity:0;visibility:hidden;transition:opacity 1.2s cubic-bezier(.22,1,.36,1),visibility 0s 1.2s}`,
     `.project-page{position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:var(--white);overflow-y:auto;opacity:0;visibility:hidden;pointer-events:none;transition:opacity 1.2s cubic-bezier(.22,1,.36,1),visibility 0s 1.2s}`,
     'closed overlay ignores pointer events');
swap(`.project-page.open{opacity:1;visibility:visible;transition:opacity 1.2s cubic-bezier(.22,1,.36,1),visibility 0s 0s}`,
     `.project-page.open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity 1.2s cubic-bezier(.22,1,.36,1),visibility 0s 0s}`,
     'open overlay takes pointer events');

// ---- 6) focus styles and reduced motion ------------------------------------
swap(`/* PROJECT DETAIL PAGE */`,
     `/* ACCESSIBILITY */
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
  .reveal,.pp-reveal{opacity:1!important;transform:none!important}
}

/* PROJECT DETAIL PAGE */`,
     'focus-visible and reduced-motion added');

writeFileSync(P,html);
console.log('bytes',before,'->',html.length,'| ends html:',html.trimEnd().endsWith('</html>'),'| popups:',(html.match(/boards-popup/g)||[]).length,(html.match(/flipbook-popup/g)||[]).length);
