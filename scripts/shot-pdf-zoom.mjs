import puppeteer from 'puppeteer-core';
// Checks the PDF viewer's zoom: buttons, ctrl + wheel, and that a zoomed page can scroll to both edges.
const OUT = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
for (const [name, vp] of [['desktop', { width: 1520, height: 860 }], ['phone', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewport(vp);
  await page.goto('http://localhost:5056/?t=' + Date.now(), { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { openProject('the-pause'); await new Promise(r => setTimeout(r, 1500)); document.querySelector('a[href$="Drawing_Set.pdf"]').click(); });
  await page.waitForFunction(() => document.querySelectorAll('#pdfv .pdfv-page.drawn').length > 0, { timeout: 60000 });
  const before = await page.evaluate(() => document.querySelector('#pdfv .pdfv-page').offsetWidth);
  for (let i = 0; i < 3; i++) await page.click('#pdfv-zin');
  if (name === 'desktop') {
    const box = await (await page.$('#pdfv-pages')).boundingBox();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await page.keyboard.down('Control'); await page.mouse.wheel({ deltaY: -40 }); await page.keyboard.up('Control');
  }
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(() => {
    const p = document.getElementById('pdfv-pages'), b = p.querySelector('.pdfv-page');
    const res = { pct: document.getElementById('pdfv-zpct').value, width: b.offsetWidth, scrollW: p.scrollWidth, clientW: p.clientWidth };
    p.scrollLeft = 0; res.leftEdgeVisible = b.getBoundingClientRect().left >= p.getBoundingClientRect().left - 1;
    p.scrollLeft = 1e6; res.rightEdgeVisible = b.getBoundingClientRect().right <= p.getBoundingClientRect().right + 1;
    p.scrollLeft = (p.scrollWidth - p.clientWidth) / 2;
    return res;
  });
  info.before = before;
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: `${OUT}/pdfv-zoom-${name}.png` });
  console.log(name, JSON.stringify(info), errors.join(' | '));
  await page.close();
}
await browser.close();
