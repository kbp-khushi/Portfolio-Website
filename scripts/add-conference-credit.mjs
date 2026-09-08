import { readFileSync, writeFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const NOTE = 'Accepted for display at the ACSA 2026 Intersections Research Conference: Urban Design Matters';

// ---- 1) on the project page, under the intro paragraph --------------------
const DESC_END = 'is extended and reimagined as a civic spine that weaves the city grid into the waterfront.</div>';
if (html.split(DESC_END).length - 1 !== 1) throw new Error('woven edge description not matched');
html = html.replace(DESC_END, () =>
  `is extended and reimagined as a civic spine that weaves the city grid into the waterfront.<div class="pp-credit">${NOTE}</div></div>`);
console.log('[ok] credit added to the Woven Edge page');

// ---- 2) on the landing stack, under its facts -----------------------------
{
  const at = html.indexOf("openProject('woven-edge')");
  const factsAt = html.indexOf('<div class="stack-facts">', at);
  if (factsAt === -1) throw new Error('stack facts not found');
  // close of the facts block, then the stack-info close
  const factsClose = html.indexOf('</div>\r\n        </div>', factsAt);
  if (factsClose === -1) throw new Error('stack facts close not found');
  const insertAt = factsClose + '</div>'.length;
  html = html.slice(0, insertAt) + `\r\n          <div class="stack-credit">${NOTE}</div>` + html.slice(insertAt);
  console.log('[ok] credit added under the Selected Work entry');
}

// ---- 3) styles -------------------------------------------------------------
const CSS_ANCHOR = '.axp-grid{display:grid';
if (html.split(CSS_ANCHOR).length - 1 !== 1) throw new Error('css anchor not found');
html = html.replace(CSS_ANCHOR, () => `.pp-credit{margin-top:18px;font-style:italic;font-size:14px;color:var(--text-light)}
.stack-credit{margin-top:10px;font-style:italic;font-size:12.5px;line-height:1.5;color:var(--text-light);max-width:46ch}
${CSS_ANCHOR}`);
console.log('[ok] styles added');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
console.log('credit appears', c(NOTE), 'times');
