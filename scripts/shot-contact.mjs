import puppeteer from 'puppeteer-core';
// Screenshots the end of About (contact band + footer) on desktop and phone.
const OUT = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.goto('http://localhost:5056/?t=' + Date.now(), { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    showView('about');
    document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
    const st = document.createElement('style');
    st.textContent = 'html{scrollbar-width:none}::-webkit-scrollbar{display:none}.reveal{opacity:1!important;transform:none!important}.nav,.mobile-tabbar{position:absolute!important}';
    document.head.appendChild(st);
    await new Promise(r => setTimeout(r, 2000));
  });
  const { y, h } = await page.evaluate(() => {
    const c = document.getElementById('contact');
    return { y: c.getBoundingClientRect().top + scrollY - 120, h: document.documentElement.scrollHeight };
  });
  await page.screenshot({ path: `${OUT}/contact-live-${name}.png`, clip: { x: 0, y, width: vp.width, height: h - y }, captureBeyondViewport: true });
  console.log(name, y, h);
  await page.close();
}
await browser.close();
