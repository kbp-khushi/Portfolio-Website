import puppeteer from 'puppeteer-core';
import fs from 'fs';
// Records the box of every element in every view and project page at given
// widths, so a CSS change can be proven to leave a layout untouched.
// usage: node scripts/layout-snapshot.mjs <out.json> <widths>
// compare: node scripts/layout-snapshot.mjs --diff a.json b.json
if (process.argv[2] === '--diff') {
  const a = JSON.parse(fs.readFileSync(process.argv[3])), b = JSON.parse(fs.readFileSync(process.argv[4]));
  for (const k of Object.keys(a)) {
    const A = a[k], B = b[k] || [];
    let n = 0; const ex = [];
    for (let i = 0; i < Math.max(A.length, B.length); i++) {
      if (A[i] !== B[i]) { n++; if (ex.length < 4) ex.push(`${A[i]}  ->  ${B[i]}`); }
    }
    if (n) console.log(k, n + ' changed\n  ' + ex.join('\n  '));
  }
  process.exit(0);
}
const [OUT, W] = process.argv.slice(2);
const PORT = process.env.PORT || 5056;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const snap = {};
for (const w of W.split(',').map(Number)) {
  const mobile = w < 768;
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900, isMobile: mobile, hasTouch: mobile });
  await page.goto(`http://localhost:${PORT}/?t=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '.reveal,.pp-reveal{opacity:1!important;transform:none!important;transition:none!important}html.intro *{animation:none!important}' });
  const ctxs = await page.evaluate(() => ['home', 'work', 'about'].map(v => 'view:' + v).concat([...document.querySelectorAll('.project-page')].map(p => 'page:' + p.id.slice(5))));
  for (const ctx of ctxs) {
    snap[w + ' ' + ctx] = await page.evaluate(async ctx => {
      const [kind, name] = ctx.split(':');
      if (kind === 'view') showView(name); else { showView('home'); openProject(name); }
      await new Promise(r => setTimeout(r, 300));
      const root = document.getElementById((kind === 'view' ? 'view-' : 'page-') + name);
      const base = root.getBoundingClientRect();
      const rows = [...root.querySelectorAll('*')].map(el => {
        const r = el.getBoundingClientRect();
        return `${el.tagName}.${typeof el.className === 'string' ? el.className.replace(/\s*(visible|open)\b/g, '') : ''} ${Math.round(r.left)},${Math.round(r.top - base.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
      });
      if (kind === 'page') closeProject();
      return rows;
    }, ctx);
  }
  await page.close();
}
fs.writeFileSync(OUT, JSON.stringify(snap));
await browser.close();
