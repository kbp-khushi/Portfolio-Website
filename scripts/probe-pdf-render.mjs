import puppeteer from 'puppeteer-core';
// Times how long PDF.js takes to fetch and draw each page of a PDF in Chrome.
const [pdf, pages = '1,2,3', width = '1300'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 600000 });
const page = await browser.newPage();
page.on('console', m => console.log('console:', m.text()));
await page.goto('http://localhost:5056/?t=' + Date.now(), { waitUntil: 'networkidle0' });
await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });
const res = await page.evaluate(async (pdf, pages, width) => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const out = [];
  let t = performance.now();
  const d = await pdfjsLib.getDocument({ url: pdf, disableAutoFetch: true, disableStream: true }).promise;
  out.push('open ' + Math.round(performance.now() - t) + 'ms, pages ' + d.numPages);
  for (const n of pages.split(',').map(Number)) {
    t = performance.now();
    const p = await d.getPage(n);
    const got = Math.round(performance.now() - t);
    const vp = p.getViewport({ scale: 1 });
    const v2 = p.getViewport({ scale: width / vp.width });
    const c = document.createElement('canvas'); c.width = v2.width; c.height = v2.height;
    t = performance.now();
    const ops = await p.getOperatorList();
    const opsMs = Math.round(performance.now() - t);
    t = performance.now();
    await p.render({ canvasContext: c.getContext('2d'), viewport: v2 }).promise;
    out.push(`page ${n}: ${Math.round(vp.width)}x${Math.round(vp.height)}pt, fetch ${got}ms, ops ${ops.fnArray.length} in ${opsMs}ms, draw ${Math.round(performance.now() - t)}ms`);
  }
  return out;
}, pdf, pages, +width);
console.log(res.join('\n'));
await browser.close();
