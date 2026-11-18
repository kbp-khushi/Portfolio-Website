// Reverie: the 3 light sections for both sites span the whole way across (her ask, 2026-11-18).
// The row of 3 moves out of the edit-row's image column and sits under its section, full width on the
// page frame (.rv-sections). The Tabby Walls row is left with text only, so it becomes a full width
// intro like The Court and The Tower; The Release keeps the overlook beside its text.
import fs from 'node:fs';

const F = new URL('../site/index.html', import.meta.url);
let html = fs.readFileSync(F, 'utf8');
if (html.includes('rv-sections')) throw new Error('already done');
const N = '\r\n';
const items = (s) => s.match(/<div class="img-row-item">[\s\S]*?<\/div><\/div>/g).map((x) => '    ' + x).join(N);

// The Tabby Walls: text becomes a full width intro, sections run across under it
const tabby = /<div class="edit-row">\r?\n    <div class="edit-text">\r?\n(      <div class="ds-title">The Tabby Walls<\/div>[\s\S]*?)\r?\n    <\/div>\r?\n    <div class="edit-images">\r?\n      <div class="img-row three" style="padding:0;width:100%">([\s\S]*?)\r?\n      <\/div>\r?\n    <\/div>\r?\n  <\/div>/;
const t = html.match(tabby);
if (!t) throw new Error('tabby row not found');
html = html.replace(tabby, () =>
  `<div class="ds-section rv-axo-text">${N}    <div>${N}${t[1].replace(/^      /gm, '      ')}${N}    </div>${N}  </div>${N}` +
  `  <div class="img-row three rv-sections">${N}${items(t[2])}${N}  </div>`);

// The Release: overlook stays beside the text, sections run across under the row
const release = /(<div class="ds-title">The Release<\/div>[\s\S]*?<div class="edit-images">\r?\n      <div><img [^\n]*217-reverie-overlook\.jpg[^\n]*<\/div><\/div>)\r?\n      <div class="img-row three" style="padding:0;width:100%">([\s\S]*?)\r?\n      <\/div>\r?\n    <\/div>\r?\n  <\/div>/;
const r = html.match(release);
if (!r) throw new Error('release row not found');
html = html.replace(release, () => `${r[1]}${N}    </div>${N}  </div>${N}  <div class="img-row three rv-sections">${N}${items(r[2])}${N}  </div>`);

const CSS = `/* the 3 light sections run the whole way across under their section */${N}.img-row.rv-sections{padding:8px 60px 48px}${N}.rv-sections .img-row-item{padding:0 6.5%}${N}@media(max-width:768px){.img-row.rv-sections{padding:0 24px 32px}.rv-sections .img-row-item{padding:0 10%}}${N}`;
const anchor = '/* full bleed render mid page';
if (!html.includes(anchor)) throw new Error('css anchor');
html = html.replace(anchor, CSS + anchor);

fs.writeFileSync(F, html);
const n = (s) => html.split(s).length - 1;
console.log('ends html:', html.trimEnd().endsWith('</html>'), 'boards-popup', n('boards-popup'), 'flipbook-popup', n('flipbook-popup'), 'rv-sections rows', n('class="img-row three rv-sections"'), 'section imgs', n('-reverie-section-'));
