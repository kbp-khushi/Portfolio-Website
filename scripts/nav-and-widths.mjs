import { readFileSync, writeFileSync } from 'fs';

// 1. Mobile nav becomes a fixed bottom bar (work / about / contact) instead of
//    a hamburger hiding three links.
// 2. The Selected Work fact column was minmax(0,320px) beside a rigid 580px
//    image column, so between roughly 880 and 1060px the text got squeezed to
//    125px, wrapped every value, and pushed the page into horizontal overflow.
// 3. Project meta lists were capped at 440px, which split Program and Software
//    onto two lines on every screen size.
// 4. The two Caesura model cards sit side by side instead of stacked.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (oldStr, newStr, label) => {
  const hits = html.split(oldStr).length - 1;
  if (hits !== 1) throw new Error(`${label}: ${hits} matches`);
  html = html.replace(oldStr, () => newStr);
  console.log('[ok]', label);
};

// ---------------------------------------------------------------------------
// 1) bottom tab bar
// ---------------------------------------------------------------------------
swap('  <div class="nav-credential">SCAD, M.Arch &rsquo;27</div>\n</nav>',
  '  <div class="nav-credential">SCAD, M.Arch &rsquo;27</div>\n</nav>\n' +
  '<nav class="mobile-tabbar" aria-label="Main">\n' +
  '  <a href="#" data-view="work" onclick="showView(\'work\');return false;">work</a>\n' +
  '  <a href="#" data-view="about" onclick="showView(\'about\');return false;">about</a>\n' +
  '  <a href="#contact" onclick="showView(\'about\');setTimeout(function(){var c=document.getElementById(\'contact\');if(c)c.scrollIntoView({block:\'start\',behavior:\'smooth\'});},120);return false;">contact</a>\n' +
  '</nav>',
  'bottom tab bar markup');

swap('.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}',
  '.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px}\n' +
  '.mobile-tabbar{display:none}\n' +
  '@media(max-width:768px){\n' +
  '  .mobile-tabbar{display:grid;grid-template-columns:repeat(3,1fr);position:fixed;left:0;right:0;bottom:0;z-index:220;background:rgba(255,255,255,.97);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}\n' +
  '  .mobile-tabbar a{font-family:var(--title);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-light);text-decoration:none;text-align:center;padding:16px 4px;transition:color .3s}\n' +
  '  .mobile-tabbar a.active,.mobile-tabbar a:active{color:var(--text)}\n' +
  '  .hamburger{display:none!important}\n' +
  '  .footer{padding-bottom:104px}\n' +
  '}',
  'bottom tab bar styles, hamburger retired, footer clears the bar');

// the tab bar highlights with the top nav
swap("document.querySelectorAll('.nav-links a[data-view]').forEach(l=>{",
     "document.querySelectorAll('.nav-links a[data-view],.mobile-tabbar a[data-view]').forEach(l=>{",
     'tab bar shares the active state');

// ---------------------------------------------------------------------------
// 2) Selected Work: image column may shrink, fact column keeps a floor
// ---------------------------------------------------------------------------
swap('.stack-item{cursor:pointer;padding:36px 0;display:grid;grid-template-columns:580px minmax(0,320px);gap:40px;align-items:center;justify-content:center}',
     '.stack-item{cursor:pointer;padding:36px 0;display:grid;grid-template-columns:minmax(0,580px) minmax(290px,340px);gap:40px;align-items:center;justify-content:center}',
     'stack columns: image flexes, facts keep a 290px floor');
swap('.fact-label{flex:0 0 150px;color:var(--text-light)}',
     '.fact-label{flex:0 0 128px;white-space:nowrap;color:var(--text-light)}',
     'fact labels narrower and never wrap');

// ---------------------------------------------------------------------------
// 3) project meta values get room for one line
// ---------------------------------------------------------------------------
swap('.pp-meta-list{display:flex;flex-direction:column;gap:9px;margin-top:16px;padding-top:20px;border-top:1px solid var(--line);max-width:440px}',
     '.pp-meta-list{display:flex;flex-direction:column;gap:9px;margin-top:16px;padding-top:20px;border-top:1px solid var(--line);max-width:760px}',
     'meta list 440 -> 760px');

// ---------------------------------------------------------------------------
// 4) the two model cards side by side
// ---------------------------------------------------------------------------
swap('.model-stack{display:flex;flex-direction:column;gap:26px;max-width:250px;align-self:start}',
     '.model-stack{display:flex;flex-direction:row;gap:18px;max-width:none;align-self:start}',
     'model cards side by side');
swap('.model-card{cursor:pointer}', '.model-card{cursor:pointer;flex:1 1 0;min-width:0}', 'model cards share the width');
swap('.model-img{height:137px;width:auto;max-width:100%;object-fit:contain;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     '.model-img{height:130px;width:100%;object-fit:contain;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1)}',
     'model images fill their half');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'), '| img tags:', c('<img'), '| data URIs:', c('data:image/'));
console.log('tabbar links:', c('mobile-tabbar a') ? 'styled' : 'MISSING', '| tabbar nav:', c('<nav class="mobile-tabbar"'));
