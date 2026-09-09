import { readFileSync, writeFileSync } from 'fs';

// The mobile tab bar carried work / about / contact. It should mirror the
// desktop nav: home / work / about. Contact is still reachable from the hero
// button and the footer.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const start = html.indexOf('<nav class="mobile-tabbar"');
if (start === -1) throw new Error('tab bar not found');
const end = html.indexOf('</nav>', start);
if (end === -1) throw new Error('tab bar close not found');
const old = html.slice(start, end + 6);
if (!old.includes('contact')) throw new Error('unexpected tab bar contents');

const NEW = '<nav class="mobile-tabbar" aria-label="Main">\n' +
  '  <a href="#" data-view="home" onclick="showView(\'home\');return false;">home</a>\n' +
  '  <a href="#" data-view="work" onclick="showView(\'work\');return false;">work</a>\n' +
  '  <a href="#" data-view="about" onclick="showView(\'about\');return false;">about</a>\n' +
  '</nav>';

html = html.slice(0, start) + NEW + html.slice(end + 6);
writeFileSync(P, html);

const c = s => html.split(s).length - 1;
console.log('[ok] tab bar is now home / work / about');
console.log('bytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| popups:', c('boards-popup'), c('flipbook-popup'),
  '| img tags:', c('<img'));
