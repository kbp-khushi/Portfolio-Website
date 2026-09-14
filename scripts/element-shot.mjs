import puppeteer from 'puppeteer-core';
const [out, w, ctx, sel] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
const mobile = +w < 768;
await page.setViewport({ width: +w, height: mobile ? 844 : 1000, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 });
await page.goto('http://localhost:5056/?t=' + Date.now(), { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '.reveal,.pp-reveal{opacity:1!important;transform:none!important;transition:none!important}html.intro *{animation:none!important}' });
await page.evaluate(async (ctx) => { const [k, n] = ctx.split(':'); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); if (k === 'view') showView(n); else openProject(n); await new Promise(r => setTimeout(r, 2500)); }, ctx);
const el = await page.$(sel);
await el.scrollIntoView();
await new Promise(r => setTimeout(r, 1200));
await el.screenshot({ path: out });
await browser.close();


