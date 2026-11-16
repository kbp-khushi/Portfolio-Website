import puppeteer from 'puppeteer-core';
// Screenshots the Reverie page a screen at a time (desktop) and the full page (phone),
// with every reveal forced visible and every lazy image loaded first.
const OUT = process.argv[2];
const PORT = process.env.PORT || 5056;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });

async function open(vp) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewport(vp);
  await page.goto(`http://localhost:${PORT}/?t=${Date.now()}`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    openProject('reverie');
    await new Promise((r) => setTimeout(r, 1600));
    const p = document.getElementById('page-reverie');
    p.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    p.querySelectorAll('.pp-reveal').forEach((e) => { e.classList.add('visible'); e.style.transition = 'none'; });
    await Promise.all([...p.querySelectorAll('img')].filter((i) => !i.closest('#boards-reverie')).map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
  });
  return { page, errors };
}

{ // desktop, one shot per screen
  const { page, errors } = await open({ width: 1520, height: 860 });
  const H = await page.evaluate(() => document.getElementById('page-reverie').scrollHeight);
  let n = 0;
  for (let y = 0; y < H; y += 780) {
    await page.evaluate((y) => { document.getElementById('page-reverie').scrollTop = y; }, y);
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: `${OUT}/reverie-desktop-${String(++n).padStart(2, '0')}.png` });
  }
  console.log('desktop shots', n, 'height', H, 'errors', JSON.stringify(errors));
}
{ // phone, top few screens
  const { page, errors } = await open({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const over = await page.evaluate(() => { const p = document.getElementById('page-reverie'); return p.scrollWidth - p.clientWidth; });
  for (let i = 0; i < 3; i++) {
    await page.evaluate((y) => { document.getElementById('page-reverie').scrollTop = y; }, i * 1500);
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: `${OUT}/reverie-phone-${i + 1}.png` });
  }
  console.log('phone horizontal overflow', over, 'errors', JSON.stringify(errors));
}
await browser.close();
