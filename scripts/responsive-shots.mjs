import puppeteer from 'puppeteer-core';
// Full length screenshots of views and project pages at chosen widths, for
// comparing layouts side by side.
// usage: node scripts/responsive-shots.mjs <outdir> <widths> <contexts> [maxHeight]
// contexts: comma list like view:home,page:beacon
const [OUT, W, C, MAXH] = process.argv.slice(2);
const PORT = process.env.PORT || 5056;
const maxH = Number(MAXH || 7000);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
for (const w of W.split(',').map(Number)) {
  const mobile = w < 768;
  const h = mobile ? 844 : Math.min(1440, Math.round(w * 0.5625));
  const dsf = mobile ? 1 : (w > 1600 ? 0.5 : 0.75);
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: dsf });
  await page.goto(`http://localhost:${PORT}/?t=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({ content: `.reveal,.pp-reveal{opacity:1!important;transform:none!important;transition:none!important}html.intro *{animation:none!important}
    .project-page,#main-content{transition:none!important}
    body.shot-page #main-content{display:none!important}
    body.shot-page .project-page.open{position:absolute!important;bottom:auto!important;overflow:visible!important}
    body.shot-page{overflow:visible!important}
    .nav,.mobile-tabbar,.pp-back{position:absolute!important}` });
  for (const ctx of C.split(',')) {
    const [kind, name] = ctx.split(':');
    await page.evaluate(async (kind, name) => {
      document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
      document.body.classList.remove('shot-page');
      if (kind === 'view') showView(name); else { showView('home'); openProject(name); document.body.classList.add('shot-page'); }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 1500));
    }, kind, name);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: `${OUT}/${w}-${kind}-${name}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(H, maxH) }, captureBeyondViewport: true });
    if (kind === 'page') await page.evaluate(() => { closeProject(); document.body.classList.remove('shot-page'); });
  }
  await page.close();
  console.log('shot', w);
}
await browser.close();
