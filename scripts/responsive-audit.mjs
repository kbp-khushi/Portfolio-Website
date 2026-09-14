import puppeteer from 'puppeteer-core';
import fs from 'fs';
// Renders every view and project page at a spread of real device widths and
// reports layout faults: sideways overflow, things poking past the screen edge,
// text boxes overlapping each other, and clipped text.
// usage: node scripts/responsive-audit.mjs <outdir> [widths comma list]
const OUT = process.argv[2] || '.';
const PORT = process.env.PORT || 5056;
const ALL = {
  320: 568, 360: 800, 375: 667, 390: 844, 412: 915, 430: 932,
  768: 1024, 820: 1180, 1024: 768, 1180: 820, 1280: 800, 1366: 768,
  1440: 900, 1536: 864, 1920: 1080, 2560: 1440,
};
const widths = process.argv[3] ? process.argv[3].split(',').map(Number) : Object.keys(ALL).map(Number);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const report = {};
for (const w of widths) {
  const h = ALL[w] || 900;
  const mobile = w < 768;
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/?t=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: '.reveal,.pp-reveal{opacity:1!important;transform:none!important;transition:none!important}html.intro *{animation:none!important}' });
  const contexts = await page.evaluate(() => ['home', 'work', 'about'].map(v => 'view:' + v)
    .concat([...document.querySelectorAll('.project-page')].map(p => 'page:' + p.id.slice(5))));
  for (const ctx of contexts) {
    const res = await page.evaluate(async (ctx) => {
      const [kind, name] = ctx.split(':');
      if (kind === 'view') { showView(name); } else { showView('home'); openProject(name); }
      document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
      await new Promise(r => setTimeout(r, 400));
      const root = kind === 'view' ? document.getElementById('view-' + name) : document.getElementById('page-' + name);
      const scroller = kind === 'view' ? document.documentElement : root;
      const vw = scroller.clientWidth;
      const out = { overflowX: scroller.scrollWidth - scroller.clientWidth, offscreen: [], overlaps: [], clipped: [], lefts: {} };
      const clippedByAncestor = el => { for (let a = el.parentElement; a && a !== root; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== 'visible' || s.display === 'none') return true; } return false; };
      const label = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ' "' + (el.textContent || el.alt || '').trim().slice(0, 40) + '"';
      const vis = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden'; };
      const all = [...root.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && vis(el) && !el.closest('[id$="-popup"],.flipbook-popup,svg'); });
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if ((r.right > vw + 1 || r.left < -1) && !clippedByAncestor(el)) out.offscreen.push(label(el) + ` L${Math.round(r.left)} R${Math.round(r.right)}`);
        const s = getComputedStyle(el);
        if ((s.overflowX === 'hidden' || s.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 2 && !el.querySelector('img') && el.textContent.trim()) out.clipped.push(label(el));
      }
      // text leaves: elements that directly hold text
      const leaves = all.filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !['SPAN', 'EM', 'STRONG', 'MARK', 'A', 'B', 'I', 'BR'].includes(el.tagName) || (['A', 'SPAN'].includes(el.tagName) && getComputedStyle(el).display !== 'inline' && el.textContent.trim()));
      const rects = leaves.map(el => ({ el, r: el.getBoundingClientRect() }));
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 4 && oy > 4) out.overlaps.push(label(a.el) + '  X  ' + label(b.el) + ` (${Math.round(ox)}x${Math.round(oy)})`);
      }
      for (const { el, r } of rects) { const k = Math.round(r.left); out.lefts[k] = (out.lefts[k] || 0) + 1; }
      out.height = scroller.scrollHeight;
      if (kind === 'page') closeProject();
      return out;
    }, ctx);
    report[w] = report[w] || {};
    report[w][ctx] = res;
  }
  await page.close();
  console.log('done', w);
}
fs.writeFileSync(`${OUT}/audit.json`, JSON.stringify(report, null, 1));
await browser.close();
