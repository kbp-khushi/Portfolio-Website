import puppeteer from 'puppeteer-core';
// Opens the PDF viewer from its real links and screenshots it on desktop and phone.
const OUT = process.argv[2];
const PORT = process.env.PORT || 5056;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const cases = [
  ['resume-desktop', { width: 1520, height: 860 }, 'view:about', '.about-resume-btn a[href$="Resume.pdf"]'],
  ['drawings-desktop', { width: 1520, height: 860 }, 'page:the-pause', 'a[href$="Drawing_Set.pdf"]'],
  ['resume-phone', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'view:home', '.hero-actions a[href$="Resume.pdf"]'],
  ['drawings-phone', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'page:the-pause', 'a[href$="Drawing_Set.pdf"]'],
];
for (const [name, vp, ctx, sel] of cases) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport(vp);
  await page.goto(`http://localhost:${PORT}/?t=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.evaluate(async ctx => { const [k, n] = ctx.split(':'); if (k === 'view') showView(n); else openProject(n); await new Promise(r => setTimeout(r, 1600)); }, ctx);
  await page.evaluate(sel => document.querySelector(sel).click(), sel);
  await page.waitForFunction(() => document.querySelectorAll('#pdfv .pdfv-page.drawn').length > 0, { timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const info = await page.evaluate(() => ({ pages: document.querySelectorAll('#pdfv .pdfv-page').length, drawn: document.querySelectorAll('#pdfv .pdfv-page.drawn').length, count: document.getElementById('pdfv-count').textContent, overflowX: document.getElementById('pdfv-pages').scrollWidth - document.getElementById('pdfv-pages').clientWidth, bar: document.querySelector('.pdfv-bar').scrollWidth - document.querySelector('.pdfv-bar').clientWidth }));
  await page.screenshot({ path: `${OUT}/pdfv-${name}.png` });
  if (name === 'drawings-desktop') {
    await page.click('#pdfv-next'); await page.click('#pdfv-next');
    await new Promise(r => setTimeout(r, 2500));
    await page.click('[data-fit="page"]');
    await new Promise(r => setTimeout(r, 6000));
    info.afterNext = await page.evaluate(() => document.getElementById('pdfv-count').textContent);
    await page.screenshot({ path: `${OUT}/pdfv-${name}-fitpage.png` });
  }
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 700));
  info.closed = await page.evaluate(() => !document.getElementById('pdfv').classList.contains('open'));
  info.projectStillOpen = await page.evaluate(() => !!document.querySelector('.project-page.open'));
  console.log(name, JSON.stringify(info), errors.length ? 'ERRORS: ' + errors.join(' | ') : '');
  await page.close();
}
await browser.close();

