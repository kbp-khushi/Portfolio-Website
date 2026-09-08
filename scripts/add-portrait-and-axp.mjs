import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/index.html';
const SRC = 'C:/Users/Khushi Patel/Downloads/D756F2BE-ABB7-4E15-B688-9639A870CC6C.PNG';
const KEEP = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/Portrait';
mkdirSync(KEEP, { recursive: true });
copyFileSync(SRC, `${KEEP}/Khushi_Portrait_Forsyth.png`);

// the slot is 4:5; the photograph is taller than that, so trim from the top,
// which is sky and tree canopy, and keep the fountain and figure whole
const meta = await sharp(SRC).metadata();
const targetH = Math.round(meta.width * 5 / 4);
const top = Math.max(0, meta.height - targetH);
const portrait = await sharp(SRC)
  .extract({ left: 0, top, width: meta.width, height: Math.min(targetH, meta.height) })
  .resize({ width: 1100 })
  .jpeg({ quality: 86 })
  .toBuffer();
const pm = await sharp(portrait).metadata();
console.log(`portrait: ${meta.width}x${meta.height} -> ${pm.width}x${pm.height}, ${(portrait.length / 1024).toFixed(0)}KB`);
const dataUri = `data:image/jpeg;base64,${portrait.toString('base64')}`;

let html = readFileSync(P, 'utf8');
const before = html.length;

// ---- 1) real portrait, and the placeholder script goes ---------------------
const OLD_IMG = '<img class="about-portrait-placeholder" id="about-portrait-img" alt="Portrait of Khushi Patel (temporary placeholder image until the real portrait is added)">';
if (html.split(OLD_IMG).length - 1 !== 1) throw new Error('portrait img not matched');
html = html.replace(OLD_IMG, () => `<img class="about-portrait-placeholder" id="about-portrait-img" src="${dataUri}" alt="Khushi Patel at the Forsyth Park fountain in Savannah, in graduation dress">`);
console.log('[ok] portrait embedded');

{
  const COMMENT = "// Temporary portrait placeholder: reuse the hero's Monet image until a real portrait is supplied";
  const at = html.indexOf(COMMENT);
  if (at === -1) throw new Error('placeholder script comment not found');
  const closeAt = html.indexOf('});', html.indexOf('if(hero)img.src=hero.src;', at));
  if (closeAt === -1) throw new Error('placeholder script close not found');
  html = html.slice(0, at) + html.slice(closeAt + '});'.length);
  console.log('[ok] Monet placeholder script removed');
}

// ---- 2) AXP progress rings -------------------------------------------------
const AXP = [
  ['Practice Management', 141.25, 160],
  ['Project Management', 15, 360],
  ['Programming &amp; Analysis', 66, 260],
  ['Project Planning &amp; Design', 296.75, 1080],
  ['Project Development &amp; Documentation', 764.25, 1520],
  ['Construction &amp; Evaluation', 53, 360]
];
const R = 30, C = 2 * Math.PI * R;
const fmt = n => n.toLocaleString('en-US');
const rings = AXP.map(([name, done, need]) => {
  const pct = done / need;
  const dash = (pct * C).toFixed(1);
  return `          <div class="axp-item">
            <svg class="axp-ring" viewBox="0 0 76 76" role="img" aria-label="${name}: ${fmt(done)} of ${fmt(need)} hours approved">
              <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--line)" stroke-width="7"></circle>
              <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--text)" stroke-width="7" stroke-linecap="butt"
                      stroke-dasharray="${dash} ${(C - pct * C).toFixed(1)}" transform="rotate(-90 38 38)"></circle>
              <text x="38" y="41" text-anchor="middle" class="axp-pct">${Math.round(pct * 100)}%</text>
            </svg>
            <div class="axp-name">${name}</div>
            <div class="axp-hours">${fmt(done)} / ${fmt(need)}</div>
          </div>`;
}).join('\n');

const LIC_ANCHOR = '<div class="about-lic-item">AXP Hours: 1,336.25 / 3,740 (35.7% complete)</div>';
if (html.split(LIC_ANCHOR).length - 1 !== 1) throw new Error('licensure line not matched');
html = html.replace(LIC_ANCHOR, () => `${LIC_ANCHOR}
          <div class="axp-grid">
${rings}
          </div>`);
console.log('[ok] six AXP rings added under licensure');

// ---- 3) styles -------------------------------------------------------------
const CSS_ANCHOR = '.fm-finals{display:grid';
if (html.split(CSS_ANCHOR).length - 1 !== 1) throw new Error('css anchor not found');
html = html.replace(CSS_ANCHOR, () => `.axp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px 18px;margin-top:22px;max-width:420px}
.axp-item{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px}
.axp-ring{width:76px;height:76px;display:block}
.axp-pct{font-family:var(--title);font-size:15px;font-weight:700;fill:var(--text)}
.axp-name{font-family:var(--title);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text);line-height:1.35}
.axp-hours{font-size:11px;color:var(--text-light);font-variant-numeric:tabular-nums}
@media(max-width:768px){.axp-grid{grid-template-columns:repeat(2,1fr);max-width:none}}
${CSS_ANCHOR}`);
console.log('[ok] ring styles added');

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('bytes', before, '->', html.length, '| ends html:', html.trimEnd().endsWith('</html>'), '| popups:', c('boards-popup'), c('flipbook-popup'));
console.log('placeholder text gone:', !html.includes('temporary placeholder image'));
