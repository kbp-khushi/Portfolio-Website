import { readFileSync, writeFileSync } from 'fs';

// 22 pills in one wall read as "lists a lot of software". Sorted into four
// groups they answer the question a principal is actually asking: can she
// document, can she model, can she present.
//
// Grouped by what the tool produces, not by vendor. That is deliberate: the
// obvious alternative puts the six generative tools under a heading called AI,
// which rebuilds the separate AI section she took down, only louder. Here each
// one sits with the work it contributes to and carries no special marking.
//
// Each group leads with her strongest tool in it.

const P = 'C:/KHUSHI/Claude/1-Projects/Portfolio-Website/site/index.html';
let html = readFileSync(P, 'utf8');
const before = html.length;

const swap = (o, n, l) => {
  const c = html.split(o).length - 1;
  if (c !== 1) throw new Error(`${l}: ${c} matches`);
  html = html.replace(o, () => n);
  console.log('[ok]', l);
};

// pull every existing pill so the tooltips survive the regroup
const block = html.match(/<div class="ai-tags">([\s\S]*?)<\/div>/);
if (!block) throw new Error('ai-tags block not found');
const pills = {};
for (const m of block[1].matchAll(/<span class="ai-tag" data-tooltip="([^"]*)">([^<]*)<\/span>/g)) {
  pills[m[2]] = m[1];
}
console.log('[ok] recovered', Object.keys(pills).length, 'pills');

const GROUPS = [
  ['documentation', ['Revit', 'AutoCAD', 'Hand Drafting']],
  ['modeling',      ['Rhino', 'SketchUp', '3DS Max', 'Model Making']],
  ['visualization', ['Lumion', 'Enscape', 'Photoshop', 'After Effects', 'Premiere Pro', 'ComfyUI', 'DALL&middot;E']],
  ['layout and research', ['InDesign', 'Illustrator', 'Squarespace', 'Claude Design', 'Claude Code', 'ChatGPT', 'Gemini', 'Microsoft Office']],
];

const placed = GROUPS.flatMap(g => g[1]);
const missing = placed.filter(n => !(n in pills));
const dropped = Object.keys(pills).filter(n => !placed.includes(n));
if (missing.length) throw new Error('not in the original list: ' + missing.join(', '));
if (dropped.length) throw new Error('would be dropped: ' + dropped.join(', '));

const markup = GROUPS.map(([label, names]) =>
  '          <div class="tool-group">\n' +
  `            <div class="tool-group-label">${label}</div>\n` +
  '            <div class="ai-tags">' +
  names.map(n => `<span class="ai-tag" data-tooltip="${pills[n]}">${n}</span>`).join('') +
  '</div>\n' +
  '          </div>').join('\n');

swap('          ' + block[0], markup, 'software sorted into four groups');

swap('.ai-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}',
     '.ai-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}\n' +
     '.tool-group{margin-top:18px}\n' +
     '.tool-group:first-of-type{margin-top:10px}\n' +
     '.tool-group-label{font-family:var(--title);font-size:10px;font-weight:600;letter-spacing:.16em;' +
     'text-transform:uppercase;color:var(--text-light)}',
     'group label style');

// the note said "the generative tools above", which no longer points anywhere
swap('The generative tools above are used for research, iteration and visual studies, and for website development and document preparation.',
     'Generative tools are used for research, iteration and visual studies, and for website development and document preparation.',
     'note no longer refers to a block that has been split up');

// her standing rule: no hyphenations anywhere in her copy
for (const [o, n] of [['form-finding', 'form finding'], ['Real-time', 'Real time'], ['post-production', 'post production']]) {
  const c = html.split(o).length - 1;
  if (c) { html = html.split(o).join(n); console.log('[ok] hyphen removed:', o, '->', n, `(${c})`); }
}

writeFileSync(P, html);
const c = s => html.split(s).length - 1;
console.log('\nbytes', before, '->', html.length,
  '| ends html:', html.trimEnd().endsWith('</html>'),
  '| pills:', c('class="ai-tag"'), '| groups:', c('tool-group-label'),
  '| ends html ok:', html.trimEnd().endsWith('</html>'));
