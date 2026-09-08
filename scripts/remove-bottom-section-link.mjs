import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

// the section model link now lives in the aside beside the drawing set button,
// so the duplicate at the very bottom of the page comes out
const DUP = '<div class="model-links"><a onclick="closeProject();setTimeout(function(){openProject(\'section-model\');},80)">View the section model</a></div>';
const count = html.split(DUP).length - 1;
if (count !== 1) throw new Error(`expected the bottom link once, found ${count}`);
html = html.replace(DUP, () => '');
console.log('[ok] duplicate section model link removed from the bottom of the page');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'));
console.log('section model links remaining:', c("openProject('section-model')"));
console.log('massing model links remaining:', c("openProject('massing-model')"));
